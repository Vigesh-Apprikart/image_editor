// import React, { useState, useRef } from "react";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import ImageEditor from "./components/ImageEditor";
// import ToolPanel from "./components/ToolPanel";
// import "./App.css";
// import ErrorBoundary from "./ErrorBoundary";

// function App() {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [activeTool, setActiveTool] = useState("");
//   const [history, setHistory] = useState([]);
//   const [historyIndex, setHistoryIndex] = useState(-1);
//   const editorRef = useRef(null);

//   const handleImageUpload = (imageUrl) => {
//     setSelectedImage(imageUrl);
//     setHistory([imageUrl]);
//     setHistoryIndex(0);
//   };

//   const handleUndo = () => {
//     if (historyIndex > 0) {
//       setHistoryIndex(historyIndex - 1);
//       setSelectedImage(history[historyIndex - 1]);
//     }
//   };

//   const handleRedo = () => {
//     if (historyIndex < history.length - 1) {
//       setHistoryIndex(historyIndex + 1);
//       setSelectedImage(history[historyIndex + 1]);
//     }
//   };

//   // const handleDownload = () => {
//   //   if (editorRef.current) {
//   //     const canvas = editorRef.current.getCanvas();
//   //     const link = document.createElement("a");
//   //     link.download = "edited-image.png";
//   //     link.href = canvas.toDataURL();
//   //     link.click();
//   //   }
//   // };

//   const handleDownload = () => {
//     editorRef.current?.downloadImage();
//   };

//   const addToHistory = (imageUrl) => {
//     const newHistory = history.slice(0, historyIndex + 1);
//     newHistory.push(imageUrl);
//     setHistory(newHistory);
//     setHistoryIndex(newHistory.length - 1);
//   };

//   return (
//     <ErrorBoundary>
//       <div className="app">
//         <Header
//           onUndo={handleUndo}
//           onRedo={handleRedo}
//           onDownload={handleDownload}
//           canUndo={historyIndex > 0}
//           canRedo={historyIndex < history.length - 1}
//           hasImage={!!selectedImage}
//         />

//         <div className="main-content">
//           {selectedImage && (
//             <Sidebar activeTool={activeTool} onToolSelect={setActiveTool} />
//           )}
//           {selectedImage && activeTool && (
//             <ToolPanel
//               activeTool={activeTool}
//               editorRef={editorRef}
//               onClose={() => setActiveTool("")}
//               selectedImage={selectedImage}
//             />
//           )}

//           <div className="editor-container">
//             <ImageEditor
//               ref={editorRef}
//               selectedImage={selectedImage}
//               onImageUpload={handleImageUpload}
//               activeTool={activeTool}
//               onImageChange={addToHistory}
//               onToolSelect={setActiveTool}
//             />
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// }

// export default App;


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
    };
    setEditorState(initialState);
    setHistory([initialState]);
    setHistoryIndex(0);
  };

  const addToHistory = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditorState(history[newIndex]);
      if (editorRef.current) {
        editorRef.current.restoreState(history[newIndex]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditorState(history[newIndex]);
      if (editorRef.current) {
        editorRef.current.restoreState(history[newIndex]);
      }
    }
  };

  const handleDownload = () => {
    editorRef.current?.downloadImage();
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
            <Sidebar activeTool={editorState.activeTool || ""} onToolSelect={(tool) => setEditorState((prev) => ({ ...prev, activeTool: tool }))} />
          )}
          {editorState?.selectedImage && editorState?.activeTool && (
            <ToolPanel
              activeTool={editorState.activeTool}
              editorRef={editorRef}
              onClose={() => setEditorState((prev) => ({ ...prev, activeTool: "" }))}
              selectedImage={editorState.selectedImage}
            />
          )}

          <div className="editor-container">
            <ImageEditor
              ref={editorRef}
              editorState={editorState}
              onImageUpload={handleImageUpload}
              onStateChange={addToHistory}
              onToolSelect={(toolId) => setEditorState((prev) => ({ ...prev, activeTool: toolId }))}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;