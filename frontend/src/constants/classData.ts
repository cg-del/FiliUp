
export interface ClassInfo {
  id: string;
  name: string;
  code: string;
  section: string;
  grade: string;
}

export const CLASS_DATA: Record<string, ClassInfo> = {
  '3-matatag': {
    id: '3-matatag',
    name: '3 Matatag',
    code: 'CLS-3MT-001',
    section: 'Matatag',
    grade: '3'
  },
  '3-masigla': {
    id: '3-masigla',
    name: '3 Masigla',
    code: 'CLS-3MS-002',
    section: 'Masigla',
    grade: '3'
  },
  '3-mabini': {
    id: '3-mabini',
    name: '3 Mabini',
    code: 'CLS-3MB-003',
    section: 'Mabini',
    grade: '3'
  }
};

export const getClassInfo = (classId: string): ClassInfo | undefined => {
  return CLASS_DATA[classId];
};
