import React from 'react';
import { FaFont, FaCrop, FaAdjust, FaFilter, FaMagic } from 'react-icons/fa';
import './Sidebar.css';

const tools = [
  { id: 'text', label: 'Text', icon: FaFont },
  // { id: 'crop', label: 'Crop', icon: FaCrop },
  { id: 'adjust', label: 'Adjust', icon: FaAdjust },
  { id: 'filters', label: 'Filters', icon: FaFilter },
  { id: 'effects', label: 'Effects', icon: FaMagic },
];

const Sidebar = ({ activeTool, onToolSelect }) => {
  return (
    <div className="sidebar">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            className={`sidebar-tool ${activeTool === tool.id ? 'active' : ''}`}
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