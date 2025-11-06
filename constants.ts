import { BrickType } from './types';

export const STANDARD_MORTAR_JOINT_MM = 10;

export const BRICK_TYPES: BrickType[] = [
  { name: 'Standard Brick (UK)', length: 215, height: 65 },
  { name: 'Modular Brick (US)', length: 194, height: 57 },
  { name: 'Queen Brick (US)', length: 200, height: 70 },
  { name: 'King Brick (US)', length: 244, height: 70 },
  { name: 'Standard Block (UK)', length: 440, height: 215 },
  { name: 'Standard Block (US)', length: 397, height: 194 },
];