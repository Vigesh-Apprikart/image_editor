// panels/ImagePanel.jsx
import React from "react";
import "./AddImagePanel.css";

const AddImagePanel = ({ editorRef }) => {
  const handleAddImage = () => {
    if (editorRef?.current?.addOverlayImage) {
      editorRef.current.addOverlayImage();
    }
  };

  return (
    <div className="image-panel">
      <p>Add an overlay Image.</p>
      <button className="add-image-btn" onClick={handleAddImage}>
        Upload Image
      </button>
    </div>
  );
};

export default AddImagePanel;
