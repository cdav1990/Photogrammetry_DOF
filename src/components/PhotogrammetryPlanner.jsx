import React, { useState, useEffect } from 'react';

const PhotogrammetryPlanner = ({ groundCoverage, distanceUnit }) => {
  // State for inputs
  const [surfaceWidth, setSurfaceWidth] = useState(10);
  const [surfaceHeight, setSurfaceHeight] = useState(10);
  const [surfaceDepth, setSurfaceDepth] = useState(0); // Optional for 3D objects
  const [horizontalOverlap, setHorizontalOverlap] = useState(60); // Default 60% overlap
  const [verticalOverlap, setVerticalOverlap] = useState(60); // Default 60% overlap
  
  // State for results
  const [numImagesRequired, setNumImagesRequired] = useState(0);
  const [effectiveCoverage, setEffectiveCoverage] = useState({ width: 0, height: 0 });
  const [totalSurfaceArea, setTotalSurfaceArea] = useState(0);
  
  // Parse ground coverage from string (e.g. "16.0 × 12.0ft")
  const parseGroundCoverage = () => {
    if (!groundCoverage) return { width: 0, height: 0 };
    
    const parts = groundCoverage.split('×');
    if (parts.length !== 2) return { width: 0, height: 0 };
    
    const width = parseFloat(parts[0].trim());
    // Remove unit from height part
    const heightPart = parts[1].trim();
    const height = parseFloat(heightPart.replace('ft', '').replace('m', ''));
    
    return { width, height };
  };
  
  // Calculate effective coverage area considering overlap
  const calculateEffectiveCoverage = (coverage) => {
    const hOverlapFactor = (100 - horizontalOverlap) / 100;
    const vOverlapFactor = (100 - verticalOverlap) / 100;
    
    return {
      width: coverage.width * hOverlapFactor,
      height: coverage.height * vOverlapFactor
    };
  };
  
  // Calculate total surface area
  const calculateTotalSurfaceArea = () => {
    if (surfaceDepth === 0) {
      // 2D surface (e.g., a wall or floor)
      return surfaceWidth * surfaceHeight;
    } else {
      // 3D object (simplified as a box)
      // Front + Back + Left + Right + Top + Bottom
      return 2 * (surfaceWidth * surfaceHeight + surfaceWidth * surfaceDepth + surfaceHeight * surfaceDepth);
    }
  };
  
  // Calculate number of images required
  const calculateImagesRequired = () => {
    const coverage = parseGroundCoverage();
    const effective = calculateEffectiveCoverage(coverage);
    const totalArea = calculateTotalSurfaceArea();
    
    if (effective.width <= 0 || effective.height <= 0) return 0;
    
    // Calculate how many images are needed in each dimension
    const imagesAcross = Math.ceil(surfaceWidth / effective.width);
    const imagesDown = Math.ceil(surfaceHeight / effective.height);
    
    let totalImages = imagesAcross * imagesDown;
    
    // If we have depth (3D object), multiply by sides
    if (surfaceDepth > 0) {
      // For a box, we need images for all 6 sides
      totalImages = totalImages * 6;
    }
    
    return {
      total: totalImages,
      across: imagesAcross,
      down: imagesDown,
      effectiveCoverage: effective,
      totalArea
    };
  };
  
  // Update calculations when inputs change
  useEffect(() => {
    if (groundCoverage) {
      const result = calculateImagesRequired();
      setNumImagesRequired(result.total);
      setEffectiveCoverage(result.effectiveCoverage);
      setTotalSurfaceArea(result.totalArea);
    }
  }, [groundCoverage, surfaceWidth, surfaceHeight, surfaceDepth, horizontalOverlap, verticalOverlap]);
  
  return (
    <div className="photogrammetry-planner">
      <h3>Photogrammetry Capture Planner</h3>
      
      <div className="planner-inputs">
        <div className="input-section">
          <h4>Subject Dimensions</h4>
          <div className="input-group">
            <label htmlFor="surface-width">Width:</label>
            <div className="range-value">
              <input
                type="number"
                id="surface-width"
                min="0.1"
                max="1000"
                step="0.1"
                value={surfaceWidth}
                onChange={(e) => setSurfaceWidth(parseFloat(e.target.value) || 0)}
              />
              <span>{distanceUnit}</span>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="surface-height">Height:</label>
            <div className="range-value">
              <input
                type="number"
                id="surface-height"
                min="0.1"
                max="1000"
                step="0.1"
                value={surfaceHeight}
                onChange={(e) => setSurfaceHeight(parseFloat(e.target.value) || 0)}
              />
              <span>{distanceUnit}</span>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="surface-depth">Depth (optional):</label>
            <div className="range-value">
              <input
                type="number"
                id="surface-depth"
                min="0"
                max="1000"
                step="0.1"
                value={surfaceDepth}
                onChange={(e) => setSurfaceDepth(parseFloat(e.target.value) || 0)}
              />
              <span>{distanceUnit}</span>
            </div>
            <small className="form-tip">Leave at 0 for flat surfaces</small>
          </div>
        </div>
        
        <div className="input-section">
          <h4>Overlap Settings</h4>
          <div className="input-group">
            <label htmlFor="horizontal-overlap">Horizontal Overlap:</label>
            <div className="range-value">
              <input
                type="number"
                id="horizontal-overlap"
                min="1"
                max="90"
                step="1"
                value={horizontalOverlap}
                onChange={(e) => setHorizontalOverlap(parseInt(e.target.value) || 0)}
              />
              <span>%</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              step="1"
              value={horizontalOverlap}
              onChange={(e) => setHorizontalOverlap(parseInt(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="vertical-overlap">Vertical Overlap:</label>
            <div className="range-value">
              <input
                type="number"
                id="vertical-overlap"
                min="1"
                max="90"
                step="1"
                value={verticalOverlap}
                onChange={(e) => setVerticalOverlap(parseInt(e.target.value) || 0)}
              />
              <span>%</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              step="1"
              value={verticalOverlap}
              onChange={(e) => setVerticalOverlap(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      <div className="planner-results">
        <div className="result-card">
          <h4>Total Surface Area</h4>
          <p>{totalSurfaceArea.toFixed(1)} {distanceUnit === 'm' ? 'm²' : 'ft²'}</p>
          {surfaceDepth > 0 && <small>Box-shaped object with 6 sides</small>}
        </div>
        
        <div className="result-card">
          <h4>Effective Image Coverage</h4>
          <p>{effectiveCoverage.width.toFixed(1)} × {effectiveCoverage.height.toFixed(1)} {distanceUnit}</p>
          <small>After {horizontalOverlap}% horizontal and {verticalOverlap}% vertical overlap</small>
        </div>
        
        <div className="result-card highlight">
          <h4>Images Required</h4>
          <p className="large-number">{numImagesRequired}</p>
        </div>
      </div>
      
      <div className="planner-tips">
        <h4>Photogrammetry Tips</h4>
        <ul className="tips-list">
          <li>Use consistent lighting to avoid shadows that can confuse photogrammetry software</li>
          <li>60-80% overlap is typically recommended for optimal results</li>
          <li>For 3D objects, capture images at multiple heights around the object</li>
          <li>For shiny or transparent surfaces, consider using polarizing filters</li>
          <li>Consider using a higher f-stop (f/8-f/11) to maximize depth of field</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotogrammetryPlanner; 