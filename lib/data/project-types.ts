import type { ProjectType } from '@/lib/assessment/types';

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'neubau',
    iconName: 'Building2',
    legalRef: '§2 Abs. 2 LBO BW',
    accentColor: 'amber',
  },
  {
    id: 'anbau',
    iconName: 'SquarePlus',
    legalRef: '§2 Abs. 13 LBO BW',
    accentColor: 'blue',
  },
  {
    id: 'aufstockung',
    iconName: 'ArrowUpFromLine',
    legalRef: '§2 Abs. 13 LBO BW',
    accentColor: 'blue',
  },
  {
    id: 'umbau',
    iconName: 'Wrench',
    legalRef: '§2 Abs. 13 LBO BW',
    accentColor: 'blue',
  },
  {
    id: 'nutzungsaenderung',
    iconName: 'ArrowLeftRight',
    legalRef: '§50 Abs. 2 LBO BW',
    accentColor: 'blue',
  },
  {
    id: 'abbruch',
    iconName: 'Hammer',
    legalRef: '§61 LBO BW',
    accentColor: 'blue',
  },
];
