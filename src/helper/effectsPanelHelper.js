export const initialEffectsState = {
  selectedEffect: '',
  editOptions: {},
  isPopupOpen: { Shadows: false, Duotone: false, Blur: false },
  blurTab: 'Whole Image',
  brushType: 'Add Blur',
  blurState: {
    wholeImageIntensity: 0,
    brushSize: 1,
    brushIntensity: 0,
  },
};

export const effectCategories = {
  'Reset': ['None'],
  'Shadows': ['Glow', 'Drop', 'Outline', 'Curved', 'Page Lift', 'Angled', 'Backdrop'],
  'Duotone': [
    'Custom', 'Cherry', 'Fuchsia', 'Pop', 'Violet', 'Sea Blue', 'Sea Green', 'Mustard',
    'Amber', 'Pomelo', 'Blush', 'Peppermint', 'Mystic', 'Pastel', 'Coral', 'Lavender',
    'Dusk', 'Dawn', 'Myrtle', 'Mint Choc', 'Sepia', 'Mono', 'Classic'
  ],
  'Blur': ['Brush Blur'],
  'Auto Focus': ['Tilt Shift', 'Focus Point', 'Depth of Field', 'Bokeh'],
  'Face Retouch': ['Smooth Skin', 'Brighten Eyes', 'Whiten Teeth', 'Remove Blemishes'],
};

export const baseEffectAdjustments = {
  'None': { adjustments: { brightness: 0, contrast: 0, shadows: 0, sharpness: 0, saturation: 0, temperature: 0, rotation: 0, verticalPerspective: 0, horizontalPerspective: 0 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 }, shadow: null, duotone: null },
  'Glow': { shadow: { offsetX: 0, offsetY: 0, blur: 15, color: '#ff0000', opacity: 0.5, size: 20 } },
  'Drop': { shadow: { offsetX: 5, offsetY: 5, blur: 10, color: '#000000', opacity: 0.5 } },
  'Outline': { shadow: { offsetX: 0, offsetY: 0, blur: 3, color: '#0000ff', opacity: 0.5, size: 15 } },
  'Curved': { shadow: { offsetX: 5, offsetY: 5, blur: 10, color: '#000000', opacity: 0.3 } },
  'Page Lift': { shadow: { offsetX: 10, offsetY: 10, blur: 5, color: '#000000', opacity: 0.3 } },
  'Angled': { shadow: { offsetX: 5, offsetY: 5, blur: 10, color: '#000000', opacity: 0.3 } },
  'Backdrop': { shadow: { offsetX: 0, offsetY: 0, blur: 15, color: '#000000', opacity: 0.5 } },
  'Custom': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 150, saturation: 20, brightness: 0 }, duotone: { highlight: '#eeeeee', shadow: '#111111', intensity: 100 } },
  'Cherry': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 0, saturation: 50, brightness: 0 }, duotone: { highlight: '#e05353', shadow: '#25184f', intensity: 100 } },
  'Fuchsia': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 330, saturation: 60, brightness: 0 }, duotone: { highlight: '#ff4076', shadow: '#021f53', intensity: 100 } },
  'Pop': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 300, saturation: 70, brightness: 0 }, duotone: { highlight: '#fa50cb', shadow: '#1a0b8c', intensity: 100 } },
  'Violet': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 280, saturation: 40, brightness: 0 }, duotone: { highlight: '#935eb2', shadow: '#242659', intensity: 100 } },
  'Sea Blue': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 200, saturation: 50, brightness: 0 }, duotone: { highlight: '#2887bf', shadow: '#242659', intensity: 100 } },
  'Sea Green': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 160, saturation: 60, brightness: 0 }, duotone: { highlight: '#02aa6d', shadow: '#251863', intensity: 100 } },
  'Mustard': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 50, saturation: 80, brightness: 0 }, duotone: { highlight: '#fdcf21', shadow: '#311955', intensity: 100 } },
  'Amber': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 45, saturation: 70, brightness: 0 }, duotone: { highlight: '#fce746', shadow: '#fb452f', intensity: 100 } },
  'Pomelo': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 50, saturation: 75, brightness: 0 }, duotone: { highlight: '#fada15', shadow: '#fa5181', intensity: 100 } },
  'Blush': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 350, saturation: 30, brightness: 0 }, duotone: { highlight: '#f6d2d4', shadow: '#f24578', intensity: 100 } },
  'Peppermint': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 180, saturation: 60, brightness: 0 }, duotone: { highlight: '#86f8fc', shadow: '#472468', intensity: 100 } },
  'Mystic': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 190, saturation: 65, brightness: 0 }, duotone: { highlight: '#85f8fc', shadow: '#c7156e', intensity: 100 } },
  'Pastel': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 180, saturation: 40, brightness: 0 }, duotone: { highlight: '#ade6e6', shadow: '#d4476b', intensity: 100 } },
  'Coral': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 30, saturation: 35, brightness: 0 }, duotone: { highlight: '#eeead0', shadow: '#ca3d33', intensity: 100 } },
  'Lavender': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 320, saturation: 40, brightness: 0 }, duotone: { highlight: '#ebc6d9', shadow: '#035fa5', intensity: 100 } },
  'Dusk': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 200, saturation: 30, brightness: 0 }, duotone: { highlight: '#ade6e6', shadow: '#964880', intensity: 100 } },
  'Dawn': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 30, saturation: 45, brightness: 0 }, duotone: { highlight: '#dbb58f', shadow: '#944a7f', intensity: 100 } },
  'Myrtle': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 140, saturation: 50, brightness: 0 }, duotone: { highlight: '#cdfab1', shadow: '#1d9371', intensity: 100 } },
  'Mint Choc': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 150, saturation: 55, brightness: 0 }, duotone: { highlight: '#caf5b0', shadow: '#301854', intensity: 100 } },
  'Sepia': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 30, saturation: 20, brightness: 0 }, duotone: { highlight: '#d1ba8e', shadow: '#2b1c34', intensity: 100 } },
  'Mono': { adjustments: { sepia: 100, grayscale: 100 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 }, duotone: { highlight: '#939ba9', shadow: '#041f23', intensity: 100 } },
  'Classic': { adjustments: { sepia: 100 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 }, duotone: { highlight: '#ffffff', shadow: '#22060d', intensity: 100 } },
  'Brush Blur': { adjustments: { sharpness: 0 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Tilt Shift': { adjustments: { sharpness: -20, contrast: 30, saturation: 20 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Focus Point': { adjustments: { sharpness: -10, brightness: 10 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Depth of Field': { adjustments: { sharpness: -25, contrast: 10 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Bokeh': { adjustments: { sharpness: -30, brightness: 20, saturation: 30 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Smooth Skin': { adjustments: { sharpness: -5, brightness: 5 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Brighten Eyes': { adjustments: { brightness: 20, contrast: 10 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Whiten Teeth': { adjustments: { brightness: 30, saturation: -20 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
  'Remove Blemishes': { adjustments: { sharpness: -3, brightness: 2 }, colorAdjustments: { hue: 0, saturation: 0, brightness: 0 } },
};

export const initializeEditOptions = (effect) => {
  switch (effect) {
    case 'Glow':
      return { size: 20, blurAmount: 15, color: '#ff0000', intensity: 50 };
    case 'Drop':
      return { blurAmount: 10, angle: 45, distance: 15, color: '#000000', intensity: 50 };
    case 'Outline':
      return { size: 15, color: '#0000ff', intensity: 50 };
    case 'Curved':
      return { blurAmount: 10, distance: 20, curve: 30, color: '#000000', intensity: 30 };
    case 'Page Lift':
      return { blurAmount: 5, distance: 15, curve: 20, color: '#000000', intensity: 30 };
    case 'Angled':
      return { blurAmount: 10, rotation: 30, color: '#000000', intensity: 30 };
    case 'Backdrop':
      return { blurAmount: 15, direction: 0, color: '#000000', intensity: 50 };
    case 'Custom':
    case 'Cherry':
    case 'Fuchsia':
    case 'Pop':
    case 'Violet':
    case 'Sea Blue':
    case 'Sea Green':
    case 'Mustard':
    case 'Amber':
    case 'Pomelo':
    case 'Blush':
    case 'Peppermint':
    case 'Mystic':
    case 'Pastel':
    case 'Coral':
    case 'Lavender':
    case 'Dusk':
    case 'Dawn':
    case 'Myrtle':
    case 'Mint Choc':
    case 'Sepia':
    case 'Mono':
    case 'Classic':
      return {
        highlight: baseEffectAdjustments[effect].duotone.highlight,
        shadow: baseEffectAdjustments[effect].duotone.shadow,
        intensity: baseEffectAdjustments[effect].duotone.intensity
      };
    default:
      return {};
  }
};

export const hexToRGBA = (hex, opacity) => {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const hexToRGB = (hex) => {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

export const applyAdjustmentsToContext = (ctx, img, adjustments, colorAdjustments, duotone, shadow) => {
  const {
    brightness = 0,
    contrast = 0,
    saturation = 0,
    vibrance = 0,
    invert = false,
    temperature = 0,
    tint = 0,
    sharpness = 0,
    clarity = 0,
    grayscale = 0,
    highlights = 0,
    shadows = 0,
    whites = 0,
    blacks = 0,
    sepia = 0,
  } = adjustments || {};

  const {
    hue: colorHue = 0,
    saturation: colorSaturation = 0,
    brightness: colorBrightness = 0,
  } = colorAdjustments || {};

  let filterString = "";
  if (brightness !== 0 || colorBrightness !== 0)
    filterString += `brightness(${100 + brightness + colorBrightness}%) `;
  if (contrast !== 0) filterString += `contrast(${100 + contrast}%) `;
  if (saturation !== 0 || colorSaturation !== 0)
    filterString += `saturate(${100 + saturation + colorSaturation}%) `;
  if (vibrance !== 0) filterString += `saturate(${100 + vibrance}%) `;
  if (colorHue !== 0) filterString += `hue-rotate(${colorHue}deg) `;
  if (invert) filterString += `invert(100%) `;
  if (temperature !== 0) {
    const tempValue = temperature / 100;
    filterString += `sepia(${Math.abs(tempValue) * 50}%) hue-rotate(${tempValue > 0 ? 20 : -20}deg) `;
  }
  if (tint !== 0) filterString += `hue-rotate(${tint}deg) `;
  if (highlights !== 0) filterString += `brightness(${100 + highlights / 2}%) `;
  if (shadows !== 0) filterString += `contrast(${100 + shadows / 2}%) `;
  if (whites !== 0) filterString += `brightness(${100 + whites / 2}%) `;
  if (blacks !== 0) filterString += `contrast(${100 - blacks / 2}%) `;
  if (clarity !== 0) filterString += `contrast(${100 + clarity}%) `;
  if (sharpness !== 0) {
    const blurAmount = Math.max(0, -sharpness / 10);
    filterString += `blur(${blurAmount}px) `;
  }
  if (grayscale !== 0) filterString += `grayscale(${grayscale}) `;
  if (sepia !== 0) filterString += `sepia(${sepia}%) `;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.save();
  tempCtx.filter = filterString.trim();
  tempCtx.drawImage(img, 0, 0);
  tempCtx.restore();

  if (duotone) {
    const { highlight, shadow: shadowColor, intensity } = duotone;
    const highlightRGB = hexToRGB(highlight);
    const shadowRGB = hexToRGB(shadowColor);
    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    const originalData = tempCtx.getImageData(0, 0, img.width, img.height).data;

    for (let i = 0; i < data.length; i += 4) {
      const r = originalData[i];
      const g = originalData[i + 1];
      const b = originalData[i + 2];
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const t = luminance;

      const duotoneR = shadowRGB.r + (highlightRGB.r - shadowRGB.r) * t;
      const duotoneG = shadowRGB.g + (highlightRGB.g - shadowRGB.g) * t;
      const duotoneB = shadowRGB.b + (highlightRGB.b - shadowRGB.b) * t;

      const blendFactor = intensity / 100;
      data[i] = r + (duotoneR - r) * blendFactor;
      data[i + 1] = g + (duotoneG - g) * blendFactor;
      data[i + 2] = b + (duotoneB - b) * blendFactor;
    }

    tempCtx.putImageData(imageData, 0, 0);
  }

  ctx.save();
  if (shadow) {
    ctx.shadowOffsetX = shadow.offsetX || 0;
    ctx.shadowOffsetY = shadow.offsetY || 0;
    ctx.shadowBlur = shadow.blur || 0;
    ctx.shadowColor = shadow.color || 'rgba(0,0,0,0)';
  }
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
};

export const mapOptionsToEffect = (effect, options, effectCategories, baseEffectAdjustments, blurTab, blurState) => {
  let adjustments = {};
  let colorAdjustments = {};
  let shadow = null;
  let duotone = null;

  if (effectCategories['Shadows'].includes(effect)) {
    shadow = { ...baseEffectAdjustments[effect].shadow, ...options };
    switch (effect) {
      case 'Glow':
        shadow.offsetX = 0;
        shadow.offsetY = 0;
        shadow.blur = options.blurAmount + options.size / 5;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        shadow.size = options.size;
        break;
      case 'Drop':
        const angleRadDrop = (options.angle * Math.PI) / 180;
        shadow.offsetX = Math.cos(angleRadDrop) * options.distance;
        shadow.offsetY = Math.sin(angleRadDrop) * options.distance;
        shadow.blur = options.blurAmount;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        break;
      case 'Outline':
        shadow.offsetX = 0;
        shadow.offsetY = 0;
        shadow.blur = options.size / 5;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        shadow.size = options.size;
        break;
      case 'Curved':
        const curveAngleRad = (options.curve * Math.PI) / 180;
        shadow.offsetX = Math.cos(curveAngleRad) * options.distance;
        shadow.offsetY = Math.sin(curveAngleRad) * options.distance;
        shadow.blur = options.blurAmount;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        break;
      case 'Page Lift':
        const liftAngleRad = (options.curve * Math.PI) / 180;
        shadow.offsetX = Math.cos(liftAngleRad) * options.distance;
        shadow.offsetY = Math.sin(liftAngleRad) * options.distance;
        shadow.blur = options.blurAmount;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        break;
      case 'Angled':
        const rotationRad = (options.rotation * Math.PI) / 180;
        shadow.offsetX = Math.cos(rotationRad) * 10;
        shadow.offsetY = Math.sin(rotationRad) * 10;
        shadow.blur = options.blurAmount;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        break;
      case 'Backdrop':
        const directionRad = (options.direction * Math.PI) / 180;
        shadow.offsetX = Math.cos(directionRad) * 5;
        shadow.offsetY = Math.sin(directionRad) * 5;
        shadow.blur = options.blurAmount;
        shadow.color = hexToRGBA(options.color, options.intensity / 100);
        shadow.opacity = options.intensity / 100;
        break;
      default:
        break;
    }
  } else if (effectCategories['Duotone'].includes(effect)) {
    adjustments = { ...baseEffectAdjustments[effect].adjustments };
    colorAdjustments = { ...baseEffectAdjustments[effect].colorAdjustments };
    duotone = {
      highlight: options.highlight,
      shadow: options.shadow,
      intensity: options.intensity
    };
  } else if (effectCategories['Blur'].includes(effect)) {
    adjustments = { ...baseEffectAdjustments[effect].adjustments };
    colorAdjustments = { ...baseEffectAdjustments[effect].colorAdjustments };
    if (blurTab === 'Whole Image') {
      adjustments.sharpness = -blurState.wholeImageIntensity;
    }
  } else {
    adjustments = { ...baseEffectAdjustments[effect].adjustments };
    colorAdjustments = { ...baseEffectAdjustments[effect].colorAdjustments };
  }

  return { adjustments, colorAdjustments, shadow, duotone };
};

export const removeBlur = (setBlurState, setBrushType, setBlurTab, selectedEffect, editOptions, editorRef, mapOptionsToEffect) => {
  setBlurState({
    wholeImageIntensity: 0,
    brushSize: 1,
    brushIntensity: 0,
  });
  setBrushType('Add Blur');
  setBlurTab('Whole Image');

  const { adjustments, colorAdjustments, shadow, duotone } = mapOptionsToEffect(selectedEffect, editOptions);
  adjustments.sharpness = 0;

  if (!editorRef.current) {
    console.error('EditorRef is not initialized. Cannot remove blur.');
    return;
  }

  try {
    editorRef.current.applyFilter({ adjustments, colorAdjustments, duotone });
    editorRef.current.resetBrush();
    editorRef.current.disableBrushMode();
  } catch (error) {
    console.error('Error removing blur:', error);
  }
};

export const resetEverything = (setSelectedEffect, setEditOptions, setIsPopupOpen, setBlurState, setBrushType, setBlurTab, editorRef) => {
  setSelectedEffect('None');
  setEditOptions({});
  setIsPopupOpen({ Shadows: false, Duotone: false, Blur: false });
  setBlurState({
    wholeImageIntensity: 0,
    brushSize: 1,
    brushIntensity: 0,
  });
  setBrushType('Add Blur');
  setBlurTab('Whole Image');

  const { adjustments, colorAdjustments, shadow, duotone } = baseEffectAdjustments['None'];

  if (!editorRef.current) {
    console.error('EditorRef is not initialized. Cannot reset.');
    return;
  }

  try {
    editorRef.current.applyShadow({ offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0)', opacity: 0 });
    editorRef.current.applyFilter({ adjustments, colorAdjustments, duotone });
    editorRef.current.resetBrush();
    editorRef.current.disableBrushMode();
  } catch (error) {
    console.error('Error resetting everything:', error);
  }
};