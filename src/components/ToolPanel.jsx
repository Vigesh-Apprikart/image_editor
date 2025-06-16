import React from "react";
import TextPanel from "./panels/TextPanel";
import AdjustPanel from "./panels/AdjustPanel";
import FiltersPanel from "./panels/FiltersPanel";
// import EffectsPanel from "./panels/EffectsPanel";
import AddImagePanel from "./panels/AddImagePanel";
import { FaTimes } from "react-icons/fa";
import "./ToolPanel.css";

const ToolPanel = ({ activeTool, editorRef, onClose, selectedImage }) => {
  const renderPanel = () => {
    switch (activeTool) {
      case "text":
        return <TextPanel editorRef={editorRef} />;
      case "adjust":
        return <AdjustPanel editorRef={editorRef} />;
      case "filters":
        return (
          <FiltersPanel editorRef={editorRef} selectedImage={selectedImage} />
        );
      // case "effects":
      //   return (
      //     <EffectsPanel editorRef={editorRef} selectedImage={selectedImage} />
      //   );
      case "add-image":
        return <AddImagePanel editorRef={editorRef} />;
      default:
        return null;
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <h3 className="tool-panel-title">
          {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
        </h3>
        <button className="btn-icon close-btn" onClick={onClose}>
          <FaTimes size={14} />
        </button>
      </div>

      <div className="tool-panel-content">{renderPanel()}</div>
    </div>
  );
};

export default ToolPanel;
