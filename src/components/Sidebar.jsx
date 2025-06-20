import {
  FaFont,
  FaCrop,
  FaAdjust,
  FaFilter,
  FaMagic,
  FaRecycle,
  FaImage,
} from "react-icons/fa"; // ✅ Correct import

import "./Sidebar.css";

const tools = [
  { id: "text", label: "Text", icon: FaFont },
  { id: "add-image", label: "Image", icon: FaImage },
  { id: "adjust", label: "Adjust", icon: FaAdjust },
  { id: "filters", label: "Filters", icon: FaFilter },
  { id: "generate", label: "Generate", icon: FaMagic }, // ✅ Use FaMagic here too
  { id: "magic-fill", label: "Magic Fill", icon: FaMagic },
  { id: "remix", label: "Remix", icon: FaRecycle },
];

const Sidebar = ({ activeTool, onToolSelect }) => {
  return (
    <div className="sidebar">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            className={`sidebar-tool ${activeTool === tool.id ? "active" : ""}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <Icon size={20} />
            <span className="sidebar-tool-label">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
