export type GameMode = 'lobby' | 'local' | 'computer' | 'online';

export interface TimeControlOption {
  id: string;
  label: string;      // e.g. "10+5"
  category: string;   // e.g. "Rapid"
  clockTime: string;  // e.g. "10:00"
}

export const TIME_CONTROLS: TimeControlOption[] = [
  { id: '1min',  label: '1+0',   category: 'Bullet',  clockTime: '1:00'  },
  { id: '1_1',   label: '1+1',   category: 'Bullet',  clockTime: '1:00'  },
  { id: '2_1',   label: '2+1',   category: 'Bullet',  clockTime: '2:00'  },
  { id: '3min',  label: '3+0',   category: 'Blitz',   clockTime: '3:00'  },
  { id: '3_2',   label: '3+2',   category: 'Blitz',   clockTime: '3:00'  },
  { id: '5min',  label: '5+0',   category: 'Blitz',   clockTime: '5:00'  },
  { id: '5_3',   label: '5+3',   category: 'Blitz',   clockTime: '5:00'  },
  { id: '10min', label: '10+0',  category: 'Rapid',   clockTime: '10:00' },
  { id: '10_5',  label: '10+5',  category: 'Rapid',   clockTime: '10:00' },
  { id: '15_10', label: '15+10', category: 'Rapid',   clockTime: '15:00' },
  { id: '30min', label: '30+0',  category: 'Classic', clockTime: '30:00' },
  { id: '30_20', label: '30+20', category: 'Classic', clockTime: '30:00' },
];
