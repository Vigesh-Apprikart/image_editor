import React, { useState } from "react";
import "./FiltersPanel.css";
import {
  initialFilterState,
  filterCategories,
  filterAdjustments,
  getFilterCSS,
} from "../../helper/filtersPanelHelper.js";

const FiltersPanel = ({ editorRef, selectedImage }) => {
  const [selectedFilter, setSelectedFilter] = useState(initialFilterState.selectedFilter);

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter.toLowerCase());
    const adjustments = filterAdjustments[filter] || filterAdjustments["None"];
    editorRef.current?.applyFilter(adjustments);
    console.log("Filter applied:", filter, adjustments);
  };

  return (
    <div className="filters-panel">
      {Object.entries(filterCategories).map(([category, filters]) => (
        <div key={category} className="filter-category">
          <h4 className="category-title">{category}</h4>
          <div className="filter-grid">
            {filters.map((filter) => (
              <div
                key={filter}
                className={`filter-item ${selectedFilter === filter.toLowerCase() ? "active" : ""}`}
                onClick={() => handleFilterSelect(filter)}
              >
                <div
                  className="filter-preview"
                  style={{
                    backgroundImage: selectedImage ? `url(${selectedImage})` : "none",
                    backgroundColor: selectedImage ? "transparent" : "#e5e7eb",
                    filter: getFilterCSS(filter),
                  }}
                />
                <span className="filter-name">{filter}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FiltersPanel;