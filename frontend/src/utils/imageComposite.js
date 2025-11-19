/**
 * Creates a composite image from multiple photos arranged in a grid layout
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
 * @returns {Promise<string>} Base64 data URL of the composite image
 */
export async function createGridComposite(photos, grid, dpi = 300, marginPercent = 2) {
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

  // Map grid IDs to print dimensions (width × height in inches)
  const printDimensions = {
    '4x6-single': { width: 4, height: 6 },
    '2x4-vertical-2': { width: 2, height: 4 },
    '4x6-4cut': { width: 4, height: 6 },
    '5x7-6cut': { width: 5, height: 7 },
  };

  // Get print dimensions from grid ID if available, otherwise derive from grid structure
  let printSize = null;
  if (grid.id && printDimensions[grid.id]) {
    printSize = printDimensions[grid.id];
  } else {
    // Derive print dimensions from grid structure
    // Common aspect ratios: 4x6 = 2:3, 5x7 ≈ 5:7, 2x4 = 1:2
    if (grid.cols === 1 && grid.rows === 1) {
      printSize = { width: 4, height: 6 }; // Single photo
    } else if (grid.cols === 2 && grid.rows === 1) {
      printSize = { width: 2, height: 4 }; // 2 vertical
    } else if (grid.cols === 2 && grid.rows === 2) {
      printSize = { width: 4, height: 6 }; // 4 cut
    } else if (grid.cols === 3 && grid.rows === 2) {
      printSize = { width: 5, height: 7 }; // 6 cut
    } else {
      // Default: calculate based on aspect ratio
      const aspect = grid.cols / grid.rows;
      if (aspect > 1.2) {
        printSize = { width: 4, height: 6 };
      } else {
        printSize = { width: 4, height: 6 };
      }
    }
  }

  // Convert inches to pixels at specified DPI
  const canvasWidth = Math.round(printSize.width * dpi);
  const canvasHeight = Math.round(printSize.height * dpi);

  // Calculate margin in pixels (percentage of the smaller canvas dimension)
  const marginSize = Math.round(Math.min(canvasWidth, canvasHeight) * (marginPercent / 100));

  // Calculate total available space after accounting for all margins
  // Margins: left edge + between columns + right edge = (cols + 1) margins horizontally
  // Margins: top edge + between rows + bottom edge = (rows + 1) margins vertically
  const totalHorizontalMargins = marginSize * (grid.cols + 1);
  const totalVerticalMargins = marginSize * (grid.rows + 1);

  const availableWidth = canvasWidth - totalHorizontalMargins;
  const availableHeight = canvasHeight - totalVerticalMargins;

  // Calculate actual cell size (all cells are equal size)
  const cellWidth = availableWidth / grid.cols;
  const cellHeight = availableHeight / grid.rows;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Load all images
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

    // Composite each image into its corresponding cell
    // Vertical arrangement: Fill top to bottom, then left to right
    images.forEach((img, index) => {
      // Calculate row and column for vertical cell arrangement
      const row = index % grid.rows;
      const col = Math.floor(index / grid.rows);

      // Calculate cell position with equal margins from all edges
      // Position = left/top margin + (cell size + margin) * index
      const cellX = marginSize + col * (cellWidth + marginSize);
      const cellY = marginSize + row * (cellHeight + marginSize);

      // All images fill the entire cell with equal size (crop to fit)
      const imgAspect = img.width / img.height;
      const cellAspect = cellWidth / cellHeight;

      let sourceX, sourceY, sourceWidth, sourceHeight;

      if (imgAspect > cellAspect) {
        // Image is wider - crop sides
        sourceHeight = img.height;
        sourceWidth = img.height * cellAspect;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Image is taller - crop top/bottom
        sourceWidth = img.width;
        sourceHeight = img.width / cellAspect;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
      }

      // Draw image to fill entire cell (all images same size)
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,  // source crop
        cellX, cellY, cellWidth, cellHeight            // destination fill
      );
    });

    // Return composite as base64 data URL
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Error creating composite:', error);
    throw error;
  }
}