// import React from "react";
// import TextPanel from "./panels/TextPanel";
// import AdjustPanel from "./panels/AdjustPanel";
// import FiltersPanel from "./panels/FiltersPanel";
// import AddImagePanel from "./panels/AddImagePanel";
// import { FaTimes } from "react-icons/fa";
// import "./ToolPanel.css";

// const ToolPanel = ({ activeTool, editorRef, onClose, selectedImage }) => {
//   const renderPanel = () => {
//     switch (activeTool) {
//       case "text":
//         return <TextPanel editorRef={editorRef} />;
//       case "adjust":
//         return <AdjustPanel editorRef={editorRef} />;
//       case "filters":
//         return (
//           <FiltersPanel editorRef={editorRef} selectedImage={selectedImage} />
//         );
//       case "add-image":
//         return <AddImagePanel editorRef={editorRef} />;
//       case "generate":
//         return (
//           <div className="coming-soon-panel">
//             <h4>Generate Feature Coming Soon!</h4>
//             <p>
//               Magic fill and remix functionality will be available in a future
//               update.
//             </p>
//           </div>
//         );
//       case "magic-fill":
//         return (
//           <div className="coming-soon-panel">
//             <h4>Magic Fill Feature Coming Soon!</h4>
//             <p>
//               Magic fill functionality will be available in a future update.
//             </p>
//           </div>
//         );
//       case "remix":
//         return (
//           <div className="coming-soon-panel">
//             <h4>Remix Feature Coming Soon!</h4>
//             <p>Remix functionality will be available in a future update.</p>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="tool-panel">
//       <div className="tool-panel-header">
//         <h3 className="tool-panel-title">
//           {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
//         </h3>
//         <button className="btn-icon close-btn" onClick={onClose}>
//           <FaTimes size={14} />
//         </button>
//       </div>

//       <div className="tool-panel-content">{renderPanel()}</div>
//     </div>
//   );
// };

// export default ToolPanel;

import React from "react";
import TextPanel from "./panels/TextPanel";
import AdjustPanel from "./panels/AdjustPanel";
import FiltersPanel from "./panels/FiltersPanel";
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
      case "add-image":
        return <AddImagePanel editorRef={editorRef} />;
      case "generate":
        return (
          <div className="coming-soon-panel">
            <h4>Generate Feature Coming Soon!</h4>
            <p>
              Generate functionality will be available in a future update.
            </p>
          </div>
        );
      case "magic-fill":
        return (
          <div className="coming-soon-panel">
            <h4>Magic Fill Feature Coming Soon!</h4>
            <p>
              Magic fill functionality will be available in a future update.
            </p>
          </div>
        );
      case "remix":
        return (
          <div className="coming-soon-panel">
            <h4>Remix Feature Coming Soon!</h4>
            <p>Remix functionality will be available in a future update.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <h3 className="tool-panel-title">
          {activeTool
            .replace("-", " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
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
