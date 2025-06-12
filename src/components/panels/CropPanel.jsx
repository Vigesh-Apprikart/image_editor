import React, { useState, useEffect } from 'react';
import { FaMagic, FaRedo, FaCheck } from 'react-icons/fa';
import './CropPanel.css';
import {
  initialCropState,
  aspectRatios,
  smartCrop,
  resetCrop,
} from '../../helper/cropPanelHelper';

const CropPanel = ({ editorRef }) => {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(initialCropState.selectedAspectRatio);
  const [rotation, setRotation] = useState(initialCropState.rotation);
  const [verticalPerspective, setVerticalPerspective] = useState(initialCropState.verticalPerspective);
  const [horizontalPerspective, setHorizontalPerspective] = useState(initialCropState.horizontalPerspective);

  useEffect(() => {
    editorRef.current?.applyCrop({ aspectRatio: selectedAspectRatio });
  }, [selectedAspectRatio, editorRef]);

  useEffect(() => {
    editorRef.current?.applyRotation(rotation);
  }, [rotation, editorRef]);

  useEffect(() => {
    editorRef.current?.applyPerspective({
      vertical: verticalPerspective,
      horizontal: horizontalPerspective,
    });
  }, [verticalPerspective, horizontalPerspective, editorRef]);

  const handleSmartCrop = () => {
    const { selectedAspectRatio } = smartCrop();
    setSelectedAspectRatio(selectedAspectRatio);
    editorRef.current?.applyCrop({ aspectRatio: selectedAspectRatio });
  };

  const handleReset = () => {
    const { selectedAspectRatio, rotation, verticalPerspective, horizontalPerspective } = resetCrop();
    setSelectedAspectRatio(selectedAspectRatio);
    setRotation(rotation);
    setVerticalPerspective(verticalPerspective);
    setHorizontalPerspective(horizontalPerspective);
    editorRef.current?.applyCrop({ reset: true });
    editorRef.current?.applyRotation(0);
    editorRef.current?.applyPerspective({ vertical: 0, horizontal: 0 });
  };

  const handleDone = () => {
    editorRef.current?.finalizeCrop();
  };

  return (
    <div className="crop-panel">
      <button className="btn btn-primary smart-crop-btn" onClick={handleSmartCrop}>
        <FaMagic size={14} />
        Smart Crop
      </button>

      <div className="form-group">
        <label className="form-label">Aspect Ratio</label>
        <div className="aspect-ratio-grid">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.id}
              className={`aspect-ratio-item ${selectedAspectRatio === ratio.id ? 'active' : ''}`}
              onClick={() => setSelectedAspectRatio(ratio.id)}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Rotate</label>
        <div className="range-container">
          <input
            type="range"
            className="form-range"
            min="-180"
            max="180"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
          <input
            type="number"
            className="range-input"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            min="-180"
            max="180"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Perspective</label>
        
        <div className="perspective-control">
          <label className="sub-label">Vertical</label>
          <div className="range-container">
            <input
              type="range"
              className="form-range"
              min="-30"
              max="30"
              value={verticalPerspective}
              onChange={(e) => setVerticalPerspective(Number(e.target.value))}
            />
            <input
              type="number"
              className="range-input"
              value={verticalPerspective}
              onChange={(e) => setVerticalPerspective(Number(e.target.value))}
              min="-30"
              max="30"
            />
          </div>
        </div>

        <div className="perspective-control">
          <label className="sub-label">Horizontal</label>
          <div className="range-container">
            <input
              type="range"
              className="form-range"
              min="-30"
              max="30"
              value={horizontalPerspective}
              onChange={(e) => setHorizontalPerspective(Number(e.target.value))}
            />
            <input
              type="number"
              className="range-input"
              value={horizontalPerspective}
              onChange={(e) => setHorizontalPerspective(Number(e.target.value))}
              min="-30"
              max="30"
            />
          </div>
        </div>
      </div>

      <div className="crop-actions">
        <button className="btn btn-secondary" onClick={handleReset}>
          <FaRedo size={14} />
          Reset
        </button>
        <button className="btn btn-primary" onClick={handleDone}>
          <FaCheck size={14} />
          Done
        </button>
      </div>
    </div>
  );
};

export default CropPanel;