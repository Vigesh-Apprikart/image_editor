import React from 'react';
import { tools, colors } from '../helper/imageToolbarHelper';
import './ImageToolbar.css';

const ImageToolbar = ({ visible = true, onToolSelect = () => {}, onClose }) => {
  if (!visible) return null;

  return (
    <div className="image-toolbar" onClick={(e) => e.stopPropagation()}>
      {tools.map((tool) => (
        <React.Fragment key={tool.id}>
          <button
            className="toolbar-tool"
            onClick={() => onToolSelect(tool.id)}
            title={tool.label || tool.id}
          >
            {tool.icon && <tool.icon size={15} className="tool-icon" />}
            {tool.label && <span className="toolbar-tool-label">{tool.label}</span>}
          </button>

          {tool.id === 'menu' && (
            <>
              {colors.map((color, i) => (
                <div
                  key={color}
                  className="color-circle-inline"
                  style={{ backgroundColor: color }}
                  onClick={() => onToolSelect(`color-${color}`)}
                  title={`Color ${color}`}
                />
              ))}
            </>
          )}

          {tool.hasDivider && <div className="divider" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ImageToolbar;