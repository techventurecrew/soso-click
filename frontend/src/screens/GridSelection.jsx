/**
 * GridSelection Component - Mobile Responsive Version
 * 
 * Allows users to select their preferred photo grid layout.
 * Displays visual previews of each grid option (SINGLE, V-2 CUT, 4 CUT, 6 CUT).
 * Now fully responsive for mobile devices.
 */
import React, { useState } from 'react';

function GridSelection({ updateSession = () => { } }) {
  const [selected, setSelected] = useState('4x6-single');

  // Available grid layouts with their properties
  const grids = [
    { id: '5x5-single', name: 'SINGLE', desc: 'Single photo', cols: 1, rows: 1 },
    { id: '2x4-vertical-2', name: 'V-2 CUT', desc: '2 vertical photos', cols: 2, rows: 1 },
    { id: '4x6-4cut', name: '4 CUT', desc: '4 grid cells', cols: 2, rows: 2 },
    { id: '5x7-6cut', name: '6 CUT', desc: '6 grid cells', cols: 3, rows: 2 },
  ];

  const handleContinue = () => {
    const gridData = grids.find(g => g.id === selected);
    updateSession({ selectedGrid: gridData });
    alert('Grid selected: ' + gridData.name);
  };

  const handleBack = () => {
    alert('Going back...');
  };

  /**
   * Render visual grid preview based on grid dimensions
   */
  const renderGridPreview = (grid) => {
    const cells = [];
    const totalCells = grid.cols * grid.rows;

    for (let i = 0; i < totalCells; i++) {
      cells.push(
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-400"
          style={{
            aspectRatio: grid.rows > grid.cols ? '3/4' : '4/3',
            height: '100%',
            maxWidth: '100%'
          }}
        />
      );
    }

    return (
      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
          width: '100%',
          height: '100%',
          minHeight: '80px',
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div
      style={{ background: "#f6DDD8" }}
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6"
    >
      {/* Content panel - responsive sizing */}
      <div
        style={{
          background: "#f7f4E8",
          border: "3px solid #FF6B6A",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
        className="relative w-full max-w-6xl bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col"
      >
        {/* Page title - responsive text size */}
        <h2
          className="text-center mb-4 sm:mb-6 px-2"
          style={{
            color: '#6B2D9B',
            fontSize: 'clamp(18px, 5vw, 32px)',
            fontWeight: 800,
            lineHeight: 1.2
          }}
        >
          PLEASE CHOOSE YOUR FAVOURITE GRID
        </h2>

        {/* Grid options - responsive layout (1 column on mobile, 2 on tablet+) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1 overflow-y-auto mb-4"
          style={{
            maxHeight: 'calc(100vh - 220px)',
          }}
        >
          {grids.map((grid) => (
            <button
              key={grid.id}
              onClick={() => setSelected(grid.id)}
              className={`relative rounded-xl border-3 p-3 sm:p-4 transition-all flex flex-col items-center ${selected === grid.id
                  ? 'border-rose-400 bg-rose-50 shadow-lg scale-[1.02] sm:scale-105'
                  : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
              style={{
                background: selected === grid.id ? '#FFF0F5' : '#FFF7EE',
                minHeight: '120px',
              }}
            >
              {/* Visual grid preview */}
              <div className="w-full flex-1 flex items-center justify-center mb-2 sm:mb-3">
                {renderGridPreview(grid)}
              </div>

              {/* Grid name label - responsive text */}
              <div
                className="font-bold text-base sm:text-xl"
                style={{
                  color: selected === grid.id ? '#D83A4A' : '#6B2D9B',
                }}
              >
                {grid.name}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation buttons - responsive spacing */}
        <div className="flex justify-between gap-2 sm:gap-3 mt-auto">
          <button
            onClick={handleBack}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all text-sm sm:text-base"
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-rose-400 font-bold text-white hover:bg-rose-500 shadow-lg transition-all text-sm sm:text-base"
          >
            Continue
          </button>
        </div>

        {/* Decorative bear - hidden on mobile, visible on tablet+ */}
        <img
          src="/images/teddy_left.png"
          alt="teddy bear with camera"
          className="absolute hidden sm:block"
          style={{
            left: 10,
            bottom: 90,
            width: 'clamp(80px, 10vw, 120px)',
            height: 'auto',
            zIndex: 1
          }}
        />

        {/* Decorative hearts - smaller on mobile */}
        <div className="absolute hidden sm:block" style={{ right: 20, bottom: 20, zIndex: 1 }}>
          <img
            src="/images/heart1-r.png"
            alt="heart"
            className="absolute"
            style={{ bottom: 0, right: 0, width: 24, zIndex: 1 }}
          />
          <img
            src="/images/heart2.png"
            alt="heart"
            className="absolute"
            style={{ bottom: 20, right: 15, width: 20 }}
          />
          <img
            src="/images/heart1-r.png"
            alt="heart"
            className="absolute"
            style={{ bottom: 40, right: 30, width: 28 }}
          />
        </div>
      </div>
    </div>
  );
}

export default GridSelection;