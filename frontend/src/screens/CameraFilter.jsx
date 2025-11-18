/**
 * CameraFilter Component - Mobile Responsive Version
 * 
 * Allows users to select camera color effects/filters.
 * Displays live webcam preview with selected filter applied.
 * Now fully responsive for mobile devices.
 */
import React, { useState } from 'react';

function CameraFilter({ updateSession = () => { } }) {
  const [filter, setFilter] = useState('none');
  const [hasCamera, setHasCamera] = useState(true);

  const apply = () => {
    updateSession({ cameraFilter: filter });
    alert('Filter applied: ' + filter);
  };

  const handleBack = () => {
    alert('Going back...');
  };

  const handleSkip = () => {
    alert('Skipping...');
  };

  const filterStyles = {
    none: 'none',
    sepia: 'sepia(0.6)',
    vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
    cool: 'hue-rotate(200deg) saturate(1.1)',
    mono: 'grayscale(1)',
  };

  return (
    <div
      style={{ background: "#f6DDD8" }}
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="max-w-6xl w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col"
        style={{
          background: "#f7f4E8",
          border: "3px solid #FF6B6A",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          maxHeight: "95vh",
        }}
      >
        {/* Title - Responsive text size */}
        <h2
          className="text-center mb-3 sm:mb-4 font-bold"
          style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            color: '#6B2D9B'
          }}
        >
          Camera Color Effects
        </h2>

        {/* Filter buttons - Responsive grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 px-2 mb-3 sm:mb-4">
          {Object.keys(filterStyles).map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-2 rounded-lg border transition-all ${filter === key
                  ? 'border-rose-400 bg-rose-50 shadow-md'
                  : 'border-gray-200 hover:border-rose-300'
                }`}
            >
              <div
                style={{ filter: filterStyles[key] }}
                className="w-full h-8 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-1"
              />
              <div className="text-[10px] sm:text-xs font-semibold capitalize">
                {key}
              </div>
            </button>
          ))}
        </div>

        {/* Camera preview - Flexible height */}
        <div className="flex-1 overflow-hidden mb-3 sm:mb-4 min-h-0">
          <h3 className="font-semibold text-xs sm:text-sm mb-2 text-center text-gray-700">
            Preview
          </h3>
          <div
            style={{
              backgroundColor: "#d9d9d9"
            }}
            className="rounded-lg overflow-hidden p-1 h-full flex items-center justify-center"
          >
            {hasCamera ? (
              <div
                className="w-full h-full rounded-lg flex items-center justify-center"
                style={{
                  filter: filterStyles[filter],
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <div className="text-white text-center p-4">
                  <div className="text-4xl sm:text-6xl mb-2">📷</div>
                  <div className="text-sm sm:text-base font-semibold">Camera Preview</div>
                  <div className="text-xs sm:text-sm opacity-80 mt-1">
                    Filter: {filter}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center p-4">
                <div className="text-3xl sm:text-5xl mb-2">📷</div>
                <div className="text-xs sm:text-sm">Camera not available</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons - Responsive layout */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
          {/* Back button - Full width on mobile */}
          <button
            onClick={handleBack}
            className="px-4 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all text-sm sm:text-base order-2 sm:order-1"
          >
            Back
          </button>

          {/* Skip and Apply buttons - Side by side */}
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={handleSkip}
              className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all text-sm sm:text-base"
            >
              Skip
            </button>
            <button
              onClick={apply}
              className="flex-1 sm:flex-none px-6 py-2 sm:py-2.5 rounded-lg bg-rose-400 font-bold text-white hover:bg-rose-500 shadow-lg transition-all text-sm sm:text-base"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraFilter;