export const initialCropState = {
  selectedAspectRatio: 'freeform',
  rotation: 0,
  verticalPerspective: 0,
  horizontalPerspective: 0,
};

export const aspectRatios = [
  { id: 'freeform', label: 'Freeform' },
  { id: 'original', label: 'Original' },
  { id: '1:1', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '5:4', label: '5:4' },
  { id: '3:4', label: '3:4' },
  { id: '3:2', label: '3:2' },
  { id: '2:3', label: '2:3' },
];

export const smartCrop = () => ({
  selectedAspectRatio: '1:1',
});

export const resetCrop = () => ({
  selectedAspectRatio: 'freeform',
  rotation: 0,
  verticalPerspective: 0,
  horizontalPerspective: 0,
});