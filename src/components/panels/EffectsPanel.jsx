import React, { useState, useRef, useEffect } from 'react';
import './EffectsPanel.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import {
  initialEffectsState,
  effectCategories,
  baseEffectAdjustments,
  initializeEditOptions,
  applyAdjustmentsToContext,
  mapOptionsToEffect,
  removeBlur,
  resetEverything,
} from '../../helper/effectsPanelHelper';

const EffectsPanel = ({ editorRef, selectedImage }) => {
  const [selectedEffect, setSelectedEffect] = useState(initialEffectsState.selectedEffect);
  const [editOptions, setEditOptions] = useState(initialEffectsState.editOptions);
  const [isPopupOpen, setIsPopupOpen] = useState(initialEffectsState.isPopupOpen);
  const [blurTab, setBlurTab] = useState(initialEffectsState.blurTab);
  const [brushType, setBrushType] = useState(initialEffectsState.brushType);
  const [blurState, setBlurState] = useState(initialEffectsState.blurState);

  const handleEffectSelect = (effect) => {
    setSelectedEffect(effect);
    const initialOptions = initializeEditOptions(effect);
    setEditOptions(initialOptions);

    const isShadowEffect = effectCategories['Shadows'].includes(effect);
    const isDuotoneEffect = effectCategories['Duotone'].includes(effect);
    const isBlurEffect = effectCategories['Blur'].includes(effect);
    setIsPopupOpen({
      Shadows: isShadowEffect,
      Duotone: isDuotoneEffect,
      Blur: isBlurEffect
    });

    const { adjustments, colorAdjustments, shadow, duotone } = effect === 'None'
      ? { ...baseEffectAdjustments['None'] }
      : mapOptionsToEffect(effect, initialOptions, effectCategories, baseEffectAdjustments, blurTab, blurState);

    if (!selectedImage) {
      console.error('No image selected. Please select an image to apply effects.');
      return;
    }

    if (!editorRef.current) {
      console.error('EditorRef is not initialized. Cannot apply effects.');
      return;
    }

    try {
      if (shadow) {
        editorRef.current.applyShadow(shadow);
      } else {
        editorRef.current.applyShadow({ offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0)', opacity: 0 });
      }
      editorRef.current.applyFilter({ adjustments, colorAdjustments, duotone });

      if (isBlurEffect && blurTab === 'Brush') {
        editorRef.current.enableBrushMode({
          size: blurState.brushSize,
          intensity: blurState.brushIntensity,
          type: brushType === 'Add Blur' ? 'blur' : 'removeBlur'
        });
      } else {
        editorRef.current.disableBrushMode();
      }
    } catch (error) {
      console.error('Error applying effect:', error);
    }
  };

  const handleOptionChange = (option, value) => {
    const updatedOptions = { ...editOptions, [option]: value };
    setEditOptions(updatedOptions);

    const { adjustments, colorAdjustments, shadow, duotone } = mapOptionsToEffect(selectedEffect, updatedOptions, effectCategories, baseEffectAdjustments, blurTab, blurState);

    if (!editorRef.current) {
      console.error('EditorRef is not initialized. Cannot apply effect changes.');
      return;
    }

    try {
      if (shadow) {
        editorRef.current.applyShadow(shadow);
      }
      editorRef.current.applyFilter({ adjustments, colorAdjustments, duotone });
    } catch (error) {
      console.error('Error applying effect changes:', error);
    }
  };

  const handleBlurStateChange = (key, value) => {
    const updatedBlurState = { ...blurState, [key]: Number(value) };
    setBlurState(updatedBlurState);

    if (blurTab === 'Whole Image' && key === 'wholeImageIntensity') {
      const { adjustments, colorAdjustments, shadow, duotone } = mapOptionsToEffect(selectedEffect, editOptions, effectCategories, baseEffectAdjustments, blurTab, updatedBlurState);
      if (!editorRef.current) {
        console.error('EditorRef is not initialized. Cannot apply blur changes.');
        return;
      }
      try {
        editorRef.current.applyFilter({ adjustments, colorAdjustments, duotone });
      } catch (error) {
        console.error('Error applying blur changes:', error);
      }
    } else if (blurTab === 'Brush') {
      if (!editorRef.current) {
        console.error('EditorRef is not initialized. Cannot apply brush settings.');
        return;
      }
      try {
        editorRef.current.updateBrushSettings({
          size: updatedBlurState.brushSize,
          intensity: updatedBlurState.brushIntensity,
          type: brushType === 'Add Blur' ? 'blur' : 'removeBlur'
        });
      } catch (error) {
        console.error('Error applying brush settings:', error);
      }
    }
  };

  const handleRemoveBlur = () => {
    removeBlur(
      setBlurState,
      setBrushType,
      setBlurTab,
      selectedEffect,
      editOptions,
      editorRef,
      (effect, options) => mapOptionsToEffect(effect, options, effectCategories, baseEffectAdjustments, blurTab, blurState)
    );
  };

  const handleResetEverything = () => {
    resetEverything(
      setSelectedEffect,
      setEditOptions,
      setIsPopupOpen,
      setBlurState,
      setBrushType,
      setBlurTab,
      editorRef
    );
  };

  const closePopup = (category) => {
    setIsPopupOpen((prev) => ({ ...prev, [category]: false }));
    if (category === 'Blur' && editorRef.current) {
      editorRef.current.disableBrushMode();
    }
  };

  const EffectThumbnail = ({ effect }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!selectedImage || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        canvas.width = 80;
        canvas.height = 80;

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        const { adjustments, colorAdjustments, shadow, duotone } = mapOptionsToEffect(effect, initializeEditOptions(effect), effectCategories, baseEffectAdjustments, blurTab, blurState);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        applyAdjustmentsToContext(ctx, img, adjustments, colorAdjustments, duotone, shadow);
        ctx.restore();
      };
      img.src = selectedImage;
    }, [effect, selectedImage]);

    return (
      <canvas
        ref={canvasRef}
        className="effect-preview"
      />
    );
  };

  const renderEditOptionsPopup = () => {
    if (!selectedEffect || selectedEffect === 'None') {
      return null;
    }

    if (isPopupOpen['Shadows']) {
      return (
        <div className="popup">
          <div className="popup-header">
            <h4 className="popup-title">{selectedEffect} Options</h4>
            <button className="popup-close" onClick={() => closePopup('Shadows')}>×</button>
          </div>
          <div className="edit-options-panel">
            {selectedEffect === 'Glow' && (
              <>
                <div className="edit-option">
                  <label>Size</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.size}
                      onChange={(e) => handleOptionChange('size', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.size}
                      onChange={(e) => handleOptionChange('size', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Blur Amount</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedEffect === 'Drop' && (
              <>
                <div className="edit-option">
                  <label>Blur Amount</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Angle</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={editOptions.angle}
                      onChange={(e) => handleOptionChange('angle', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={editOptions.angle}
                      onChange={(e) => handleOptionChange('angle', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Distance</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.distance}
                      onChange={(e) => handleOptionChange('distance', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.distance}
                      onChange={(e) => handleOptionChange('distance', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedEffect === 'Outline' && (
              <>
                <div className="edit-option">
                  <label>Size</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.size}
                      onChange={(e) => handleOptionChange('size', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.size}
                      onChange={(e) => handleOptionChange('size', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedEffect === 'Curved' && (
              <>
                <div className="edit-option">
                  <label>Blur Amount</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Distance</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.distance}
                      onChange={(e) => handleOptionChange('distance', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.distance}
                      onChange={(e) => handleOptionChange('distance', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Curve</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={editOptions.curve}
                      onChange={(e) => handleOptionChange('curve', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={editOptions.curve}
                      onChange={(e) => handleOptionChange('curve', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedEffect === 'Page Lift' && (
              <>
                <div className="edit-option">
                  <label>Blur Amount</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Distance</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.distance}
                      onChange={(e) => handleOptionChange('distance', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.distance}
                      onChange={(e) => handleOptionChange('distance', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Curve</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={editOptions.curve}
                      onChange={(e) => handleOptionChange('curve', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={editOptions.curve}
                      onChange={(e) => handleOptionChange('curve', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedEffect === 'Angled' && (
              <>
                <div className="edit-option">
                  <label>Blur Amount</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Rotation</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={editOptions.rotation}
                      onChange={(e) => handleOptionChange('rotation', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={editOptions.rotation}
                      onChange={(e) => handleOptionChange('rotation', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedEffect === 'Backdrop' && (
              <>
                <div className="edit-option">
                  <label>Blur Amount</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.blurAmount}
                      onChange={(e) => handleOptionChange('blurAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Direction</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={editOptions.direction}
                      onChange={(e) => handleOptionChange('direction', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={editOptions.direction}
                      onChange={(e) => handleOptionChange('direction', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Color</label>
                  <div className="color-picker-wrapper">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: editOptions.color }}
                      onClick={() => document.getElementById(`color-${selectedEffect}`).click()}
                    />
                    <input
                      id={`color-${selectedEffect}`}
                      type="color"
                      value={editOptions.color}
                      onChange={(e) => handleOptionChange('color', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editOptions.intensity}
                      onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (isPopupOpen['Duotone']) {
      return (
        <div className="popup">
          <div className="popup-header">
            <h4 className="popup-title">Duotone Options</h4>
            <button className="popup-close" onClick={() => closePopup('Duotone')}>×</button>
          </div>
          <div className="edit-options-panel">
            <div className="edit-option">
              <label>Highlight Color</label>
              <div className="color-picker-wrapper">
                <div
                  className="color-circle"
                  style={{ backgroundColor: editOptions.highlight }}
                  onClick={() => document.getElementById(`highlight-${selectedEffect}`).click()}
                />
                <input
                  id={`highlight-${selectedEffect}`}
                  type="color"
                  value={editOptions.highlight}
                  onChange={(e) => handleOptionChange('highlight', e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
            <div className="edit-option">
              <label>Shadow Color</label>
              <div className="color-picker-wrapper">
                <div
                  className="color-circle"
                  style={{ backgroundColor: editOptions.shadow }}
                  onClick={() => document.getElementById(`shadow-${selectedEffect}`).click()}
                />
                <input
                  id={`shadow-${selectedEffect}`}
                  type="color"
                  value={editOptions.shadow}
                  onChange={(e) => handleOptionChange('shadow', e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
            <div className="edit-option">
              <label>Intensity</label>
              <div className="input-group">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editOptions.intensity}
                  onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editOptions.intensity}
                  onChange={(e) => handleOptionChange('intensity', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isPopupOpen['Blur']) {
      return (
        <div className="popup">
          <div className="popup-header">
            <h4 className="popup-title">Blur Options</h4>
            <button className="popup-close" onClick={() => closePopup('Blur')}>×</button>
          </div>
          <div className="edit-options-panel">
            <div className="tabs">
              <button
                className={`tab-button ${blurTab === 'Whole Image' ? 'active' : ''}`}
                onClick={() => {
                  setBlurTab('Whole Image');
                  if (editorRef.current) {
                    editorRef.current.disableBrushMode();
                  }
                }}
              >
                Whole Image
              </button>
              <button
                className={`tab-button ${blurTab === 'Brush' ? 'active' : ''}`}
                onClick={() => {
                  setBlurTab('Brush');
                  if (editorRef.current) {
                    editorRef.current.enableBrushMode({
                      size: blurState.brushSize,
                      intensity: blurState.brushIntensity,
                      type: brushType === 'Add Blur' ? 'blur' : 'removeBlur'
                    });
                  }
                }}
              >
                Brush
              </button>
            </div>

            {blurTab === 'Whole Image' && (
              <div className="tab-content">
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={blurState.wholeImageIntensity}
                      onChange={(e) => handleBlurStateChange('wholeImageIntensity', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={blurState.wholeImageIntensity}
                      onChange={(e) => handleBlurStateChange('wholeImageIntensity', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {blurTab === 'Brush' && (
              <div className="tab-content">
                <div className="edit-option">
                  <label>Brush Type</label>
                  <div className="brush-type-toggle">
                    <button
                      className={`brush-type-button ${brushType === 'Add Blur' ? 'active' : ''}`}
                      onClick={() => {
                        setBrushType('Add Blur');
                        if (editorRef.current) {
                          editorRef.current.updateBrushSettings({
                            size: blurState.brushSize,
                            intensity: blurState.brushIntensity,
                            type: 'blur'
                          });
                        }
                      }}
                    >
                      <FaPlus /> Add Blur
                    </button>
                    <button
                      className={`brush-type-button ${brushType === 'Remove' ? 'active' : ''}`}
                      onClick={() => {
                        setBrushType('Remove');
                        if (editorRef.current) {
                          editorRef.current.updateBrushSettings({
                            size: blurState.brushSize,
                            intensity: blurState.brushIntensity,
                            type: 'removeBlur'
                          });
                        }
                      }}
                    >
                      <FaMinus /> Remove
                    </button>
                  </div>
                </div>
                <div className="edit-option">
                  <label>Brush Size</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={blurState.brushSize}
                      onChange={(e) => handleBlurStateChange('brushSize', e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={blurState.brushSize}
                      onChange={(e) => handleBlurStateChange('brushSize', e.target.value)}
                    />
                  </div>
                </div>
                <div className="edit-option">
                  <label>Intensity</label>
                  <div className="input-group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={blurState.brushIntensity}
                      onChange={(e) => handleBlurStateChange('brushIntensity', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={blurState.brushIntensity}
                      onChange={(e) => handleBlurStateChange('brushIntensity', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="action-button remove-blur" onClick={handleRemoveBlur}>
                Remove Blur
              </button>
              <button className="action-button reset-everything" onClick={handleResetEverything}>
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="effects-panel">
      {Object.entries(effectCategories).map(([category, effects]) => (
        <div key={category} className="effect-category">
          <h4 className="category-title">{category}</h4>
          <div className="effect-grid">
            {effects.map((effect) => (
              <div
                key={effect}
                className={`effect-item ${selectedEffect === effect ? 'active' : ''}`}
                onClick={() => handleEffectSelect(effect)}
              >
                {selectedImage ? (
                  <EffectThumbnail effect={effect} />
                ) : (
                  <div
                    className="effect-preview"
                    style={{ backgroundColor: '#e5e7eb' }}
                  />
                )}
                <span className="effect-name">{effect}</span>
              </div>
            ))}
          </div>
          {(category === 'Shadows' || category === 'Duotone' || category === 'Blur') && isPopupOpen[category] && renderEditOptionsPopup()}
        </div>
      ))}
      {!selectedImage && (
        <div className="no-image-message">
          <p>Please select an image to apply effects.</p>
        </div>
      )}
    </div>
  );
};

export default EffectsPanel;