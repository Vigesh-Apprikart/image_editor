export const hexToRGB = (hex) => {
  if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) || 0;
  let g = parseInt(hex.substring(2, 4), 16) || 0;
  let b = parseInt(hex.substring(4, 6), 16) || 0;
  return { r, g, b };
};

export const applyAdjustmentsToContext = (
  ctx,
  img,
  adjustments,
  colorAdjustments,
  duotone,
  brushMode,
  blurMaskCanvas,
  brushSettings
) => {
  if (!ctx || !img) {
    console.warn("Invalid context or image in applyAdjustmentsToContext");
    return;
  }

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
    filterString += `sepia(${Math.abs(tempValue) * 50}%) hue-rotate(${
      tempValue > 0 ? 20 : -20
    }deg) `;
  }
  if (tint !== 0) filterString += `hue-rotate(${tint}deg) `;
  if (highlights !== 0)
    filterString += `brightness(${100 + highlights / 2}%) `;
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
  tempCanvas.width = img.width || 1;
  tempCanvas.height = img.height || 1;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    console.error("Failed to get temp canvas context");
    return;
  }

  tempCtx.save();
  tempCtx.filter = filterString.trim() || "none";
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

  if (brushMode && blurMaskCanvas) {
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = img.width || 1;
    blurCanvas.height = img.height || 1;
    const blurCtx = blurCanvas.getContext('2d');
    if (!blurCtx) {
      console.error("Failed to get blur canvas context");
      return;
    }
    blurCtx.drawImage(tempCanvas, 0, 0);
    blurCtx.filter = `blur(${Math.max(5, brushSettings.intensity / 10)}px)`;
    blurCtx.drawImage(tempCanvas, 0, 0);

    ctx.save();
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(blurCanvas, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(blurMaskCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  } else {
    ctx.drawImage(tempCanvas, 0, 0);
  }
};

export const drawCanvasHelper = (
  canvas,
  selectedImage,
  activeTool,
  cropState,
  adjustments,
  colorAdjustments,
  shadow,
  duotone,
  brushMode,
  blurMaskCanvas,
  blurMaskCtx,
  brushSettings,
  textElements
) => {
  if (!canvas || !selectedImage) {
    console.warn("Canvas or selected image not available");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context");
    return;
  }
  const img = new Image();

  img.onload = () => {
    const { rotation = 0, verticalPerspective = 0, horizontalPerspective = 0 } = cropState || {};

    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const shadowExtraSpace = shadow.blur + Math.max(Math.abs(shadow.offsetX), Math.abs(shadow.offsetY));
    const newWidth = (img.width * cos + img.height * sin + shadowExtraSpace * 2) || 1;
    const newHeight = (img.width * sin + img.height * cos + shadowExtraSpace * 2) || 1;

    const vScale = 1 + verticalPerspective / 100;
    const hScale = 1 + horizontalPerspective / 100;
    canvas.width = newWidth * hScale;
    canvas.height = newHeight * vScale;

    if (blurMaskCanvas && blurMaskCtx) {
      blurMaskCanvas.width = img.width || 1;
      blurMaskCanvas.height = img.height || 1;
      blurMaskCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      blurMaskCtx.fillRect(0, 0, img.width, img.height);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.shadowOffsetX = shadow.offsetX || 0;
    ctx.shadowOffsetY = shadow.offsetY || 0;
    ctx.shadowBlur = shadow.blur || 0;
    ctx.shadowColor = shadow.color || 'rgba(0,0,0,0)';

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.scale(hScale, vScale);
    ctx.translate(-img.width / 2, -img.height / 2);

    applyAdjustmentsToContext(
      ctx,
      img,
      adjustments,
      colorAdjustments,
      duotone,
      brushMode,
      blurMaskCanvas,
      brushSettings
    );

    // Removed overlay image drawing from canvas, as it's handled by JSX

    // Draw text elements
    textElements.forEach((el) => {
      if (!el.text || !el.fontSize || !el.fontFamily) return;
      ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 'normal'} ${el.fontSize} ${el.fontFamily}`;
      ctx.fillStyle = el.color || '#000000';
      ctx.globalAlpha = el.opacity || 1;
      ctx.textDecoration = el.textDecoration || 'none';
      ctx.fillText(el.text, el.x, el.y + parseInt(el.fontSize));
      ctx.globalAlpha = 1;
    });

    ctx.restore();

    let adjustedCrop = { ...cropState };
    if (cropState.width && cropState.height) {
      const scaleX = canvas.width / (img.width * cos + img.height * sin);
      const scaleY = canvas.height / (img.width * sin + img.height * cos);
      adjustedCrop = {
        x: cropState.x * scaleX,
        y: cropState.y * scaleY,
        width: cropState.width * scaleX,
        height: cropState.height * scaleY,
        aspectRatio: cropState.aspectRatio,
        rotation,
        verticalPerspective,
        horizontalPerspective,
      };
    }

    if (
      activeTool === "crop" &&
      adjustedCrop.width &&
      adjustedCrop.height
    ) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(
        adjustedCrop.x,
        adjustedCrop.y,
        adjustedCrop.width,
        adjustedCrop.height
      );
      ctx.strokeStyle = "#8B5CF6";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        adjustedCrop.x,
        adjustedCrop.y,
        adjustedCrop.width,
        adjustedCrop.height
      );
    }
  };
  img.onerror = () => console.error("Error loading main image");
  img.src = selectedImage;
};

export const startDrawingHelper = (
  e,
  canvas,
  cropState,
  selectedImage,
  setLastX,
  setLastY,
  isMountedRef
) => {
  if (!canvas || !selectedImage) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const { rotation = 0, verticalPerspective = 0, horizontalPerspective = 0 } = cropState;
  const radians = (rotation * Math.PI) / 180;
  const vScale = 1 + verticalPerspective / 100;
  const hScale = 1 + horizontalPerspective / 100;

  const img = new Image();
  img.onload = () => {
    if (!isMountedRef.current) return;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const canvasWidth = img.width * cos + img.height * sin;
    const canvasHeight = img.width * sin + img.height * cos;
    const adjustedX = x - (canvas.width - canvasWidth * hScale) / 2;
    const adjustedY = y - (canvas.height - canvasHeight * vScale) / 2;

    const centerX = img.width / 2;
    const centerY = img.height / 2;
    const rotatedX = centerX + (adjustedX / hScale - centerX) * Math.cos(-radians) - (adjustedY / vScale - centerY) * Math.sin(-radians);
    const rotatedY = centerY + (adjustedX / hScale - centerX) * Math.sin(-radians) + (adjustedY / vScale - centerY) * Math.cos(-radians);

    setLastX(rotatedX);
    setLastY(rotatedY);
  };
  img.onerror = () => console.error("Error loading image in startDrawingHelper");
  img.src = selectedImage;
};

export const drawHelper = (
  e,
  canvas,
  cropState,
  selectedImage,
  brushSettings,
  blurMaskCtx,
  lastX,
  lastY,
  setLastX,
  setLastY,
  setRenderTrigger,
  isMountedRef
) => {
  if (!canvas || !selectedImage || !blurMaskCtx) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const { rotation = 0, verticalPerspective = 0, horizontalPerspective = 0 } = cropState;
  const radians = (rotation * Math.PI) / 180;
  const vScale = 1 + verticalPerspective / 100;
  const hScale = 1 + horizontalPerspective / 100;

  const img = new Image();
  img.onload = () => {
    if (!isMountedRef.current) return;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const canvasWidth = img.width * cos + img.height * sin;
    const canvasHeight = img.width * sin + img.height * cos;
    const adjustedX = x - (canvas.width - canvasWidth * hScale) / 2;
    const adjustedY = y - (canvas.height - canvasHeight * vScale) / 2;

    const centerX = img.width / 2;
    const centerY = img.height / 2;
    const rotatedX = centerX + (adjustedX / hScale - centerX) * Math.cos(-radians) - (adjustedY / vScale - centerY) * Math.sin(-radians);
    const rotatedY = centerY + (adjustedX / hScale - centerX) * Math.sin(-radians) + (adjustedY / vScale - centerY) * Math.cos(-radians);

    blurMaskCtx.beginPath();
    blurMaskCtx.moveTo(lastX, lastY);
    blurMaskCtx.lineTo(rotatedX, rotatedY);
    blurMaskCtx.strokeStyle = brushSettings.type === 'blur'
      ? `rgba(255, 255, 255, ${brushSettings.intensity / 100})`
      : `rgba(0, 0, 0, ${brushSettings.intensity / 100})`;
    blurMaskCtx.lineWidth = brushSettings.size || 1;
    blurMaskCtx.lineCap = 'round';
    blurMaskCtx.stroke();

    setLastX(rotatedX);
    setLastY(rotatedY);

    setRenderTrigger((prev) => prev + 1);
  };
  img.onerror = () => console.error("Error loading image in drawHelper");
  img.src = selectedImage;
};