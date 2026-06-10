/**
 * Aspect ratios offered by the Pro "crop to ratio" option. `original` (no
 * crop) is the implicit default and is not in this list. Center-crop only —
 * we trim the longer dimension evenly from both sides.
 */
export interface CropAspect {
  id: string;
  label: string;
  w: number;
  h: number;
}

export const CROP_ASPECTS: CropAspect[] = [
  { id: '1-1', label: 'Square — 1:1 (Etsy, Instagram)', w: 1, h: 1 },
  { id: '4-5', label: 'Portrait — 4:5 (Instagram)', w: 4, h: 5 },
  { id: '3-2', label: 'Photo — 3:2', w: 3, h: 2 },
  { id: '4-3', label: 'Standard — 4:3', w: 4, h: 3 },
  { id: '16-9', label: 'Wide — 16:9', w: 16, h: 9 },
];

export const NO_CROP_ID = 'original';

export function findCropAspect(id: string): CropAspect | undefined {
  return CROP_ASPECTS.find((aspect) => aspect.id === id);
}
