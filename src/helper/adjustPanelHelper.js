export const initialAdjustments = {
  temperature: 0,
  tint: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  vibrance: 0,
  saturation: 0,
  sharpness: 0,
  clarity: 0,
  invert: false,
};

export const initialColorAdjustments = {
  hue: 0,
  saturation: 0,
  brightness: 0,
};

export const colorSwatches = ["#432835", "#9b4638", "#476997", "#ecb45c"];

export const autoAdjust = () => ({
  temperature: 10,
  tint: 5,
  brightness: 10,
  contrast: 10,
  highlights: 20,
  shadows: -10,
  whites: 15,
  blacks: -15,
  vibrance: 20,
  saturation: 10,
  sharpness: 25,
  clarity: 10,
  invert: false,
});

export const resetAdjustments = () => ({
  adjustments: { ...initialAdjustments },
  colorAdjustments: { ...initialColorAdjustments },
  selectedColor: null,
});