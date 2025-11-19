import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function FrameSelectionScreen({ sessionData, updateSession }) {
    const navigate = useNavigate();
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const compositeImage = sessionData?.compositeImage;
    const canvasRef = useRef(null);

    // Frame options with different styles
    const frameOptions = [
        {
            id: 'none',
            name: 'No Frame',
            borderWidth: 0,
            borderColor: 'transparent',
            padding: 0
        },
        {
            id: 'classic-white',
            name: 'Classic White',
            borderWidth: 20,
            borderColor: '#FFFFFF',
            padding: 10,
            shadow: '0 4px 20px rgba(0,0,0,0.15)'
        },
        {
            id: 'elegant-black',
            name: 'Elegant Black',
            borderWidth: 15,
            borderColor: '#000000',
            padding: 5,
            shadow: '0 4px 20px rgba(0,0,0,0.3)'
        },
        {
            id: 'polaroid',
            name: 'Polaroid',
            borderWidth: 15,
            borderColor: '#F5F5F5',
            padding: 15,
            bottomPadding: 60,
            shadow: '0 4px 15px rgba(0,0,0,0.2)'
        },
        {
            id: 'gold-luxury',
            name: 'Gold Luxury',
            borderWidth: 25,
            borderColor: '#FFD700',
            padding: 8,
            innerBorder: '3px solid #B8860B',
            shadow: '0 6px 25px rgba(0,0,0,0.2)'
        },
        {
            id: 'modern-rose',
            name: 'Modern Rose',
            borderWidth: 18,
            borderColor: '#FF6B6A',
            padding: 10,
            shadow: '0 4px 20px rgba(255,107,106,0.3)'
        },
        {
            id: 'vintage-wood',
            name: 'Vintage Wood',
            borderWidth: 30,
            borderColor: '#8B4513',
            padding: 0,
            backgroundImage: 'linear-gradient(45deg, #654321 25%, #8B4513 25%, #8B4513 50%, #654321 50%, #654321 75%, #8B4513 75%, #8B4513)',
            shadow: '0 5px 20px rgba(0,0,0,0.4)'
        },
        {
            id: 'neon-glow',
            name: 'Neon Glow',
            borderWidth: 12,
            borderColor: '#00FFFF',
            padding: 5,
            shadow: '0 0 20px #00FFFF, 0 0 40px #00FFFF'
        },
        {
            id: 'double-border',
            name: 'Double Border',
            borderWidth: 20,
            borderColor: '#2C3E50',
            padding: 15,
            innerBorder: '5px solid #ECF0F1',
            shadow: '0 4px 20px rgba(0,0,0,0.25)'
        },
        {
            id: 'rounded-modern',
            name: 'Rounded Modern',
            borderWidth: 15,
            borderColor: '#FFFFFF',
            padding: 10,
            borderRadius: '20px',
            shadow: '0 8px 30px rgba(0,0,0,0.12)'
        },
        {
            id: 'pastel-dream',
            name: 'Pastel Dream',
            borderWidth: 20,
            borderColor: '#FFE5EC',
            padding: 12,
            innerBorder: '2px solid #FFC1D5',
            shadow: '0 4px 20px rgba(255,193,213,0.3)'
        },
        {
            id: 'film-strip',
            name: 'Film Strip',
            borderWidth: 25,
            borderColor: '#1a1a1a',
            padding: 5,
            holes: true,
            shadow: '0 4px 15px rgba(0,0,0,0.4)'
        }
    ];

    const getFrameStyle = (frame) => {
        const baseStyle = {
            border: `${frame.borderWidth}px solid ${frame.borderColor}`,
            padding: `${frame.padding}px`,
            boxShadow: frame.shadow || 'none',
            borderRadius: frame.borderRadius || '0',
            background: frame.backgroundImage || frame.borderColor,
            position: 'relative'
        };

        if (frame.bottomPadding) {
            baseStyle.paddingBottom = `${frame.bottomPadding}px`;
        }

        return baseStyle;
    };

    const handleFrameSelect = (frame) => {
        setSelectedFrame(frame);
    };

    /**
     * Apply frame to composite image and generate new framed image
     */
    const applyFrameToImage = async (frame) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas for framed image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate frame dimensions
                const totalBorderWidth = frame.borderWidth * 2;
                const totalPadding = frame.padding * 2;
                const bottomExtraPadding = frame.bottomPadding ? frame.bottomPadding - frame.padding : 0;

                canvas.width = img.width + totalBorderWidth + totalPadding;
                canvas.height = img.height + totalBorderWidth + totalPadding + bottomExtraPadding;

                // Draw frame background
                if (frame.backgroundImage) {
                    // For gradient/pattern backgrounds
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.fillStyle = frame.borderColor;
                    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(tempCanvas, 0, 0);
                } else {
                    // Solid color background
                    ctx.fillStyle = frame.borderColor || '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Calculate image position (centered with padding)
                const imgX = frame.borderWidth + frame.padding;
                const imgY = frame.borderWidth + frame.padding;

                // Draw inner border if exists
                if (frame.innerBorder) {
                    const borderSize = parseInt(frame.innerBorder.match(/\d+/)[0]);
                    const borderColor = frame.innerBorder.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|\w+/)[0];

                    ctx.fillStyle = borderColor;
                    ctx.fillRect(
                        imgX - borderSize,
                        imgY - borderSize,
                        img.width + borderSize * 2,
                        img.height + borderSize * 2
                    );
                }

                // Draw the image
                ctx.drawImage(img, imgX, imgY, img.width, img.height);

                // Draw film strip holes if needed
                if (frame.holes) {
                    const holeSize = 8;
                    const holeColor = '#333';
                    const holeMargin = 10;
                    const holeCount = 4;
                    const holeSpacing = (canvas.height - holeMargin * 2) / (holeCount - 1);

                    ctx.fillStyle = holeColor;

                    // Left holes
                    for (let i = 0; i < holeCount; i++) {
                        ctx.beginPath();
                        ctx.arc(
                            holeMargin,
                            holeMargin + i * holeSpacing,
                            holeSize / 2,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }

                    // Right holes
                    for (let i = 0; i < holeCount; i++) {
                        ctx.beginPath();
                        ctx.arc(
                            canvas.width - holeMargin,
                            holeMargin + i * holeSpacing,
                            holeSize / 2,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                }

                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.src = compositeImage;
        });
    };

    const handleContinue = async () => {
        if (!selectedFrame) return;

        setIsProcessing(true);

        try {
            let framedImage = compositeImage;

            // Apply frame if not "none"
            if (selectedFrame.id !== 'none') {
                framedImage = await applyFrameToImage(selectedFrame);
            }

            // Update session with framed composite image
            updateSession({
                selectedFrame: selectedFrame,
                compositeImage: framedImage, // Update with framed version
                originalCompositeImage: compositeImage // Keep original for reference
            });

            navigate('/share');
        } catch (error) {
            console.error('Error applying frame:', error);
            setIsProcessing(false);
        }
    };

    if (!compositeImage) {
        navigate('/camera-settings');
        return null;
    }

    return (
        <div style={{
            background: "#f6DDD8", minHeight: "100vh", overflowY: "auto"
        }}>
            {/* Hidden canvas for frame processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="text-center pt-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Choose Your Frame</h2>
                <p className="text-sm text-gray-600">Select a frame style for your photo</p>
            </div>

            <div
                style={{
                    background: "#f7f4E8",
                    border: "5px solid #FF6B6A",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    borderRadius: "10px",
                    margin: '8px',
                }}
                className="min-w-7xl p-2"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Preview Section */}
                    <div className="lg:col-span-1">
                        <div
                            style={{
                                background: "#FFFFFF",
                                border: "3px solid #FF6B6A",
                                borderRadius: "10px",
                                padding: "10px"
                            }}
                        >
                            <h3 className="text-xl font-bold text-center text-gray-900">Preview</h3>
                            <div
                                style={{
                                    background: "#f0f0f0",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    maxHeight: "100%"
                                }}
                                className="flex items-center justify-center"
                            >
                                {selectedFrame ? (
                                    <div style={getFrameStyle(selectedFrame)} className="max-w-full">
                                        {selectedFrame.innerBorder && (
                                            <div style={{ border: selectedFrame.innerBorder, padding: '5px' }}>
                                                <img
                                                    src={compositeImage}
                                                    alt="Preview"
                                                    className="w-full h-auto"
                                                    style={{ display: 'block' }}
                                                />
                                            </div>
                                        )}
                                        {!selectedFrame.innerBorder && (
                                            <img
                                                src={compositeImage}
                                                alt="Preview"
                                                className="w-full h-auto"
                                                style={{ display: 'block' }}
                                            />
                                        )}
                                        {selectedFrame.holes && (
                                            <>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '15px'
                                                }}>
                                                    {[...Array(4)].map((_, i) => (
                                                        <div key={`left-${i}`} style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            background: '#333',
                                                            borderRadius: '50%'
                                                        }} />
                                                    ))}
                                                </div>
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '15px'
                                                }}>
                                                    {[...Array(4)].map((_, i) => (
                                                        <div key={`right-${i}`} style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            background: '#333',
                                                            borderRadius: '50%'
                                                        }} />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        <p className="text-base font-semibold">👆 Select a frame to preview</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => navigate('/edit')}
                                    className="flex-1 text-sm py-2 px-3 rounded-lg border-2 hover:bg-gray-100 font-semibold"
                                    disabled={isProcessing}
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleContinue}
                                    style={{
                                        background: selectedFrame && !isProcessing ? "#FF6B6A" : "#cccccc",
                                        color: "white"
                                    }}
                                    className="flex-1 text-sm py-2 px-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                                    disabled={!selectedFrame || isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Continue →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Frame Options Grid */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold mb-3 text-gray-900">Frame Options</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {frameOptions.map((frame) => (
                                <div
                                    key={frame.id}
                                    onClick={() => handleFrameSelect(frame)}
                                    style={{
                                        background: "#FFFFFF",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        margin: '4px',
                                        border: selectedFrame?.id === frame.id ? "3px solid #FF6B6A" : "2px solid #e0e0e0",
                                        transform: selectedFrame?.id === frame.id ? "scale(1.02)" : "scale(1)",
                                        transition: "all 0.2s ease"
                                    }}
                                    className="cursor-pointer hover:shadow-lg"
                                >
                                    <div
                                        style={{
                                            background: "#f5f5f5",
                                            borderRadius: "6px",
                                            padding: "8px",
                                            aspectRatio: "1",
                                            overflow: "hidden"
                                        }}
                                        className="flex items-center justify-center mb-2"
                                    >
                                        <div style={{
                                            ...getFrameStyle(frame),
                                            transform: 'scale(0.7)',
                                            maxWidth: '100%',
                                            maxHeight: '100%'
                                        }}>
                                            {frame.innerBorder && (
                                                <div style={{ border: frame.innerBorder, padding: '2px', height: '100%' }}>
                                                    <img
                                                        src={compositeImage}
                                                        alt={frame.name}
                                                        className="w-full h-full object-cover"
                                                        style={{ display: 'block' }}
                                                    />
                                                </div>
                                            )}
                                            {!frame.innerBorder && (
                                                <img
                                                    src={compositeImage}
                                                    alt={frame.name}
                                                    className="w-full h-full object-cover"
                                                    style={{ display: 'block' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-center font-bold text-xs text-gray-800">{frame.name}</p>
                                    {selectedFrame?.id === frame.id && (
                                        <p className="text-center text-xs text-rose-500 font-semibold mt-1">✓ Selected</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FrameSelectionScreen;