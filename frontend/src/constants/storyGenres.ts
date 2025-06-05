
export interface StoryGenre {
  value: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const STORY_GENRES: StoryGenre[] = [
  { value: 'MAIKLING_KWENTO', label: 'Maikling Kwento', shortLabel: 'M', color: '#e74c3c' },
  { value: 'TULA', label: 'Tula', shortLabel: 'T', color: '#e91e63' },
  { value: 'DULA', label: 'Dula', shortLabel: 'D', color: '#9c27b0' },
  { value: 'NOBELA', label: 'Nobela', shortLabel: 'N', color: '#3f51b5' },
  { value: 'SANAYSAY', label: 'Sanaysay', shortLabel: 'S', color: '#2196f3' },
  { value: 'AWIT', label: 'Awit', shortLabel: 'A', color: '#00bcd4' },
  { value: 'KORIDO', label: 'Korido', shortLabel: 'K', color: '#009688' },
  { value: 'EPIKO', label: 'Epiko', shortLabel: 'E', color: '#4caf50' },
  { value: 'BUGTONG', label: 'Bugtong', shortLabel: 'B', color: '#8bc34a' },
  { value: 'SALAWIKAIN', label: 'Salawikain', shortLabel: 'SL', color: '#cddc39' },
  { value: 'TALUMPATI', label: 'Talumpati', shortLabel: 'TL', color: '#ffc107' },
  { value: 'MITOLOHIYA', label: 'Mitolohiya', shortLabel: 'MT', color: '#ff9800' },
  { value: 'ALAMAT', label: 'Alamat', shortLabel: 'AL', color: '#ff5722' },
  { value: 'PARABULA', label: 'Parabula', shortLabel: 'PR', color: '#795548' },
  { value: 'PABULA', label: 'Pabula', shortLabel: 'PB', color: '#607d8b' }
];

export const getGenreByValue = (value: string): StoryGenre | undefined => {
  return STORY_GENRES.find(genre => genre.value === value);
};
