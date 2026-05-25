import type { UserProfile } from '@/lib/firebase';

/** Birth + display fields passed from the Vedic tool page into focused report panels and APIs. */
export type VedicFocusedReportUserInput = Pick<
  UserProfile,
  'birthDate' | 'birthTime' | 'birthPlace' | 'fullName' | 'displayName'
> & {
  currentRole?: string;
  skills?: string;
  profession?: string;
};

export function toVedicFocusedReportApiProfile(
  profile: VedicFocusedReportUserInput,
): Record<string, string | undefined> {
  return {
    birthDate: profile.birthDate,
    birthTime: profile.birthTime || '12:00:00',
    birthPlace: profile.birthPlace,
    fullName: profile.fullName ?? profile.displayName,
    displayName: profile.displayName,
    currentRole: profile.currentRole ?? profile.profession,
    skills: profile.skills,
  };
}
