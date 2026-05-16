import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { getFirebaseDB, getFirebaseStorage } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'
import { logApiPain } from '@/lib/painLogging'

interface FeedbackData {
  rating: number
  feedback?: string
  screenshots?: string[] // base64 encoded screenshots
  userAgent: string
  url: string
  timestamp: string
  userId?: string
}

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  const base64Data = base64.split(',')[1] || base64;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Helper function to upload screenshot to Firebase Storage
async function uploadScreenshotToStorage(
  base64Screenshot: string,
  userId: string | undefined,
  index: number
): Promise<string> {
  try {
    const storage = getFirebaseStorage();
    if (!storage) {
      throw new Error('Firebase Storage not available');
    }

    // Determine MIME type from base64 string
    let mimeType = 'image/jpeg';
    if (base64Screenshot.includes('data:image/png')) {
      mimeType = 'image/png';
    } else if (base64Screenshot.includes('data:image/jpeg') || base64Screenshot.includes('data:image/jpg')) {
      mimeType = 'image/jpeg';
    }

    // Convert base64 to blob
    const blob = base64ToBlob(base64Screenshot, mimeType);

    // Create storage path
    const timestamp = Date.now();
    const userIdPrefix = userId || 'anonymous';
    const fileExtension = mimeType === 'image/png' ? 'png' : 'jpg';
    const storagePath = `feedback-screenshots/${userIdPrefix}/${timestamp}-${index}.${fileExtension}`;

    // Upload to Firebase Storage
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      try {
        const bucket = getStorage().bucket();
        const file = bucket.file(storagePath);
        
        const buffer = Buffer.from(await blob.arrayBuffer());
        await file.save(buffer, {
          metadata: {
            contentType: mimeType,
          },
          public: true, // Make file publicly accessible
        });

        // Get public URL
        const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
        return url;
      } catch (adminError) {
        // Fallback: Try using client SDK if Admin SDK fails
        devLog.warn('⚠️ Admin SDK Storage failed, trying client SDK fallback:', adminError, 'feedback');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, blob, {
          contentType: mimeType,
        });
        
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      }
    } else {
      // Client-side: Use Client SDK (shouldn't happen in API route, but handle gracefully)
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, blob, {
        contentType: mimeType,
      });
      
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    }
  } catch (error) {
    devLog.error('❌ Error uploading screenshot to Storage:', error, 'route');
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json()
    
    // Validate required fields
    if (!body.rating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      )
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    // Upload screenshots to Firebase Storage and get URLs
    const screenshotUrls: string[] = [];
    if (body.screenshots && body.screenshots.length > 0) {
      try {
        const uploadPromises = body.screenshots.map((screenshot, index) =>
          uploadScreenshotToStorage(screenshot, body.userId, index)
        );
        screenshotUrls.push(...(await Promise.all(uploadPromises)));
        devLog.info(`✅ Uploaded ${screenshotUrls.length} screenshot(s) to Firebase Storage`, undefined, 'feedback');
      } catch (uploadError) {
        devLog.error('❌ Error uploading screenshots:', uploadError, 'route');
        // Continue with feedback submission even if screenshot upload fails
        // Screenshots will be empty array
      }
    }

    // Prepare feedback document
    const feedbackDoc = {
      rating: body.rating,
      feedback: body.feedback || '',
      screenshots: screenshotUrls, // Store Storage URLs instead of base64
      screenshotCount: screenshotUrls.length,
      url: body.url,
      userAgent: body.userAgent,
      userId: body.userId || null,
      timestamp: new Date(body.timestamp),
      submittedAt: new Date(),
    };

    // Store in Firestore
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      await db.collection('feedbackSubmissions').add(feedbackDoc);
    } else {
      // Client-side: Use Client SDK (shouldn't happen in API route, but handle gracefully)
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'feedbackSubmissions'), feedbackDoc);
    }
    
    devLog.info('📝 Feedback Received:', {
      rating: body.rating,
      hasFeedback: !!body.feedback,
      screenshotCount: screenshotUrls.length,
      url: body.url,
      timestamp: body.timestamp,
      userAgent: body.userAgent,
      userId: body.userId || 'anonymous'
    }, 'feedback')

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback received successfully! We\'ll review it soon.' 
      },
      { status: 200 }
    )

  } catch (error) {
    devLog.error('❌ Feedback submission error:', error, 'route')
    await logApiPain(request, error, {
      area: 'feedback',
      action: 'submit_failed',
    });

    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
} 