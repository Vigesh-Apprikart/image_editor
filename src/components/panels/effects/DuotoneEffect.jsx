import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./DuotoneEffect.css";

const DuotoneEffect = ({ thumbnailSrc, highlight, shadow, intensity, effectName, onSelect, isSelected, adjustments, colorAdjustments }) => {
  const canvasRef = useRef(null);
  const [localHighlight, setLocalHighlight] = useState(highlight);
  const [localShadow, setLocalShadow] = useState(shadow);
  const [localIntensity, setLocalIntensity] = useState(intensity);

  // Sync local state with props when they change
  useEffect(() => {
    setLocalHighlight(highlight);
    setLocalShadow(shadow);
    setLocalIntensity(intensity);
  }, [highlight, shadow, intensity]);

  const hexToRGB = (hex) => {
    hex = hex.replace(/^#/, '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  };

  const applyAdjustmentsToCanvas = (ctx, img, adjustments, colorAdjustments) => {
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

    ctx.save();
    ctx.filter = filterString.trim();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const applyDuotoneToCanvas = (canvas, img, highlight, shadow, intensity, adjustments, colorAdjustments) => {
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply standard adjustments first
    applyAdjustmentsToCanvas(ctx, img, adjustments, colorAdjustments);

    // Apply duotone effect
    const highlightRGB = hexToRGB(highlight);
    const shadowRGB = hexToRGB(shadow);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Store original pixel values after adjustments
    const originalData = ctx.getImageData(0, 0, img.width, img.height).data;

    for (let i = 0; i < data.length; i += 4) {
      const r = originalData[i];
      const g = originalData[i + 1];
      const b = originalData[i + 2];
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const t = luminance;

      // Calculate the duotone color
      const duotoneR = shadowRGB.r + (highlightRGB.r - shadowRGB.r) * t;
      const duotoneG = shadowRGB.g + (highlightRGB.g - shadowRGB.g) * t;
      const duotoneB = shadowRGB.b + (highlightRGB.b - shadowRGB.b) * t;

      // Blend between original color and duotone color based on intensity
      const blendFactor = intensity / 100;
      data[i] = r + (duotoneR - r) * blendFactor;     // Red
      data[i + 1] = g + (duotoneG - g) * blendFactor; // Green
      data[i + 2] = b + (duotoneB - b) * blendFactor; // Blue
      // Alpha channel remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    if (!thumbnailSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const img = new Image();
    img.crossOrigin = "Anonymous"; // In case the image is from a different origin
    img.onload = () => {
      applyDuotoneToCanvas(canvas, img, localHighlight, localShadow, localIntensity, adjustments, colorAdjustments);
    };
    img.src = thumbnailSrc;
  }, [thumbnailSrc, localHighlight, localShadow, localIntensity, adjustments, colorAdjustments]);

  const handleClick = () => {
    onSelect({ highlight: localHighlight, shadow: localShadow, intensity: localIntensity, effectName });
  };

  const handleHighlightChange = (e) => {
    const newHighlight = e.target.value;
    setLocalHighlight(newHighlight);
    onSelect({ highlight: newHighlight, shadow: localShadow, intensity: localIntensity, effectName });
  };

  const handleShadowChange = (e) => {
    const newShadow = e.target.value;
    setLocalShadow(newShadow);
    onSelect({ highlight: localHighlight, shadow: newShadow, intensity: localIntensity, effectName });
  };

  const handleIntensityChange = (e) => {
    const newIntensity = parseInt(e.target.value, 10);
    setLocalIntensity(newIntensity);
    onSelect({ highlight: localHighlight, shadow: localShadow, intensity: newIntensity, effectName });
  };

  return (
    <div
      className={`duotone-effect ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="duotone-thumbnail"
      />
      <span className="effect-name">{effectName}</span>
      {isSelected && (
        <div className="duotone-edit-controls">
          <div className="control-group">
            <label>Highlight Color:</label>
            <input
              type="color"
              value={localHighlight}
              onChange={handleHighlightChange}
              onClick={(e) => e.stopPropagation()} // Prevent triggering handleClick
            />
          </div>
          <div className="control-group">
            <label>Shadow Color:</label>
            <input
              type="color"
              value={localShadow}
              onChange={handleShadowChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="control-group">
            <label>Intensity: {localIntensity}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={localIntensity}
              onChange={handleIntensityChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

DuotoneEffect.propTypes = {
  thumbnailSrc: PropTypes.string.isRequired,
  highlight: PropTypes.string.isRequired,
  shadow: PropTypes.string.isRequired,
  intensity: PropTypes.number.isRequired,
  effectName: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  adjustments: PropTypes.shape({
    temperature: PropTypes.number,
    tint: PropTypes.number,
    brightness: PropTypes.number,
    contrast: PropTypes.number,
    highlights: PropTypes.number,
    shadows: PropTypes.number,
    whites: PropTypes.number,
    blacks: PropTypes.number,
    vibrance: PropTypes.number,
    saturation: PropTypes.number,
    sharpness: PropTypes.number,
    clarity: PropTypes.number,
    grayscale: PropTypes.number,
    invert: PropTypes.bool,
    sepia: PropTypes.number,
  }),
  colorAdjustments: PropTypes.shape({
    hue: PropTypes.number,
    saturation: PropTypes.number,
    brightness: PropTypes.number,
  }),
};

export default DuotoneEffect;