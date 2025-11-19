import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

function CombinedCamera({ updateSession, sessionData }) {
    const navigate = useNavigate();

    // View toggle state
    const [activeView, setActiveView] = useState('filter'); // 'filter' or 'settings'

    // Filter states
    const [filter, setFilter] = useState('none');
    const [filterBrightness, setFilterBrightness] = useState(100);

    // Camera settings states
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [saturation, setSaturation] = useState(1);
    const [sharpness, setSharpness] = useState(0);
    const [autoCapture, setAutoCapture] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    // Filter styles
    const filterStyles = {
        none: 'none',
        sepia: 'sepia(0.6)',
        vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
        cool: 'hue-rotate(200deg) saturate(1.1)',
        mono: 'grayscale(1)',
    };

    const getCombinedFilter = () => {
        const baseFilter = filterStyles[filter];
        const brightnessFilter = `brightness(${filterBrightness}%)`;
        return baseFilter === 'none' ? brightnessFilter : `${baseFilter} ${brightnessFilter}`;
    };

    // Get grid cell count
    const getGridCellCount = () => {
        const grid = sessionData?.selectedGrid;
        if (!grid) return 1;
        if (typeof grid === 'string') {
            if (grid === '4x6-single') return 1;
            if (grid === '2x4-vertical-2') return 2;
            if (grid === '4x6-4cut') return 4;
            if (grid === '5x7-6cut') return 6;
            return 1;
        }
        if (grid.cols && grid.rows) {
            return grid.cols * grid.rows;
        }
        if (grid.id === '4x6-single') return 1;
        if (grid.id === '2x4-vertical-2') return 2;
        if (grid.id === '4x6-4cut') return 4;
        if (grid.id === '5x7-6cut') return 6;
        return 1;
    };

    const totalCells = getGridCellCount();
    const isComplete = capturedPhotos.length === totalCells;

    // Face detection
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

                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        let facePixels = 0;

                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
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

        if (autoCapture && !isComplete && activeView === 'settings') {
            detectFace();
        }
    }, [autoCapture, isComplete, activeView]);

    // Apply filter settings
    const applyFilter = () => {
        updateSession({ cameraFilter: filter, brightness: filterBrightness });
        navigate('/camera-settings');
    };

    // Handle photo capture
    const handleCapture = async () => {
        const settings = {
            brightness: parseFloat(brightness),
            contrast: parseFloat(contrast),
            saturation: parseFloat(saturation),
            sharpness: parseFloat(sharpness),
            autoCapture
        };
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
                ctx.filter = `brightness(${settings.brightness}) contrast(${settings.contrast}) saturate(${settings.saturation})`;
                ctx.drawImage(img, 0, 0);

                const photoData = canvas.toDataURL('image/jpeg', 0.95);
                const newPhotos = [...capturedPhotos, photoData];
                setCapturedPhotos(newPhotos);

                const nextIndex = newPhotos.length;
                setCurrentPhotoIndex(nextIndex);

                if (newPhotos.length === totalCells) {
                    updateSession({ capturedPhotos: newPhotos });
                    setTimeout(() => {
                        navigate('/edit');
                    }, 500);
                }
            };
        } catch (err) {
            console.error('Capture failed', err);
        }
    };

    const settingsFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

    return (
        <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="w-screen h-screen flex items-center justify-center overflow-hidden">
            <div
                style={{
                    height: "90%",
                    background: "#f7f4E8",
                    border: "5px solid #FF6B6A",
                    padding: 0,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
                className="max-w-6xl w-full h-full bg-white rounded-3xl flex flex-col">

                {/* Header with title and progress for settings view */}
                <div className="pt-6 px-6">
                    <h2 className="text-2xl font-bold text-center mb-2">
                        {activeView === 'filter' ? 'Camera Color Effects' : `Camera Settings - Photo ${capturedPhotos.length + 1} of ${totalCells}`}
                        {activeView === 'settings' && capturedPhotos.length === totalCells && (
                            <span className="text-green-600 ml-2">✓ Complete!</span>
                        )}
                    </h2>

                    {/* Progress bar for settings view */}
                    {activeView === 'settings' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                                className="bg-rose-500 h-2 rounded-full transition-all"
                                style={{ width: `${(capturedPhotos.length / totalCells) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 flex gap-4 overflow-hidden px-6">
                    {/* Left Sidebar - Brightness Slider (Filter) or Settings Controls */}
                    <div className="flex flex-col items-center gap-3 py-4" style={{ width: activeView === 'filter' ? '80px' : '280px' }}>
                        {activeView === 'filter' ? (
                            <>
                                <h3 className="font-semibold text-sm">Brightness</h3>
                                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                    <span className="text-xs font-semibold">{filterBrightness}%</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={filterBrightness}
                                        onChange={(e) => setFilterBrightness(e.target.value)}
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
                            </>
                        ) : (
                            <div className="w-full overflow-y-auto pr-2">
                                <label className="block font-semibold text-sm">Brightness</label>
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
                                </div>

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
                        )}
                    </div>

                    {/* Preview Section - Middle */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-semibold text-sm mb-1">Preview</h3>
                        <div
                            style={{ backgroundColor: "#f6DDD8" }}
                            className="rounded-lg overflow-hidden p-1 flex-1 flex items-center justify-center">
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                    facingMode: 'user',
                                    height: { ideal: 1280 },
                                    width: { ideal: 720 }
                                }}
                                style={{
                                    width: '80%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    filter: activeView === 'filter' ? getCombinedFilter() : settingsFilter
                                }}
                            />
                        </div>

                        {activeView === 'settings' && !isComplete && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-center">
                                {totalCells > 1 ? (
                                    <>📸 Capture {totalCells - capturedPhotos.length} more photo{totalCells - capturedPhotos.length !== 1 ? 's' : ''} to complete the grid</>
                                ) : (
                                    <>📸 Capture your photo</>
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-center gap-3 mt-4 pb-2">
                            {activeView === 'filter' ? (
                                <>
                                    <button onClick={() => navigate('/grid')} className="px-6 py-2 rounded-lg border-2 text-sm hover:bg-gray-100">Back</button>
                                    <button onClick={() => navigate('/camera-settings')} className="px-6 py-2 rounded-lg border-2 text-sm hover:bg-gray-100">Skip</button>
                                    <button onClick={applyFilter} className="px-6 py-2 rounded-lg bg-rose-300 font-bold text-sm hover:bg-rose-400">Apply</button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            if (capturedPhotos.length > 0) {
                                                const updatedPhotos = capturedPhotos.slice(0, -1);
                                                setCapturedPhotos(updatedPhotos);
                                                setCurrentPhotoIndex(updatedPhotos.length);
                                            } else {
                                                setActiveView('filter');
                                            }
                                        }}
                                        className="px-3 py-2 rounded-lg border-2 text-sm hover:bg-gray-100">
                                        {capturedPhotos.length > 0 ? 'Remove Last' : 'Back to Filters'}
                                    </button>
                                    <div className="flex gap-2">
                                        {!isComplete && (
                                            <button onClick={() => navigate('/edit')} className="px-3 py-1 rounded-lg bg-rose-300 font-bold text-xs hover:bg-rose-400">Skip Capture</button>
                                        )}
                                        <button
                                            onClick={handleCapture}
                                            disabled={isComplete}
                                            className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${isComplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 shadow-lg'}`}
                                        >
                                            {isComplete ? 'Complete ✓' : `📸 Capture Photo ${capturedPhotos.length + 1}/${totalCells}`}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Filters or Settings Toggle Button */}
                    <div className="w-64 flex flex-col gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveView('filter')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'filter'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                Filters
                            </button>
                            <button
                                onClick={() => setActiveView('settings')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'settings'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                Settings
                            </button>
                        </div>

                        {activeView === 'filter' && (
                            <>
                                <h3 className="font-semibold text-sm">Filters</h3>
                                <div className="flex flex-col gap-3 overflow-y-auto">
                                    {Object.keys(filterStyles).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => setFilter(key)}
                                            className={`flex-shrink-0 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${filter === key
                                                ? 'border-rose-500 bg-rose-100'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div
                                                style={{ filter: filterStyles[key] }}
                                                className="w-full h-16 bg-gray-900 rounded-lg"
                                            />
                                            <div className="capitalize text-xs mt-1">{key}</div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeView === 'settings' && (
                            <div className="flex-1 flex items-center justify-center text-center text-gray-500 text-sm p-4">
                                Adjust settings using the controls on the left
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CombinedCamera;