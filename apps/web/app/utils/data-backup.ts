import { UserData, Bookmark, Highlight, Note, ReadingProgress, StudyPlanProgress } from '../lib/types';
import { VolumeId } from '../lib/scriptures';
import { Theme, FontFamily } from '../lib/types';

export const exportUserData = (
  bookmarks: Bookmark[],
  highlights: Highlight[],
  notes: Note[],
  readingProgress: ReadingProgress,
  studyPlan: StudyPlanProgress | null,
  volumeId: VolumeId,
  fontSize: number,
  lineHeight: number,
  fontFamily: FontFamily,
  theme: Theme,
  showVerseNumbers: boolean
) => {
  const data: UserData = {
    version: 2,
    exportDate: new Date().toISOString(),
    bookmarks,
    highlights,
    notes,
    readingProgress,
    studyPlan,
    settings: {
      volumeId,
      fontSize,
      lineHeight,
      fontFamily,
      theme,
      showVerseNumbers,
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scripture-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importUserData = (
  file: File,
  onSuccess: (data: UserData) => void,
  onError: (error: string) => void
) => {
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data: UserData = JSON.parse(event.target?.result as string);

      if (!data.version || !data.bookmarks) {
        onError('Invalid backup file format');
        return;
      }

      onSuccess(data);
    } catch (error) {
      onError('Error reading file');
    }
  };

  reader.onerror = () => {
    onError('Error reading file');
  };

  reader.readAsText(file);
};
