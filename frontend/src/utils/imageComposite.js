/**
 * Creates a composite image from multiple photos arranged in a grid layout
 * with dynamic canvas sizing that preserves original image aspect ratios
 * 
 * Photo arrangement: Vertical cell arrangement (fills top to bottom, then left to right)
 * Example for 2x2 grid:
 *   [1] [3]
 *   [2] [4]
 * 
 * @param {string[]} photos - Array of base64 image data URLs
 * @param {Object} grid - Grid configuration { cols: number, rows: number, id: string }
 * @param {number} dpi - Print resolution (default 300 DPI)
 * @param {number} marginPercent - Margin as percentage of cell size (default 2%)
 * @param {number} maxCellWidth - Maximum cell width in inches (default 3)
 * @returns {Promise<string>} Base64 data URL of the composite image
 */

export async function createGridComposite(photos, grid, dpi = 300, marginPercent = 2, maxCellWidth = 3) {
  if (!photos || photos.length === 0) {
    throw new Error('No photos provided');
  }

  if (!grid || !grid.cols || !grid.rows) {
    throw new Error('Invalid grid configuration');
  }

  const totalCells = grid.cols * grid.rows;
  if (photos.length !== totalCells) {
    throw new Error(`Expected ${totalCells} photos, got ${photos.length}`);
  }

  // Load all images first to get their dimensions
  const imagePromises = photos.map((photoSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = photoSrc;
    });
  });

  try {
    const images = await Promise.all(imagePromises);

    // Calculate max cell dimensions based on image aspect ratios
    // This ensures all images fit without cropping
    const cellDimensions = new Map();

    // Group images by cell position and calculate required space
    images.forEach((img, index) => {
      const row = index % grid.rows;
      const col = Math.floor(index / grid.rows);
      const cellKey = `${col}-${row}`;

      const imgAspect = img.width / img.height;

      if (!cellDimensions.has(cellKey)) {
        cellDimensions.set(cellKey, {
          aspect: imgAspect,
          minWidth: imgAspect > 1 ? maxCellWidth : maxCellWidth / imgAspect,
          minHeight: imgAspect > 1 ? maxCellWidth / imgAspect : maxCellWidth
        });
      } else {
        // If multiple images in same cell (shouldn't happen with this logic)
        const current = cellDimensions.get(cellKey);
        current.aspect = Math.max(current.aspect, imgAspect);
      }
    });

    // Calculate optimal cell size (use max across all cells for uniformity)
    let maxCellHeightInches = maxCellWidth;
    let maxCellWidthInches = maxCellWidth;

    cellDimensions.forEach(dims => {
      if (dims.aspect > 1) {
        // Wide image
        maxCellHeightInches = Math.max(maxCellHeightInches, maxCellWidth / dims.aspect);
      } else {
        // Tall image
        maxCellWidthInches = Math.max(maxCellWidthInches, maxCellWidth * dims.aspect);
      }
    });

    // Convert to pixels at specified DPI
    const cellWidthPx = Math.round(maxCellWidthInches * dpi);
    const cellHeightPx = Math.round(maxCellHeightInches * dpi);

    // Calculate margin in pixels
    const marginSize = Math.round(Math.min(cellWidthPx, cellHeightPx) * (marginPercent / 100));

    // Calculate total canvas size
    // Total width = left margin + (cell width + margin) * cols + right margin
    // Total height = top margin + (cell height + margin) * rows + bottom margin
    const canvasWidth = marginSize + (cellWidthPx + marginSize) * grid.cols;
    const canvasHeight = marginSize + (cellHeightPx + marginSize) * grid.rows;

    // Create canvas with calculated dimensions
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Composite each image into its corresponding cell
    // Vertical arrangement: Fill top to bottom, then left to right
    images.forEach((img, index) => {
      // Calculate row and column for vertical cell arrangement
      const row = index % grid.rows;
      const col = Math.floor(index / grid.rows);

      // Calculate cell position
      const cellX = marginSize + col * (cellWidthPx + marginSize);
      const cellY = marginSize + row * (cellHeightPx + marginSize);

      // Calculate scaled dimensions to fit in cell while maintaining aspect ratio
      // and avoiding cropping
      const imgAspect = img.width / img.height;
      const cellAspect = cellWidthPx / cellHeightPx;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > cellAspect) {
        // Image is wider relative to cell - fit to width
        drawWidth = cellWidthPx;
        drawHeight = cellWidthPx / imgAspect;
        drawX = cellX;
        drawY = cellY + (cellHeightPx - drawHeight) / 2; // Center vertically
      } else {
        // Image is taller relative to cell - fit to height
        drawHeight = cellHeightPx;
        drawWidth = cellHeightPx * imgAspect;
        drawX = cellX + (cellWidthPx - drawWidth) / 2; // Center horizontally
        drawY = cellY;
      }

      // Draw full image (no cropping)
      ctx.drawImage(
        img,
        0, 0, img.width, img.height,              // source (full image)
        drawX, drawY, drawWidth, drawHeight       // destination (scaled to fit)
      );
    });

    // Return composite as base64 data URL
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Error creating composite:', error);
    throw error;
  }
}