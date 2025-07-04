import React, { useState } from "react";
import "./FiltersPanel.css";
import {
  initialFilterState,
  filterCategories,
  filterAdjustments,
  getFilterCSS,
} from "../../helper/filtersPanelHelper.js";

const FiltersPanel = ({ editorRef, selectedImage }) => {
  const [selectedFilter, setSelectedFilter] = useState(
    initialFilterState.selectedFilter
  );
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter.toLowerCase());
    const adjustments = filterAdjustments[filter] || filterAdjustments["None"];
    editorRef.current?.applyFilter(adjustments);
  };

  return (
    <div className="filters-panel">
      {Object.entries(filterCategories).map(([category, filters]) => (
        <div
          key={category}
          className={`filter-category ${openCategories[category] ? "open" : ""}`}
        >
          <h4 className="category-title" onClick={() => toggleCategory(category)}>
            {category}
          </h4>
          {openCategories[category] && (
            <div className="filter-grid">
              {filters.map((filter) => (
                <div
                  key={filter}
                  className={`filter-item ${
                    selectedFilter === filter.toLowerCase() ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect(filter)}
                >
                  <div
                    className="filter-preview"
                    style={{
                      backgroundImage: selectedImage
                        ? `url(${selectedImage})`
                        : "none",
                      backgroundColor: selectedImage ? "transparent" : "#e5e7eb",
                      filter: getFilterCSS(filter),
                    }}
                  />
                  <span className="filter-name">{filter}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FiltersPanel;
