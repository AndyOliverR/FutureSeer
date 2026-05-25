import { devWarn } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { geocodePlace } from '@/services/geocoding';

export function isAdminSDK(db: unknown): boolean {
  return Boolean(db && typeof (db as { collection?: unknown }).collection === 'function');
}

export async function getVedicReportDoc(
  collectionPath: string[],
  docId: string,
): Promise<{ exists: () => boolean; data: () => Record<string, unknown> | null } | null> {
  const db = getFirebaseDB();
  if (!db) return null;

  try {
    if (isAdminSDK(db)) {
      let ref: any = db.collection(collectionPath[0]);
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      if (ref.doc && typeof ref.doc === 'function') {
        const snapshot = await ref.doc(docId).get();
        return snapshot.exists
          ? { exists: () => true, data: () => snapshot.data() as Record<string, unknown> }
          : { exists: () => false, data: () => null };
      }
      const snapshot = await ref.get();
      return snapshot.exists
        ? { exists: () => true, data: () => snapshot.data() as Record<string, unknown> }
        : { exists: () => false, data: () => null };
    }
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, ...collectionPath, docId);
    const snap = await getDoc(docRef);
    return snap.exists()
      ? { exists: () => true, data: () => snap.data() as Record<string, unknown> }
      : { exists: () => false, data: () => null };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error getting vedic report document:', error, 'vedic');
    }
    return { exists: () => false, data: () => null };
  }
}

export async function setVedicReportDoc(
  collectionPath: string[],
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = getFirebaseDB();
  if (!db) return;

  try {
    if (isAdminSDK(db)) {
      let ref: any = db.collection(collectionPath[0]);
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      if (ref.doc && typeof ref.doc === 'function') {
        await ref.doc(docId).set(data);
      } else {
        await ref.set(data);
      }
      return;
    }
    const { doc, setDoc } = await import('firebase/firestore');
    const docRef = doc(db, ...collectionPath, docId);
    await setDoc(docRef, data);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error setting vedic report document:', error, 'vedic');
    }
  }
}

export async function getCoordinatesWithFallback(place: string): Promise<{
  latitude: number;
  longitude: number;
}> {
  try {
    const coords = await geocodePlace(place);
    if (coords) {
      return { latitude: coords.latitude, longitude: coords.longitude };
    }
  } catch {
    /* fall through */
  }

  const fallbacks: Record<string, { latitude: number; longitude: number }> = {
    mumbai: { latitude: 19.076, longitude: 72.8777 },
    delhi: { latitude: 28.7041, longitude: 77.1025 },
    bangalore: { latitude: 12.9716, longitude: 77.5946 },
    chennai: { latitude: 13.0827, longitude: 80.2707 },
  };

  const placeLower = place.toLowerCase();
  for (const [city, coords] of Object.entries(fallbacks)) {
    if (placeLower.includes(city)) return coords;
  }

  return { latitude: 19.076, longitude: 72.8777 };
}

export type VedicBirthProfile = {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  fullName?: string;
  displayName?: string;
  currentRole?: string;
  skills?: string;
};

export function birthProfileMatches(
  cached: Record<string, unknown>,
  userProfile: VedicBirthProfile,
): boolean {
  return (
    cached.birthDate === userProfile.birthDate &&
    cached.birthTime === userProfile.birthTime &&
    cached.birthPlace === userProfile.birthPlace
  );
}

export const VEDIC_FOCUSED_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
