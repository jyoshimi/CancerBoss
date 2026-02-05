export interface CellType {
  id: string;
  name: string;
  color: number;
  resistanceType: number;
}

export const CELL_TYPES: Record<string, CellType> = {
  SENSITIVE: {
    id: 'sensitive',
    name: 'Sensitive',
    color: 0x00ff00,
    resistanceType: 0
  },
  RESISTANT_1: {
    id: 'resistant_1',
    name: 'Resistant-1',
    color: 0xffaa00,
    resistanceType: 1
  },
  RESISTANT_2: {
    id: 'resistant_2',
    name: 'Resistant-2',
    color: 0xff00ff,
    resistanceType: 2
  },
  DOUBLY_RESISTANT: {
    id: 'doubly_resistant',
    name: 'Doubly-Resistant',
    color: 0xff0000,
    resistanceType: 3
  }
};

export function getCellTypeByResistance(resistanceType: number): CellType {
  switch (resistanceType) {
    case 0: return CELL_TYPES.SENSITIVE;
    case 1: return CELL_TYPES.RESISTANT_1;
    case 2: return CELL_TYPES.RESISTANT_2;
    case 3: return CELL_TYPES.DOUBLY_RESISTANT;
    default: return CELL_TYPES.SENSITIVE;
  }
}

export function getRandomCellType(proportionResistant: number): CellType {
  if (Math.random() < proportionResistant) {
    const resistanceType = Math.floor(Math.random() * 3) + 1;
    return getCellTypeByResistance(resistanceType);
  }
  return CELL_TYPES.SENSITIVE;
}
