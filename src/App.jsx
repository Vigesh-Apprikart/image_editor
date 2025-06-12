import React, { useState, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImageEditor from "./components/ImageEditor";
import ToolPanel from "./components/ToolPanel";
import "./App.css";
import ErrorBoundary from "./ErrorBoundary";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTool, setActiveTool] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef(null);

  const handleImageUpload = (imageUrl) => {
    setSelectedImage(imageUrl);
    setHistory([imageUrl]);
    setHistoryIndex(0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSelectedImage(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSelectedImage(history[historyIndex + 1]);
    }
  };

  const handleDownload = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getCanvas();
      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const addToHistory = (imageUrl) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
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
          hasImage={!!selectedImage}
        />

        <div className="main-content">
          {selectedImage && (
            <Sidebar activeTool={activeTool} onToolSelect={setActiveTool} />
          )}
          {selectedImage && activeTool && (
            <ToolPanel
              activeTool={activeTool}
              editorRef={editorRef}
              onClose={() => setActiveTool("")}
              selectedImage={selectedImage}
            />
          )}

          <div className="editor-container">
            <ImageEditor
              ref={editorRef}
              selectedImage={selectedImage}
              onImageUpload={handleImageUpload}
              activeTool={activeTool}
              onImageChange={addToHistory}
              onToolSelect={setActiveTool}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
