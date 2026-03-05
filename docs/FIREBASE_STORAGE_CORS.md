# Firebase Storage CORS configuration

Face and palm image uploads from the profile page use the Firebase Web SDK and upload directly from the browser to Firebase Storage. If the Storage bucket does not allow your app's origin in CORS, uploads will fail with errors like:

- `Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy`
- `Response to preflight request doesn't pass access control check: It does not have HTTP ok status`

CORS for Firebase Storage (Google Cloud Storage) is configured in the **Google Cloud Console**, not in application code.

## Configure CORS on the Storage bucket

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project that backs your Firebase app (e.g. `futureseer-7abcd5`).

2. Go to **Cloud Storage** → **Buckets** and open the bucket used by Firebase Storage (usually `your-project-id.appspot.com`).

3. Create or edit a **CORS configuration** for the bucket:
   - In the bucket details, use the **Permissions** tab or the **Configuration** tab (depending on UI) to set CORS.
   - Alternatively, use `gsutil` (see below).

4. Allow your app origins. You must include:
   - **Development:** `http://localhost:3000` (and `http://127.0.0.1:3000` if you use it)
   - **Production:** your production origin, e.g. `https://futureseer.app` or `https://www.futureseer.app`

## Example: CORS JSON for gsutil

Create a file `cors.json`:

```json
[
  {
    "origin": ["http://localhost:3000", "http://127.0.0.1:3000", "https://futureseer.app", "https://www.futureseer.app"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

Then apply it to your bucket (replace `your-bucket-name` with your Firebase Storage bucket name):

```bash
gsutil cors set cors.json gs://your-bucket-name
```

## Official documentation

- [Configure CORS on Cloud Storage](https://cloud.google.com/storage/docs/configuring-cors) (Google Cloud)
- [Firebase Storage – CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration) (Firebase)

## If you cannot change CORS

If you cannot modify bucket CORS (e.g. shared or locked-down project), you can use an **upload proxy API route**: the browser uploads to your Next.js API (same origin, no CORS), and the API uploads to Firebase Storage using the Admin SDK.

**Profile face and palm photos:** The app uses this approach. The profile page uploads to `POST /api/profile/upload-photo` (multipart form with `file` and `type`), and the API uses the Firebase Admin SDK to write to Storage and returns a signed URL. No CORS configuration is required for these uploads.

---

## Profile photo upload – what to put where

If uploads fail with **500** or **"bucket does not exist" (404)**, set the following so the upload proxy can find your Storage bucket.

### 1. Get the exact Storage bucket name

1. Open [Firebase Console](https://console.firebase.google.com) and select your project (e.g. **futureseer-7abcd5**).
2. Go to **Build → Storage**.
3. If you see **Get started**, click it and finish the steps so the default bucket is created.
4. Once Storage is set up, the bucket name is shown in the UI (e.g. in the Storage URL or in **Project settings → General** under "Storage bucket"). It is usually one of:
   - `your-project-id.appspot.com` (e.g. `futureseer-7abcd5.appspot.com`)
   - `your-project-id.firebasestorage.app` (e.g. `futureseer-7abcd5.firebasestorage.app`)
5. Copy that name **without** any `gs://` prefix.

### 2. Set env in `.env.local`

In your project root, in **`.env.local`**, set **one** of these (use the bucket name you copied):

**Option A – use the same variable for client and server (recommended):**

```env
# Under "Firebase Configuration (Client-side public keys)" or anywhere in the file:
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=futureseer-7abcd5.appspot.com
```

Replace `futureseer-7abcd5.appspot.com` with your **exact** bucket name (e.g. `futureseer-7abcd5.firebasestorage.app` if that’s what the Console shows).

**Option B – separate server-only variable:**

```env
# Under "Firebase Admin SDK Configuration (Server-side only)":
FIREBASE_ADMIN_STORAGE_BUCKET=futureseer-7abcd5.appspot.com
```

The upload API uses, in order: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, then `FIREBASE_ADMIN_STORAGE_BUCKET`. You only need one of them set.

### 3. Same project for Admin and Storage

The Firebase Admin credentials must be for the **same** project that owns the Storage bucket. In `.env.local`:

- `FIREBASE_ADMIN_PROJECT_ID` must match the project that has the bucket (e.g. `futureseer-7abcd5`).
- The bucket name (e.g. `futureseer-7abcd5.appspot.com`) must belong to that project.

### 4. Restart and test

1. Save `.env.local`.
2. Restart the dev server: stop it (Ctrl+C), then run `pnpm dev` again.
3. On the profile page, try uploading a face or palm photo.

If you still get **404 "bucket does not exist"**, the bucket name in `.env.local` does not match the bucket in Firebase. Use the exact name from Firebase Console (Storage or Project settings).
