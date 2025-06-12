import React, { useState, useEffect } from "react";
import { FaMagic, FaRedo } from "react-icons/fa";
import "./AdjustPanel.css";
import {
  initialAdjustments,
  initialColorAdjustments,
  colorSwatches,
  autoAdjust,
  resetAdjustments,
} from "../../helper/adjustPanelHelper";

const AdjustPanel = ({ editorRef, selectedImage }) => {
  const [adjustments, setAdjustments] = useState(initialAdjustments);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorAdjustments, setColorAdjustments] = useState(initialColorAdjustments);

  useEffect(() => {
    if (editorRef.current) {
      console.log("[AdjustPanel] Applying adjustments:", adjustments);
      console.log("[AdjustPanel] Applying color adjustments:", colorAdjustments);
      editorRef.current.applyAdjustments(adjustments);
      editorRef.current.applyColorAdjustments(colorAdjustments);
    }
  }, [adjustments, colorAdjustments, editorRef]);

  const handleAdjustmentChange = (key, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleColorAdjustmentChange = (key, value) => {
    setColorAdjustments((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAutoAdjust = () => {
    setAdjustments(autoAdjust());
  };

  const handleReset = () => {
    const { adjustments, colorAdjustments, selectedColor } = resetAdjustments();
    setAdjustments(adjustments);
    setColorAdjustments(colorAdjustments);
    setSelectedColor(selectedColor);
  };

  return (
    <div className="adjust-panel">
      <button
        className="btn btn-primary auto-adjust-btn"
        onClick={handleAutoAdjust}
      >
        <FaMagic size={14} />
        Auto-Adjust
      </button>

      <div className="adjust-section">
        <h4 className="section-title">White Balance</h4>

        <div className="adjust-control">
          <label className="label-title">Temperature</label>
          <div className="range-container">
            <input
              type="range"
              className="form-range"
              min="-100"
              max="100"
              value={adjustments.temperature}
              onChange={(e) =>
                handleAdjustmentChange("temperature", Number(e.target.value))
              }
            />
            <input
              type="number"
              className="input-number"
              value={adjustments.temperature}
              onChange={(e) =>
                handleAdjustmentChange("temperature", Number(e.target.value))
              }
              min="-100"
              max="100"
            />
          </div>
        </div>

        <div className="adjust-control">
          <label className="label-title">Tint</label>
          <div className="range-container">
            <input
              type="range"
              className="form-range"
              min="-100"
              max="100"
              value={adjustments.tint}
              onChange={(e) =>
                handleAdjustmentChange("tint", Number(e.target.value))
              }
            />
            <input
              type="number"
              className="input-number"
              value={adjustments.tint}
              onChange={(e) =>
                handleAdjustmentChange("tint", Number(e.target.value))
              }
              min="-100"
              max="100"
            />
          </div>
        </div>
      </div>

      <div className="adjust-section">
        <h4 className="section-title">Light</h4>

        {[
          "brightness",
          "contrast",
          "highlights",
          "shadows",
          "whites",
          "blacks",
        ].map((key) => (
          <div key={key} className="adjust-control">
            <label className="label-title">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <div className="range-container">
              <input
                type="range"
                className="form-range"
                min="-100"
                max="100"
                value={adjustments[key]}
                onChange={(e) =>
                  handleAdjustmentChange(key, Number(e.target.value))
                }
              />
              <input
                type="number"
                className="input-number"
                value={adjustments[key]}
                onChange={(e) =>
                  handleAdjustmentChange(key, Number(e.target.value))
                }
                min="-100"
                max="100"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="adjust-section">
        <h4 className="section-title">Color</h4>

        <div className="adjust-control">
          <label className="label-title">
            <input
              type="checkbox"
              checked={adjustments.invert}
              onChange={(e) =>
                handleAdjustmentChange("invert", e.target.checked)
              }
            />
            Invert
          </label>
        </div>

        {["vibrance", "saturation"].map((key) => (
          <div key={key} className="adjust-control">
            <label className="label-title">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <div className="range-container">
              <input
                type="range"
                className="form-range"
                min="-100"
                max="100"
                value={adjustments[key]}
                onChange={(e) =>
                  handleAdjustmentChange(key, Number(e.target.value))
                }
              />
              <input
                type="number"
                className="input-number"
                value={adjustments[key]}
                onChange={(e) =>
                  handleAdjustmentChange(key, Number(e.target.value))
                }
                min="-100"
                max="100"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="adjust-section">
        <h4 className="section-title">Color Edit</h4>
        {selectedImage && (
          <div className="image-thumbnail">
            <img src={selectedImage} alt="Selected Image Thumbnail" />
          </div>
        )}
        <div className="color-swatches">
          {colorSwatches.map((color) => (
            <button
              key={color}
              className={`color-swatch ${
                selectedColor === color ? "active" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>

        {selectedColor && (
          <>
            {["hue", "saturation", "brightness"].map((key) => (
              <div key={key} className="adjust-control">
                <label className="label-title">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <div className="range-container">
                  <input
                    type="range"
                    className="form-range"
                    min="-100"
                    max="100"
                    value={colorAdjustments[key]}
                    onChange={(e) =>
                      handleColorAdjustmentChange(key, Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    className="input-number"
                    value={colorAdjustments[key]}
                    onChange={(e) =>
                      handleColorAdjustmentChange(key, Number(e.target.value))
                    }
                    min="-100"
                    max="100"
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="adjust-section">
        <h4 className="section-title">Texture</h4>

        {["sharpness", "clarity"].map((key) => (
          <div key={key} className="adjust-control">
            <label className="label-title">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <div className="range-container">
              <input
                type="range"
                className="form-range"
                min="-100"
                max="100"
                value={adjustments[key]}
                onChange={(e) =>
                  handleAdjustmentChange(key, Number(e.target.value))
                }
              />
              <input
                type="number"
                className="input-number"
                value={adjustments[key]}
                onChange={(e) =>
                  handleAdjustmentChange(key, Number(e.target.value))
                }
                min="-100"
                max="100"
              />
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary reset-btn" onClick={handleReset}>
        <FaRedo size={14} />
        Reset Adjustments
      </button>
    </div>
  );
};

export default AdjustPanel;