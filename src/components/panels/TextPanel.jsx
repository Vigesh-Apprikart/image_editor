import React, { useState, useCallback, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaBold,
  FaItalic,
  FaUnderline,
} from "react-icons/fa";
import "./TextPanel.css";
import {
  initialTextState,
  textStyles,
  fonts,
  colorPalette,
  quickAccessColors,
} from "../../helper/textPanelHelper";

const TextPanel = ({ editorRef }) => {
  const [searchTerm, setSearchTerm] = useState(initialTextState.searchTerm);
  const [selectedTextStyle, setSelectedTextStyle] = useState(initialTextState.selectedTextStyle);
  const [selectedFont, setSelectedFont] = useState(initialTextState.selectedFont);
  const [textColor, setTextColor] = useState(initialTextState.textColor);
  const [previewColor, setPreviewColor] = useState(initialTextState.previewColor);
  const [opacity, setOpacity] = useState(initialTextState.opacity);
  const [bold, setBold] = useState(initialTextState.bold);
  const [italic, setItalic] = useState(initialTextState.italic);
  const [underline, setUnderline] = useState(initialTextState.underline);

  // Update selected text when relevant states change
  useEffect(() => {
    editorRef.current?.updateSelectedText?.({
      fontSize:
        textStyles.find((s) => s.id === selectedTextStyle)?.size || "20px",
      fontFamily: selectedFont,
      color: textColor,
      opacity,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      textDecoration: underline ? "underline" : "none",
    });
  }, [selectedTextStyle, selectedFont, textColor, opacity, bold, italic, underline, editorRef]);

  const handleAddText = () => {
    editorRef.current?.addText({
      text: "New Text",
      style: selectedTextStyle,
      font: selectedFont,
      color: textColor,
      opacity,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      textDecoration: underline ? "underline" : "none",
    });
  };

  const handleColorSelect = (color) => {
    if (textColor !== color) {
      setTextColor(color);
    }
  };

  const handleColorHover = (color) => {
    setPreviewColor(color);
  };

  const handleColorLeave = () => {
    setPreviewColor("");
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    if (textColor !== newColor) {
      setTextColor(newColor);
    }
  };

  const displayColor = previewColor || textColor;

  return (
    <div className="text-panel">
      <div className="form-group">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search for fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-custom add-button" onClick={handleAddText}>
        <FaPlus size={14} /> Add Text
      </button>

      <div className="form-group">
        <label className="form-label">Text Style</label>
        <div className="text-styles">
          {textStyles.map((style) => (
            <button
              key={style.id}
              className={`btn text-button ${
                selectedTextStyle === style.id ? "active" : ""
              }`}
              onClick={() => {
                if (selectedTextStyle !== style.id) {
                  setSelectedTextStyle(style.id);
                }
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Font Family</label>
        <select
          className="form-input"
          value={selectedFont}
          onChange={(e) => {
            if (selectedFont !== e.target.value) {
              setSelectedFont(e.target.value);
            }
          }}
        >
          {fonts
            .filter((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Text Color</label>
        {/* Color Preview */}
        <div className="color-preview-container">
          <div
            className="color-preview-circle"
            style={{ backgroundColor: displayColor }}
          ></div>
          <div className="color-preview-text">
            <span style={{ color: displayColor }} className="color-text-sample">
              Sample Text
            </span>
            <span className="color-hex">{displayColor.toUpperCase()}</span>
          </div>
        </div>

        {/* Color Palette */}
        <div className="color-palette">
          {colorPalette.map((color, index) => (
            <button
              key={index}
              className={`color-swatch ${
                textColor === color ? "selected" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              onMouseEnter={() => handleColorHover(color)}
              onMouseLeave={handleColorLeave}
              title={color}
            >
              <div
                className="color-preview"
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="custom-color-container">
          <input
            type="color"
            value={textColor}
            onChange={handleCustomColorChange}
            className="custom-color-picker"
            title="Choose a custom color"
          />
          <input
            type="text"
            value={textColor}
            onChange={handleCustomColorChange}
            className="custom-color-input"
            placeholder="#000000"
          />
        </div>

        {/* Quick Access Colors */}
        <div className="quick-access-container">
          {quickAccessColors.map((color, index) => (
            <button
              key={index}
              className={`quick-access-swatch ${
                textColor === color ? "selected" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              onMouseEnter={() => handleColorHover(color)}
              onMouseLeave={handleColorLeave}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => {
            const newOpacity = parseFloat(e.target.value);
            setOpacity(newOpacity);
          }}
          className="opacity-slider"
        />
        <span className="opacity-value">{(opacity * 100).toFixed(0)}%</span>
      </div>

      <div className="form-group">
        <label className="form-label">Text Format</label>
        <div className="text-format-buttons">
          <button
            className={`btn-icon format-btn ${bold ? "active" : ""}`}
            onClick={() => {
              setBold(!bold);
            }}
          >
            <FaBold />
          </button>
          <button
            className={`btn-icon format-btn ${italic ? "active" : ""}`}
            onClick={() => {
              setItalic(!italic);
            }}
          >
            <FaItalic />
          </button>
          <button
            className={`btn-icon format-btn ${underline ? "active" : ""}`}
            onClick={() => {
              setUnderline(!underline);
            }}
          >
            <FaUnderline />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;