/**
 * EditScreen Component
 * 
 * Photo editing and customization screen where users can:
 * - Apply filters and presets to photos
 * - Adjust brightness, contrast, saturation
 * - Add stickers to photos by clicking on the canvas
 * - Navigate between multiple photos in a grid layout
 * - Generate composite image when all photos are edited
 * 
 * Features:
 * - Canvas-based photo editing with real-time preview
 * - Filter presets (Original, B&W, Vintage, Bright, Soft)
 * - Manual adjustments via sliders
 * - Sticker placement system (emoji stickers)
 * - Photo navigation for multi-photo grids
 * - Automatic composite generation for grid layouts
 * 
 * @param {Object} sessionData - Current session data including captured photos
 * @param {Function} updateSession - Callback to update session data
 * @returns {JSX.Element} Photo editing interface
 */

import React, { useRef, useEffect, useState } from 'react';




import { useNavigate } from 'react-router-dom';
import { createGridComposite } from '../utils/imageComposite';

function EditScreen({ sessionData, updateSession }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [allEditedPhotos, setAllEditedPhotos] = useState({});
  const [filters, setFilters] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: 0,
    blur: 0,
  });
  const [stickers, setStickers] = useState({});
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [selectedStickerIndex, setSelectedStickerIndex] = useState(null);

  // Image-based stickers - using emoji as placeholder, but these would be actual image URLs
  const stickerOptions = [
    { id: 1, src: '❤️', type: 'emoji' },
    { id: 2, src: '⭐', type: 'emoji' },
    { id: 3, src: '😎', type: 'emoji' },
    { id: 4, src: '🎉', type: 'emoji' },
    { id: 5, src: '✨', type: 'emoji' },
    { id: 6, src: '🌟', type: 'emoji' },
    { id: 7, src: '💫', type: 'emoji' },
    { id: 8, src: '🎈', type: 'emoji' },
    { id: 9, src: '🎊', type: 'emoji' },
    { id: 10, src: '👑', type: 'emoji' },
  ];

  const photos = sessionData?.capturedPhotos || (sessionData?.capturedPhoto ? [sessionData.capturedPhoto] : []);
  const currentPhoto = photos[currentPhotoIndex];
  const currentStickers = stickers[currentPhotoIndex] || [];

  useEffect(() => {
    if (!photos || photos.length === 0) {
      navigate('/camera-settings');
      return;
    }
    drawCanvas();
  }, [currentPhoto, filters, currentStickers]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = currentPhoto;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = `
        brightness(${filters.brightness})
        contrast(${filters.contrast})
        saturate(${filters.saturation})
        grayscale(${filters.grayscale})
        blur(${filters.blur}px)
      `;

      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

    };
  };

  const handleDragStart = (e, sticker) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedSticker(sticker);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedSticker) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newSticker = {
      ...draggedSticker,
      x: x,
      y: y,
      size: 80,
      rotation: 0,
      id: Date.now(),
    };

    const newStickers = [...currentStickers, newSticker];
    setStickers({ ...stickers, [currentPhotoIndex]: newStickers });
    setDraggedSticker(null);
  };

  const handleStickerDragStart = (e, index) => {
    e.stopPropagation();
    setSelectedStickerIndex(index);
  };

  const handleStickerDrag = (e, index) => {
    if (e.clientX === 0 && e.clientY === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const updatedStickers = [...currentStickers];
    updatedStickers[index] = {
      ...updatedStickers[index],
      x: x,
      y: y,
    };
    setStickers({ ...stickers, [currentPhotoIndex]: updatedStickers });
  };

  const deleteSticker = (index) => {
    const updatedStickers = currentStickers.filter((_, i) => i !== index);
    setStickers({ ...stickers, [currentPhotoIndex]: updatedStickers });
    setSelectedStickerIndex(null);
  };

  const resizeSticker = (index, delta) => {
    const updatedStickers = [...currentStickers];
    updatedStickers[index] = {
      ...updatedStickers[index],
      size: Math.max(40, Math.min(200, updatedStickers[index].size + delta)),
    };
    setStickers({ ...stickers, [currentPhotoIndex]: updatedStickers });
  };

  const rotateSticker = (index, delta) => {
    const updatedStickers = [...currentStickers];
    updatedStickers[index] = {
      ...updatedStickers[index],
      rotation: (updatedStickers[index].rotation + delta) % 360,
    };
    setStickers({ ...stickers, [currentPhotoIndex]: updatedStickers });
  };

  const applyPreset = (preset) => {
    const presets = {
      original: { brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 },
      blackWhite: { brightness: 1, contrast: 1.2, saturation: 0, grayscale: 1, blur: 0 },
      vintage: { brightness: 1.1, contrast: 0.9, saturation: 0.8, grayscale: 0.3, blur: 0 },
      bright: { brightness: 1.3, contrast: 1.1, saturation: 1.2, grayscale: 0, blur: 0 },
      soft: { brightness: 1.1, contrast: 0.9, saturation: 0.9, grayscale: 0, blur: 1 },
    };
    setFilters(presets[preset]);
  };

  const saveCurrentPhoto = async () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.filter = `
      brightness(${filters.brightness})
      contrast(${filters.contrast})
      saturate(${filters.saturation})
      grayscale(${filters.grayscale})
      blur(${filters.blur}px)
    `;

    const img = new Image();
    img.src = currentPhoto;

    await new Promise((resolve) => {
      img.onload = () => {
        tempCtx.drawImage(img, 0, 0);
        tempCtx.filter = 'none';

        currentStickers.forEach(sticker => {
          tempCtx.save();
          tempCtx.translate(sticker.x, sticker.y);
          tempCtx.rotate((sticker.rotation * Math.PI) / 180);
          tempCtx.font = `${sticker.size}px Arial`;
          tempCtx.textAlign = 'center';
          tempCtx.textBaseline = 'middle';
          tempCtx.fillText(sticker.src, 0, 0);
          tempCtx.restore();
        });

        resolve();
      };
    });

    const editedPhoto = tempCanvas.toDataURL('image/jpeg', 0.95);
    setAllEditedPhotos({ ...allEditedPhotos, [currentPhotoIndex]: editedPhoto });
    return editedPhoto;
  };

  const handleNext = async () => {
    const currentEditedPhoto = await saveCurrentPhoto();
    const updatedEditedPhotos = { ...allEditedPhotos };
    if (currentEditedPhoto) {
      updatedEditedPhotos[currentPhotoIndex] = currentEditedPhoto;
    }

    const finalPhotos = photos.map((_, idx) => {
      if (updatedEditedPhotos[idx]) return updatedEditedPhotos[idx];
      return photos[idx];
    });

    // Get grid layout from session data
    const grid = sessionData.selectedGrid || { cols: 1, rows: 1, id: '4x6-single' };
    const totalCells = grid.cols * grid.rows;

    // If multiple photos and grid layout, create composite image
    let compositeImage = null;
    if (finalPhotos.length > 1 && totalCells > 1 && finalPhotos.length === totalCells) {
      try {
        compositeImage = await createGridComposite(finalPhotos, grid, 300, 3);
        console.log('Composite image created successfully');
      } catch (error) {
        console.error('Error creating composite:', error);
        // Continue without composite if error occurs
      }
    } else if (finalPhotos.length === 1) {
      // Single photo - use it as the composite
      compositeImage = finalPhotos[0];
    }

    updateSession({
      editedPhotos: finalPhotos,
      compositeImage: compositeImage || finalPhotos[0] // Fallback to first photo if no composite
    });

    // Navigate to frame selection instead of share
    navigate('/frame-selection');
  };

  const handlePreviousPhoto = () => {
    saveCurrentPhoto();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      setFilters({ brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 });
    }
  };

  const handleNextPhoto = () => {
    saveCurrentPhoto();
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      setFilters({ brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 });
    }
  };

  const resetStickers = () => {
    setStickers({ ...stickers, [currentPhotoIndex]: [] });
    setSelectedStickerIndex(null);
  };

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="items-center justify-center">
      <div className="text-center mb-1 pt-2">
        <h2 className="text-2xl font-bold text-gray-900">Edit Photo {currentPhotoIndex + 1} of {photos.length}</h2>
        <p className="text-xs text-gray-600">Filters, adjustments, stickers</p>
      </div>
      <div
        style={{
          height: "90%",
          background: "#f7f4E8",
          border: "5px solid #FF6B6A",
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          borderRadius: "10px"
        }}
        className="max-w-7xl mx-auto w-full h-full flex flex-col">

        <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden min-h-0 m-3">
          <div className="col-span-1 min-h-0">
            <div className="card p-2 h-full flex flex-col">
              <div
                ref={containerRef}
                className="rounded-xl overflow-hidden flex-1 min-h-0 relative"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />

                {currentStickers.map((sticker, index) => (
                  <div
                    key={sticker.id}
                    draggable
                    onDragStart={(e) => handleStickerDragStart(e, index)}
                    onDrag={(e) => handleStickerDrag(e, index)}
                    onClick={() => setSelectedStickerIndex(index)}
                    style={{
                      position: 'absolute',
                      left: `${(sticker.x / canvasRef.current?.width) * 100}%`,
                      top: `${(sticker.y / canvasRef.current?.height) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                      fontSize: `${sticker.size * 0.5}px`,
                      cursor: 'move',
                      userSelect: 'none',
                      zIndex: selectedStickerIndex === index ? 20 : 10,
                    }}
                    className={`${selectedStickerIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {sticker.src}
                  </div>
                ))}
              </div>

              {selectedStickerIndex !== null && (
                <div className="mt-2 p-2 bg-gray-100 rounded-lg flex gap-2 items-center justify-center">
                  <button
                    onClick={() => resizeSticker(selectedStickerIndex, -10)}
                    className="px-2 py-1 bg-white rounded border text-xs font-bold hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold">Size</span>
                  <button
                    onClick={() => resizeSticker(selectedStickerIndex, 10)}
                    className="px-2 py-1 bg-white rounded border text-xs font-bold hover:bg-gray-50"
                  >
                    +
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>

                  <button
                    onClick={() => rotateSticker(selectedStickerIndex, -15)}
                    className="px-2 py-1 bg-white rounded border text-xs font-bold hover:bg-gray-50"
                  >
                    ↺
                  </button>
                  <span className="text-xs font-semibold">Rotate</span>
                  <button
                    onClick={() => rotateSticker(selectedStickerIndex, 15)}
                    className="px-2 py-1 bg-white rounded border text-xs font-bold hover:bg-gray-50"
                  >
                    ↻
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>

                  <button
                    onClick={() => deleteSticker(selectedStickerIndex)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="mt-1 flex justify-center gap-1">
                <button
                  onClick={() => navigate('/camera-settings')}
                  className="text-xs py-1 px-2 rounded-lg border-2 hover:bg-gray-100"
                >
                  ← Back
                </button>
                {photos.length > 1 && currentPhotoIndex > 0 && (
                  <button
                    onClick={handlePreviousPhoto}
                    className="text-xs py-1 px-2 rounded-lg border-2 hover:bg-gray-100"
                  >
                    Prev
                  </button>
                )}
                {photos.length > 1 && currentPhotoIndex < photos.length - 1 && (
                  <button
                    onClick={handleNextPhoto}
                    className="text-xs py-1 px-2 rounded-lg bg-gray-300 font-bold hover:bg-gray-400"
                  >
                    Next
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="text-xs py-1 px-2 rounded-lg bg-rose-300 font-bold hover:bg-rose-400"
                >
                  {photos.length > 1 ? `Done (${currentPhotoIndex + 1}/${photos.length})` : 'Next'} →
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 h-full overflow-y-auto min-h-0">
            <div className="card h-full space-y-2 p-3">
              <div>
                <h3 className="text-md font-bold mb-1">Presets</h3>
                <div className="grid grid-cols-2 gap-1 py-3">
                  {['original', 'blackWhite', 'vintage', 'bright', 'soft'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => applyPreset(preset)}
                      className="p-1 border-2 border-gray-200 rounded text-xs font-semibold capitalize hover:border-rose-400"
                    >
                      {preset === 'blackWhite' ? 'B&W' : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-bold mb-1">Adjustments</h3>
                <div className="space-y-1 text-xs">
                  <div>
                    <label className="block font-semibold text-sm">Bright</label>
                    <input type="range" min="0.5" max="2" step="0.1" value={filters.brightness} onChange={(e) => setFilters({ ...filters, brightness: parseFloat(e.target.value) })} className="w-full h-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-sm">Contrast</label>
                    <input type="range" min="0.5" max="2" step="0.1" value={filters.contrast} onChange={(e) => setFilters({ ...filters, contrast: parseFloat(e.target.value) })} className="w-full h-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-sm">Satur</label>
                    <input type="range" min="0" max="2" step="0.1" value={filters.saturation} onChange={(e) => setFilters({ ...filters, saturation: parseFloat(e.target.value) })} className="w-full h-2" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-md font-bold">Stickers</h3>
                  <button onClick={resetStickers} className="text-xs bg-red-500 text-white font-bold px-4 py-1.5 rounded hover:bg-red-600">Clear All</button>
                </div>
                <p className="text-sm text-gray-600 mb-2">Drag & drop stickers onto photo</p>
                <div className="grid grid-cols-5 gap-2">
                  {stickerOptions.map(sticker => (
                    <div
                      key={sticker.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sticker)}
                      className="p-2 text-2xl border-2 rounded cursor-move transition-all hover:border-rose-400 hover:scale-110 bg-white flex items-center justify-center"
                    >
                      {sticker.src}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditScreen;