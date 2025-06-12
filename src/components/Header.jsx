import React from 'react';
import { FaUndo, FaRedo, FaDownload, FaImage } from 'react-icons/fa';
import './Header.css';

const Header = ({
  onUndo,
  onRedo,
  onDownload,
  canUndo,
  canRedo,
  hasImage
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <FaImage className="logo-icon" />
          <span className="logo-text">PhotoEditor</span>
        </div>
      </div>
      
      <div className="header-right">
        <button
          className="btn-icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <FaUndo size={16} />
        </button>
        
        <button
          className="btn-icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <FaRedo size={16} />
        </button>
        
        <button
          className="btn btn-primary"
          onClick={onDownload}
          disabled={!hasImage}
          title="Download"
        >
          <FaDownload size={14} />
          Download
        </button>
      </div>
    </header>
  );
};

export default Header;