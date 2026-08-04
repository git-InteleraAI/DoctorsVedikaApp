/**
 * frontend/src/modules/patient/video/VideoScreen.tsx
 * Re-exporting EducationalVideosScreen feature module for patient navigation.
 */
import { EducationalVideosScreen } from '../../../features/educationalVideos/screens/EducationalVideosScreen';

export function VideoScreen() {
  return <EducationalVideosScreen />;
}
