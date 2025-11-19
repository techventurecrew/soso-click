import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

function CameraFilter({ updateSession }) {
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const navigate = useNavigate();

  const apply = () => {
    updateSession({ cameraFilter: filter, brightness });
    navigate('/camera-settings');
  };

  const filterStyles = {
    none: 'none',
    sepia: 'sepia(0.6)',
    vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
    cool: 'hue-rotate(200deg) saturate(1.1)',
    mono: 'grayscale(1)',
  };

  const getCombinedFilter = () => {
    const baseFilter = filterStyles[filter];
    const brightnessFilter = `brightness(${brightness}%)`;
    return baseFilter === 'none' ? brightnessFilter : `${baseFilter} ${brightnessFilter}`;
  };

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="w-screen h-screen flex items-center justify-center overflow-hidden bg-pink-50">
      <div className="max-w-6xl w-full h-full bg-white rounded-3xl p-6 border-4 border-rose-200 flex flex-col"
        style={{
          height: "90%",
          background: "#f7f4E8",
          border: "5px solid #FF6B6A",
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h2 className="text-2xl font-bold text-center mb-2 pt-6">Camera Color Effects</h2>

        <div className="flex-1 flex gap-4 overflow-hidden px-6">
          {/* Brightness Slider - Left Side */}
          <div className="flex flex-col items-center gap-3 py-4">
            <h3 className="font-semibold text-sm writing-mode-vertical ">Brightness</h3>
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-semibold">{brightness}%</span>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                className="brightness-slider"
                style={{
                  writingMode: 'bt-lr',
                  WebkitAppearance: 'slider-vertical',
                  width: '8px',
                  height: '300px',
                  background: 'linear-gradient(to top, #333 0%, #fff 100%)',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Preview Section - Middle */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="font-semibold text-sm mb-1">Preview</h3>
            <div
              style={{
                backgroundColor: "#f6DDD8"
              }}
              className="rounded-lg overflow-hidden p-1 flex-1 flex items-center justify-center">
              <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user', height: { ideal: 1280 }, width: { ideal: 720 } }}
                style={{
                  width: '80%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: getCombinedFilter()
                }}
              />
            </div>

            {/* Buttons centered below preview */}
            <div className="flex justify-center gap-3 mt-4 pb-2">
              <button onClick={() => navigate('/grid')} className="px-6 py-2 rounded-lg border-2 text-sm hover:bg-gray-100">Back</button>
              <button onClick={() => navigate('/camera-settings')} className="px-6 py-2 rounded-lg border-2 text-sm hover:bg-gray-100">Skip</button>
              <button onClick={apply} className="px-6 py-2 rounded-lg bg-rose-300 font-bold text-sm hover:bg-rose-400">Apply</button>
            </div>
          </div>

          {/* Filters Section - Right Side */}
          <div className="w-64 flex flex-col gap-3">
            <h3 className="font-semibold text-sm">Filters</h3>
            <div className="flex flex-col  gap-3 overflow-x-auto">
              {Object.keys(filterStyles).map(key => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex-shrink-0 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${filter === key ? 'border-rose-500 bg-rose-100' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div
                    style={{ filter: filterStyles[key] }}
                    className="w-[100%] h-16 bg-gray-900 rounded-lg "
                  />
                  <div className="capitalize text-xs">{key}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraFilter;