// import React, { useState, useEffect } from "react";
// import {
//   FaSearch,
//   FaPlus,
//   FaBold,
//   FaItalic,
//   FaUnderline,
// } from "react-icons/fa";
// import "./TextPanel.css";
// import {
//   initialTextState,
//   textStyles,
//   fonts,
//   colorPalette,
//   quickAccessColors,
// } from "../../helper/textPanelHelper";

// const TextPanel = ({ editorRef }) => {
//   const [searchTerm, setSearchTerm] = useState(initialTextState.searchTerm);
//   const [selectedTextStyle, setSelectedTextStyle] = useState(
//     initialTextState.selectedTextStyle
//   );
//   const [selectedFont, setSelectedFont] = useState(
//     initialTextState.selectedFont
//   );
//   const [textColor, setTextColor] = useState(initialTextState.textColor);
//   const [previewColor, setPreviewColor] = useState(
//     initialTextState.previewColor
//   );
//   const [opacity, setOpacity] = useState(initialTextState.opacity);
//   const [bold, setBold] = useState(initialTextState.bold);
//   const [italic, setItalic] = useState(initialTextState.italic);
//   const [underline, setUnderline] = useState(initialTextState.underline);
//   const [fontSize, setFontSize] = useState(20); // Controlled by slider for updating text
//   const [initialAddFontSize] = useState(60); // 👈 Used only when adding new text

//   // Apply changes to selected text only
//   useEffect(() => {
//     editorRef.current?.updateSelectedText?.({
//       fontSize: `${fontSize}px`,
//       fontFamily: selectedFont,
//       color: textColor,
//       opacity,
//       fontWeight: bold ? "bold" : "normal",
//       fontStyle: italic ? "italic" : "normal",
//       textDecoration: underline ? "underline" : "none",
//     });
//   }, [
//     fontSize,
//     selectedFont,
//     textColor,
//     opacity,
//     bold,
//     italic,
//     underline,
//     editorRef,
//   ]);

//   const handleAddText = () => {
//     const newFontSize = initialAddFontSize;

//     editorRef.current?.addText({
//       text: "New Text",
//       style: selectedTextStyle,
//       font: selectedFont,
//       color: textColor,
//       opacity,
//       fontSize: `${newFontSize}px`,
//       fontWeight: bold ? "bold" : "normal",
//       fontStyle: italic ? "italic" : "normal",
//       textDecoration: underline ? "underline" : "none",
//     });

//     setFontSize(newFontSize); // 👈 sync slider with actual font size
//   };

//   const handleColorSelect = (color) => setTextColor(color);
//   const handleColorHover = (color) => setPreviewColor(color);
//   const handleColorLeave = () => setPreviewColor("");
//   const handleCustomColorChange = (e) => setTextColor(e.target.value);
//   const displayColor = previewColor || textColor;

//   return (
//     <div className="text-panel">
//       {/* <div className="form-group">
//         <div className="search-container">
//           <FaSearch className="search-icon" />
//           <input
//             type="text"
//             className="form-input search-input"
//             placeholder="Search for fonts..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div> */}

//       <button className="btn btn-custom add-button" onClick={handleAddText}>
//         <FaPlus size={14} /> Add Text
//       </button>

//       {/* <div className="form-group">
//         <label className="form-label">Text Style</label>
//         <div className="text-styles">
//           {textStyles.map((style) => (
//             <button
//               key={style.id}
//               className={`btn text-button ${
//                 selectedTextStyle === style.id ? "active" : ""
//               }`}
//               onClick={() => setSelectedTextStyle(style.id)}
//             >
//               {style.label}
//             </button>
//           ))}
//         </div>
//       </div> */}

//       <div className="form-group">
//         <label className="form-label">Font Size: {fontSize}px</label>
//         <input
//           type="range"
//           min="8"
//           max="200"
//           value={fontSize}
//           onChange={(e) => setFontSize(parseInt(e.target.value))}
//           className="opacity-slider"
//         />
//       </div>

//       <div className="form-group">
//         <label className="form-label">Text Color</label>
//         <div className="color-preview-container">
//           <div
//             className="color-preview-circle"
//             style={{ backgroundColor: displayColor }}
//           />
//           <div className="color-preview-text">
//             <span style={{ color: displayColor }} className="color-text-sample">
//               Sample Text
//             </span>
//             <span className="color-hex">{displayColor.toUpperCase()}</span>
//           </div>
//         </div>

//         <div className="color-palette">
//           {colorPalette.map((color, index) => (
//             <button
//               key={index}
//               className={`color-swatch ${
//                 textColor === color ? "selected" : ""
//               }`}
//               style={{ backgroundColor: color }}
//               onClick={() => handleColorSelect(color)}
//               onMouseEnter={() => handleColorHover(color)}
//               onMouseLeave={handleColorLeave}
//               title={color}
//             >
//               <div
//                 className="color-preview"
//                 style={{ backgroundColor: color }}
//               />
//             </button>
//           ))}
//         </div>

//         <div className="custom-color-container">
//           <input
//             type="color"
//             value={textColor}
//             onChange={handleCustomColorChange}
//             className="custom-color-picker"
//             title="Choose a custom color"
//           />
//           <input
//             type="text"
//             value={textColor}
//             onChange={handleCustomColorChange}
//             className="custom-color-input"
//             placeholder="#000000"
//           />
//         </div>

//         <div className="quick-access-container">
//           {quickAccessColors.map((color, index) => (
//             <button
//               key={index}
//               className={`quick-access-swatch ${
//                 textColor === color ? "selected" : ""
//               }`}
//               style={{ backgroundColor: color }}
//               onClick={() => handleColorSelect(color)}
//               onMouseEnter={() => handleColorHover(color)}
//               onMouseLeave={handleColorLeave}
//               title={color}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="form-group">
//         <label className="form-label">Opacity</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.1"
//           value={opacity}
//           onChange={(e) => setOpacity(parseFloat(e.target.value))}
//           className="opacity-slider"
//         />
//         <span className="opacity-value">{(opacity * 100).toFixed(0)}%</span>
//       </div>

//       <div className="form-group">
//         <label className="form-label">Text Format</label>
//         <div className="text-format-buttons">
//           <button
//             className={`btn-icon format-btn ${bold ? "active" : ""}`}
//             onClick={() => setBold(!bold)}
//           >
//             <FaBold />
//           </button>
//           <button
//             className={`btn-icon format-btn ${italic ? "active" : ""}`}
//             onClick={() => setItalic(!italic)}
//           >
//             <FaItalic />
//           </button>
//           <button
//             className={`btn-icon format-btn ${underline ? "active" : ""}`}
//             onClick={() => setUnderline(!underline)}
//           >
//             <FaUnderline />
//           </button>
//         </div>
//       </div>

//       <div className="form-group">
//         <label className="form-label">Font Family</label>
//         <div className="font-thumbnail-grid">
//           {fonts.map((font) => (
//             <div
//               key={font}
//               className={`font-thumb-item ${
//                 selectedFont === font ? "selected" : ""
//               }`}
//               onClick={() => setSelectedFont(font)}
//             >
//               <div className="font-thumb-preview" style={{ fontFamily: font }}>
//                 Aa
//               </div>
//               <div className="font-thumb-label">{font}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TextPanel;


import React, { useState, useEffect } from "react";
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
  const [selectedTextStyle, setSelectedTextStyle] = useState(
    initialTextState.selectedTextStyle
  );
  const [selectedFont, setSelectedFont] = useState(
    initialTextState.selectedFont
  );
  const [textColor, setTextColor] = useState(initialTextState.textColor);
  const [previewColor, setPreviewColor] = useState(
    initialTextState.previewColor
  );
  const [opacity, setOpacity] = useState(initialTextState.opacity);
  const [bold, setBold] = useState(initialTextState.bold);
  const [italic, setItalic] = useState(initialTextState.italic);
  const [underline, setUnderline] = useState(initialTextState.underline);
  const [fontSize, setFontSize] = useState(100); // default large size
  const [initialAddFontSize] = useState(100);
  const [hasManualSize, setHasManualSize] = useState(false);

  // 🧠 Update font size when text style changes (only if user hasn't changed it manually)
  useEffect(() => {
    if (hasManualSize) return;
    const style = textStyles.find((s) => s.id === selectedTextStyle);
    if (style?.size) {
      setFontSize(parseInt(style.size));
    }
  }, [selectedTextStyle, hasManualSize]);

  // ✏️ Apply changes to selected text
  useEffect(() => {
    editorRef.current?.updateSelectedText?.({
      fontSize: `${fontSize}px`,
      fontFamily: selectedFont,
      color: textColor,
      opacity,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      textDecoration: underline ? "underline" : "none",
    });
  }, [
    fontSize,
    selectedFont,
    textColor,
    opacity,
    bold,
    italic,
    underline,
    editorRef,
  ]);

  const handleAddText = () => {
    const newFontSize = initialAddFontSize;
    editorRef.current?.addText({
      text: "New Text",
      style: selectedTextStyle,
      font: selectedFont,
      color: textColor,
      opacity,
      fontSize: `${newFontSize}px`,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      textDecoration: underline ? "underline" : "none",
    });
    setFontSize(newFontSize); // sync slider
    setHasManualSize(false); // reset manual flag
  };

  const handleColorSelect = (color) => setTextColor(color);
  const handleColorHover = (color) => setPreviewColor(color);
  const handleColorLeave = () => setPreviewColor("");
  const handleCustomColorChange = (e) => setTextColor(e.target.value);
  const displayColor = previewColor || textColor;

  return (
    <div className="text-panel">
      <button className="btn btn-custom add-button" onClick={handleAddText}>
        <FaPlus size={14} /> Add Text
      </button>

      {/* ✅ Text Styles */}
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
                setSelectedTextStyle(style.id);
                setHasManualSize(false); // allow auto font size change
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <label className="form-label">Font Size: {fontSize}px</label>
        <input
          type="range"
          min="8"
          max="200"
          value={fontSize}
          onChange={(e) => {
            setFontSize(parseInt(e.target.value));
            setHasManualSize(true);
          }}
          className="opacity-slider"
        />
      </div>

      {/* Text Color */}
      <div className="form-group">
        <label className="form-label">Text Color</label>
        <div className="color-preview-container">
          <div
            className="color-preview-circle"
            style={{ backgroundColor: displayColor }}
          />
          <div className="color-preview-text">
            <span style={{ color: displayColor }} className="color-text-sample">
              Sample Text
            </span>
            <span className="color-hex">{displayColor.toUpperCase()}</span>
          </div>
        </div>

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

      {/* Opacity */}
      <div className="form-group">
        <label className="form-label">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="opacity-slider"
        />
        <span className="opacity-value">{(opacity * 100).toFixed(0)}%</span>
      </div>

      {/* Text Format */}
      <div className="form-group">
        <label className="form-label">Text Format</label>
        <div className="text-format-buttons">
          <button
            className={`btn-icon format-btn ${bold ? "active" : ""}`}
            onClick={() => setBold(!bold)}
          >
            <FaBold />
          </button>
          <button
            className={`btn-icon format-btn ${italic ? "active" : ""}`}
            onClick={() => setItalic(!italic)}
          >
            <FaItalic />
          </button>
          <button
            className={`btn-icon format-btn ${underline ? "active" : ""}`}
            onClick={() => setUnderline(!underline)}
          >
            <FaUnderline />
          </button>
        </div>
      </div>

      {/* Font Family */}
      <div className="form-group">
        <label className="form-label">Font Family</label>
        <div className="font-thumbnail-grid">
          {fonts.map((font) => (
            <div
              key={font}
              className={`font-thumb-item ${
                selectedFont === font ? "selected" : ""
              }`}
              onClick={() => setSelectedFont(font)}
            >
              <div className="font-thumb-preview" style={{ fontFamily: font }}>
                Aa
              </div>
              <div className="font-thumb-label">{font}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
