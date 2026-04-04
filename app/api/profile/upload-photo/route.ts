/**
 * POST /api/profile/upload-photo
 *
 * Upload face or palm photo via same-origin proxy to avoid CORS with Firebase Storage.
 * Body: multipart/form-data with "file" (image) and "type" ("face" | "palm").
 * Header: Authorization: Bearer <Firebase ID token>
 * Returns: { url: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { logServerError } from '@/lib/serverErrorLogging';

export const dynamic = 'force-dynamic';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set(['face', 'palm']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const typeRaw = formData.get('type');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing or invalid file' }, { status: 400 });
    }
    const type = String(typeRaw ?? '').toLowerCase();
    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid type; use "face" or "palm"' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }
    const contentType = file.type || 'image/jpeg';
    if (!ALLOWED_MIME.has(contentType)) {
      return NextResponse.json({ error: 'Invalid file type; use image (JPEG, PNG, WebP, GIF)' }, { status: 400 });
    }

    const envBucket =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_ADMIN_STORAGE_BUCKET;
    if (!envBucket) {
      return NextResponse.json(
        {
          error:
            'Server storage not configured. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET or FIREBASE_ADMIN_STORAGE_BUCKET in .env.local (see docs/FIREBASE_STORAGE_CORS.md).',
          code: 'STORAGE_CONFIG',
        },
        { status: 503 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `users/${uid}/${type}_${Date.now()}`;

    const bucketNames = [envBucket];
    if (envBucket.endsWith('.appspot.com')) {
      bucketNames.push(envBucket.replace(/\.appspot\.com$/, '.firebasestorage.app'));
    } else if (envBucket.endsWith('.firebasestorage.app')) {
      bucketNames.push(envBucket.replace(/\.firebasestorage\.app$/, '.appspot.com'));
    }

    type GcsBucketFile = {
      save: (buf: Buffer, opts: object) => Promise<unknown>;
      getSignedUrl: (opts: { action: string; expires: string }) => Promise<[string]>;
    };
    let bucketFile: GcsBucketFile;

    try {
      let lastErr: unknown;
      for (const bucketName of bucketNames) {
        try {
          const bucket = getStorage().bucket(bucketName);
          // GCS File; DOM `File` in lib causes a name clash without assertion
          bucketFile = bucket.file(path) as GcsBucketFile;
          await bucketFile.save(buffer, {
            metadata: {
              contentType,
              metadata: { uploadedBy: uid },
            },
          });
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const msg = String((e as Error)?.message ?? '');
          const is404 =
            (e as { code?: number; status?: number })?.code === 404 ||
            (e as { code?: number; status?: number })?.status === 404 ||
            msg.includes('does not exist') ||
            msg.includes('notFound') ||
            JSON.stringify(e).includes('notFound');
          if (!is404 || bucketNames.indexOf(bucketName) === bucketNames.length - 1) throw e;
        }
      }
      if (lastErr) throw lastErr;
    } catch (saveErr) {
      console.error('[upload-photo] storage save', saveErr);
      try {
        await logServerError({
          area: 'profile-setup',
          action: 'upload_photo',
          message: saveErr instanceof Error ? saveErr.message : 'Storage write failed',
          route: request.nextUrl.pathname,
          meta: { code: 'STORAGE_WRITE', hint: 'See server logs for full stack' },
        });
      } catch {
        // ignore logging failures
      }
      return NextResponse.json({ error: 'Storage write failed', code: 'STORAGE_WRITE' }, { status: 500 });
    }

    let signedUrl: string;
    try {
      const [url] = await bucketFile!.getSignedUrl({
        action: 'read',
        expires: '03-01-2040',
      });
      signedUrl = url;
    } catch (urlErr) {
      console.error('[upload-photo] signedUrl', urlErr);
      try {
        await logServerError({
          area: 'profile-setup',
          action: 'upload_photo',
          message: urlErr instanceof Error ? urlErr.message : 'Signed URL failed',
          route: request.nextUrl.pathname,
          meta: { code: 'SIGNED_URL', hint: 'See server logs for full stack' },
        });
      } catch {
        // ignore logging failures
      }
      return NextResponse.json(
        { error: 'Could not create download link for the photo', code: 'SIGNED_URL' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error('[upload-photo]', err);
    try {
      await logServerError({
        area: 'profile-setup',
        action: 'upload_photo',
        message: err instanceof Error ? err.message : 'Unknown upload-photo error',
        route: request.nextUrl.pathname,
        meta: {
          code: 'UPLOAD_FAILED',
          hint: 'See server logs for full stack',
        },
      });
    } catch {
      // ignore logging failures
    }
    return NextResponse.json({ error: 'Upload failed', code: 'UPLOAD_FAILED' }, { status: 500 });
  }
}
