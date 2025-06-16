import React, { useState, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImageEditor from "./components/ImageEditor";
import ToolPanel from "./components/ToolPanel";
import "./App.css";
import ErrorBoundary from "./ErrorBoundary";

function App() {
  const [editorState, setEditorState] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef(null);

  const handleImageUpload = (imageUrl) => {
    const initialState = {
      selectedImage: imageUrl,
      adjustments: {
        temperature: 0,
        tint: 0,
        brightness: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        vibrance: 0,
        saturation: 0,
        sharpness: 0,
        clarity: 0,
        grayscale: 0,
        invert: false,
        sepia: 0,
      },
      colorAdjustments: {
        hue: 0,
        saturation: 0,
        brightness: 0,
      },
      shadow: {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        color: "rgba(0,0,0,0)",
        opacity: 0,
        size: 0,
        thickness: 0,
        spread: 0,
      },
      duotone: null,
      cropState: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        aspectRatio: null,
        rotation: 0,
        verticalPerspective: 0,
        horizontalPerspective: 0,
      },
      textElements: [],
      overlayImages: [],
      brushSettings: {
        size: 1,
        intensity: 0,
        type: "blur",
      },
      brushMode: false,
      activeTool: "",
    };
    setEditorState(initialState);
    setHistory([initialState]);
    setHistoryIndex(0);
  };

  const addToHistory = (newState) => {
    if (!newState || !newState.selectedImage) return;

    const essentialState = {
      selectedImage: newState.selectedImage,
      textElements: newState.textElements || [],
      overlayImages: newState.overlayImages || [],
      cropState: newState.cropState || {},
      adjustments: newState.adjustments || {},
      colorAdjustments: newState.colorAdjustments || {},
      shadow: newState.shadow || {},
      duotone: newState.duotone || null,
      brushMode: newState.brushMode || false,
      brushSettings: newState.brushSettings || {},
    };

    const currentSerialized = JSON.stringify(history[historyIndex]);
    const newSerialized = JSON.stringify(essentialState);

    // Only push if different from current
    if (currentSerialized !== newSerialized) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(essentialState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0 && editorRef.current) {
      const newIndex = historyIndex - 1;
      const stateToRestore = history[newIndex];
      editorRef.current.restoreState(stateToRestore); // apply to canvas
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && editorRef.current) {
      const newIndex = historyIndex + 1;
      const stateToRestore = history[newIndex];
      editorRef.current.restoreState(stateToRestore); // apply to canvas
      setHistoryIndex(newIndex);
    }
  };

  const handleDownload = () => {
    editorRef.current?.downloadImage();
  };

  const handleToolSelect = (tool) => {
    if (editorState?.selectedImage && editorRef.current) {
      const currentState = editorRef.current?.getCurrentState?.();
      setEditorState((prev) => ({
        ...prev,
        ...(currentState || {}),
        activeTool: tool,
      }));
    }
  };

  const handleToolClose = () => {
    if (editorState?.selectedImage && editorRef.current) {
      const currentState = editorRef.current?.getCurrentState?.();
      setEditorState((prev) => ({
        ...prev,
        ...(currentState || {}),
        activeTool: "",
      }));
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <Header
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDownload={handleDownload}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasImage={!!editorState?.selectedImage}
        />

        <div className="main-content">
          {editorState?.selectedImage && (
            <Sidebar
              activeTool={editorState.activeTool || ""}
              onToolSelect={handleToolSelect}
            />
          )}
          {editorState?.selectedImage && editorState?.activeTool && (
            <ToolPanel
              activeTool={editorState.activeTool}
              editorRef={editorRef}
              onClose={handleToolClose}
              selectedImage={editorState.selectedImage}
            />
          )}

          <div className="editor-container">
            <ImageEditor
              ref={editorRef}
              editorState={editorState}
              onImageUpload={handleImageUpload}
              onStateChange={addToHistory}
              onToolSelect={handleToolSelect}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
