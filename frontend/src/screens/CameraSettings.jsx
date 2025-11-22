/**
 * CameraSettings Component
 * 
 * Camera adjustment and photo capture screen where users can:
 * - Adjust brightness, contrast, saturation, and sharpness via sliders
 * - Preview adjustments in real-time on camera feed
 * - Capture multiple photos for grid layouts (one per cell)
 * - Enable auto-capture with face detection
 * - View captured photos as thumbnails
 * 
 * Features:
 * - Real-time image adjustment preview
 * - Progress tracking for multi-photo grids
 * - Auto-capture with face detection
 * - Photo thumbnails gallery
 * - Camera settings persistence
 * 
 * @param {Function} updateSession - Callback to update session data
 * @param {Object} sessionData - Current session data including selected grid
 * @returns {JSX.Element} Camera settings and capture interface
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';

function CameraSettings({ updateSession, sessionData }) {
  const navigate = useNavigate();

  // Image adjustment states: Real-time adjustment values
  const [brightness, setBrightness] = useState(1); // Brightness multiplier (0.5-2)
  const [contrast, setContrast] = useState(1); // Contrast multiplier (0.5-2)
  const [saturation, setSaturation] = useState(1); // Color saturation (0-2)
  const [sharpness, setSharpness] = useState(0); // Sharpness level (0-5, inverted as blur)
  const [autoCapture, setAutoCapture] = useState(false); // Auto-capture toggle
  const [faceDetected, setFaceDetected] = useState(false); // Face detection status
  const [capturedPhotos, setCapturedPhotos] = useState([]); // Array of captured photo data URLs
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Current photo index for grid layouts
  const webcamRef = useRef(null); // Reference to webcam component
  const canvasRef = useRef(null); // Reference to canvas for face detection

  /**
   * Calculate total number of cells needed based on selected grid layout
   * Handles both old format (string ID) and new format (object with cols/rows)
   * 
   * @returns {number} Total number of photos to capture
   */
  // Get total cells needed based on grid
  const getGridCellCount = () => {
    const grid = sessionData?.selectedGrid;
    // Handle both old format (string) and new format (object)
    if (!grid) return 1;
    if (typeof grid === 'string') {
      // Old format: string ID
      if (grid === '4x6-single') return 1;
      if (grid === '2x4-vertical-2') return 2;
      if (grid === '4x6-4cut') return 4;
      if (grid === '5x7-6cut') return 6;
      return 1;
    }
    // New format: object with cols and rows
    if (grid.cols && grid.rows) {
      return grid.cols * grid.rows;
    }
    // Fallback: try to get from ID
    if (grid.id === '4x6-single') return 1;
    if (grid.id === '2x4-vertical-2') return 2;
    if (grid.id === '4x6-4cut') return 4;
    if (grid.id === '5x7-6cut') return 6;
    return 1;
  };

  const totalCells = getGridCellCount();
  const isComplete = capturedPhotos.length === totalCells;

  // Debug: log grid info when component mounts or grid changes
  useEffect(() => {
    console.log('CameraSettings - Grid info:', {
      selectedGrid: sessionData?.selectedGrid,
      totalCells,
      capturedPhotos: capturedPhotos.length,
      gridType: typeof sessionData?.selectedGrid
    });
  }, [sessionData?.selectedGrid, totalCells]);

  // Simple face detection using canvas-based approach
  useEffect(() => {
    const detectFace = async () => {
      if (!webcamRef.current) return;

      const interval = setInterval(async () => {
        try {
          const imageSrc = webcamRef.current?.getScreenshot();
          if (!imageSrc) return;

          const img = new Image();
          img.src = imageSrc;
          img.onload = () => {
            const canvas = canvasRef.current || document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Simple brightness-based face detection
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let facePixels = 0;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Detect skin tone range (simplified)
              if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
                facePixels++;
              }
            }

            const faceRatio = facePixels / (canvas.width * canvas.height);
            setFaceDetected(faceRatio > 0.05);
          };
        } catch (err) {
          // Silently handle detection errors
        }
      }, 500);

      return () => clearInterval(interval);
    };

    if (autoCapture && !isComplete) {
      detectFace();
    }
  }, [autoCapture, isComplete]);

  const apply = () => {
    updateSession({ cameraSettings: { brightness: parseFloat(brightness), contrast: parseFloat(contrast), saturation: parseFloat(saturation), sharpness: parseFloat(sharpness), autoCapture } });
    navigate('/camera-filter');
  };

  // Get camera filter from session data (set in CameraFilter.jsx)
  const getCameraFilter = () => {
    const filterStyles = {
      none: 'none',
      sepia: 'sepia(0.6)',
      vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
      cool: 'hue-rotate(200deg) saturate(1.1)',
      mono: 'grayscale(1)',
    };
    const cameraFilter = sessionData?.cameraFilter || 'none';
    const cameraBrightness = sessionData?.brightness || 100;
    const baseFilter = filterStyles[cameraFilter];
    // Convert percentage brightness to multiplier (100% = 1.0)
    const cameraBrightnessMultiplier = cameraBrightness / 100;
    // Combine with camera settings brightness (multiply them)
    const combinedBrightness = cameraBrightnessMultiplier * parseFloat(brightness);

    // Build filter string with base filter and combined brightness
    let filterParts = [];
    if (baseFilter !== 'none') {
      filterParts.push(baseFilter);
    }
    filterParts.push(`brightness(${combinedBrightness})`);
    filterParts.push(`contrast(${contrast})`);
    filterParts.push(`saturate(${saturation})`);

    return filterParts.join(' ');
  };

  // Combine camera filter with camera settings for preview and capture
  const getCombinedFilter = () => {
    return getCameraFilter();
  };

  const handleCapture = async () => {
    const settings = { brightness: parseFloat(brightness), contrast: parseFloat(contrast), saturation: parseFloat(saturation), sharpness: parseFloat(sharpness), autoCapture };
    updateSession({ cameraSettings: settings });

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = img.width;
        const h = img.height;

        canvas.width = w;
        canvas.height = h;
        // Apply both camera filter and camera settings
        ctx.filter = getCombinedFilter();
        ctx.drawImage(img, 0, 0);

        const photoData = canvas.toDataURL('image/jpeg', 0.95);
        const newPhotos = [...capturedPhotos, photoData];
        setCapturedPhotos(newPhotos);

        // Update photo index to reflect next photo to capture
        const nextIndex = newPhotos.length;
        setCurrentPhotoIndex(nextIndex);

        // If all photos captured, save and proceed
        if (newPhotos.length === totalCells) {
          updateSession({ capturedPhotos: newPhotos });
          // Small delay to show completion, then navigate
          setTimeout(() => {
            navigate('/edit');
          }, 500);
        }
      };
    } catch (err) {
      console.error('Capture failed', err);
    }
  };

  const filter = getCombinedFilter();

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="w-screen h-screen flex items-center justify-center overflow-hidden">
      <FallingHearts />
      <div
        style={{
          height: "100%",
          background: "#f7f4E8", // Cream white background
          border: "5px solid #FF6B6A", // Coral-pink border
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
        className="max-w-4xl w-full h-full bg-white rounded-2xl border-4 border-rose-200 flex flex-col">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Camera Settings - Photo {capturedPhotos.length + 1} of {totalCells}
          {capturedPhotos.length === totalCells && <span className="text-green-600 ml-2">✓ Complete!</span>}
        </h2>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all"
            style={{ width: `${(capturedPhotos.length / totalCells) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden m-4">
          <div className="overflow-y-auto pr-2">
            {/* <label className="block font-semibold text-sm">Brightness</label>
            <input type="range" min="0.5" max="2" step="0.05" value={brightness} onChange={(e) => setBrightness(e.target.value)} className="w-full" />
            <label className="block font-semibold text-sm mt-2">Contrast</label>
            <input type="range" min="0.5" max="2" step="0.05" value={contrast} onChange={(e) => setContrast(e.target.value)} className="w-full" />
            <label className="block font-semibold text-sm mt-2">Saturation</label>
            <input type="range" min="0" max="2" step="0.05" value={saturation} onChange={(e) => setSaturation(e.target.value)} className="w-full" />
            <label className="block font-semibold text-sm mt-2">Sharpness</label>
            <input type="range" min="0" max="5" step="0.5" value={sharpness} onChange={(e) => setSharpness(e.target.value)} className="w-full" />
            <div className="mt-3">
              <label className="inline-flex items-center text-sm">
                <input type="checkbox" checked={autoCapture} onChange={(e) => setAutoCapture(e.target.checked)} className="mr-2" />
                5s Auto-Capture
              </label>
            </div> */}

            {/* Show captured photos thumbnails */}
            {capturedPhotos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Captured ({capturedPhotos.length}/{totalCells})</h4>
                <div className="grid grid-cols-3 gap-2">
                  {capturedPhotos.map((photo, idx) => (
                    <div key={idx} className="border-2 border-rose-300 rounded-lg overflow-hidden">
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-sm mb-1">Preview</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden p-1 flex-1 flex items-center justify-center">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'user',
                  height: { ideal: 1280 },
                  width: { ideal: 720 }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: filter }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Real-time adjustments will apply.</p>

            {/* Capture status message */}
            {!isComplete && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-center">
                {totalCells > 1 ? (
                  <>📸 Capture {totalCells - capturedPhotos.length} more photo{totalCells - capturedPhotos.length !== 1 ? 's' : ''} to complete the grid</>
                ) : (
                  <>📸 Capture your photo</>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <button onClick={() => {
            if (capturedPhotos.length > 0) {
              const updatedPhotos = capturedPhotos.slice(0, -1);
              setCapturedPhotos(updatedPhotos);
              setCurrentPhotoIndex(updatedPhotos.length);
            } else {
              navigate('/camera-filter');
            }
          }} className="px-3 rounded-lg border-2 text-sm m-2 hover:bg-gray-100">
            {capturedPhotos.length > 0 ? 'Remove Last' : 'Back'}
          </button>
          <div className="flex gap-2 m-2">
            {!isComplete && (
              <button onClick={apply} className="px-3 py-1 rounded-lg bg-rose-300 font-bold text-xs hover:bg-rose-400">Skip Capture</button>
            )}
            <button
              onClick={handleCapture}
              disabled={isComplete}
              className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${isComplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 shadow-lg'}`}
            >
              {isComplete ? 'Complete ✓' : `📸 Capture Photo ${capturedPhotos.length + 1}/${totalCells}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraSettings;
