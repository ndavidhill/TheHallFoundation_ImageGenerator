// Import React hooks from the React object for standalone use
const { useState, useRef, useEffect } = React;

const ImageBorderEffect = () => {
  const [image, setImage] = useState(null);
  const [borderColors, setBorderColors] = useState(['#88A7FD', '#EFB646', '#749469']);
  const [gutterSize, setGutterSize] = useState(8);
  const [borderWidth, setBorderWidth] = useState(15);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationFrames, setAnimationFrames] = useState([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationRef = useRef(null);
  
  // Fixed canvas dimensions
  const canvasSize = { width: 800, height: 800 };
  
  // Color palette for randomization
  const colorPalette = [
    '#88A7FD', '#EFB646', '#749469', // Default colors
    '#ABD7F6', '#4670DB', '#808CAC', '#FFE3CE', 
    '#FF9483', '#BB6400', '#B38D7A', '#FFFB4E', 
    '#756927', '#3A8266', '#5BE0A0', '#E7FFC6'
  ];
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Prompt file dialog when clicking the upload area
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Draw the static image with borders (no longer used directly - replaced by useEffect)
  const updateCanvasWithImage = () => {
    // This function is now handled by the useEffect
  };
  
  // Update canvas when image or border settings change
  useEffect(() => {
    if (isAnimating) return; // Don't update during animation
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set fixed canvas dimensions
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // For display purposes, fill with white (this won't affect the transparency of the output)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!image) return;
    
    // Calculate border dimensions
    const baseBorderWidth = borderWidth;
    const baseGutterSize = gutterSize;
    
    // Calculate scale to fit image within canvas
    const totalBorderWidth = 3 * baseBorderWidth + 2 * baseGutterSize;
    const availableWidth = canvas.width - (totalBorderWidth * 2);
    const availableHeight = canvas.height - (totalBorderWidth * 2);
    
    const scaleWidth = availableWidth / image.width;
    const scaleHeight = availableHeight / image.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    // Calculate centered position
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    
    // Define border positions (must match animation)
    // Start with inner border flush with image, then add consistent spacing
    const borderConfigs = [
      // Outer border - 2 gaps and 2 borders out from the middle border
      {
        x: x - baseBorderWidth/2 - baseGutterSize - baseBorderWidth - baseGutterSize - baseBorderWidth,
        y: y - baseBorderWidth/2 - baseGutterSize - baseBorderWidth - baseGutterSize - baseBorderWidth,
        width: scaledWidth + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2 + (baseGutterSize + baseBorderWidth) * 2,
        height: scaledHeight + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2 + (baseGutterSize + baseBorderWidth) * 2,
        color: borderColors[0]
      },
      // Middle border - 1 gap and 1 border out from inner border
      {
        x: x - baseBorderWidth/2 - baseGutterSize - baseBorderWidth,
        y: y - baseBorderWidth/2 - baseGutterSize - baseBorderWidth,
        width: scaledWidth + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2,
        height: scaledHeight + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2,
        color: borderColors[1]
      },
      // Inner border - flush with image
      {
        x: x - baseBorderWidth/2,
        y: y - baseBorderWidth/2,
        width: scaledWidth + baseBorderWidth,
        height: scaledHeight + baseBorderWidth,
        color: borderColors[2]
      }
    ];
    
    // Draw borders first (same order as in animation)
    for (let i = 0; i < 3; i++) {
      const config = borderConfigs[i];
      ctx.strokeStyle = config.color;
      ctx.lineWidth = baseBorderWidth;
      ctx.strokeRect(config.x, config.y, config.width, config.height);
    }
    
    // Draw the image on top
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }, [image, borderColors, gutterSize, borderWidth, isAnimating, canvasSize]);
  
  // Handle drag start
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // Handle drop to reorder colors
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newColors = [...borderColors];
      const draggedColor = newColors[draggedIndex];
      
      // Remove the dragged color
      newColors.splice(draggedIndex, 1);
      
      // Insert at the new position
      newColors.splice(dragOverIndex, 0, draggedColor);
      
      setBorderColors(newColors);
    }
    
    // Reset drag states
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag end (cleanup)
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  // Randomize colors
  const randomizeColors = () => {
    const newColors = [];
    // Generate 3 unique random colors from the palette
    while (newColors.length < 3) {
      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      if (!newColors.includes(randomColor)) {
        newColors.push(randomColor);
      }
    }
    setBorderColors(newColors);
  };
  
  // Create a single frame for the animation
  const drawAnimationFrame = (animationProgress) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with white background (will be transparent in export)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!image) return canvas;
    
    // Calculate border dimensions
    const baseBorderWidth = borderWidth;
    const baseGutterSize = gutterSize;
    
    // Calculate scale to fit image within canvas
    const totalBorderWidth = 3 * baseBorderWidth + 2 * baseGutterSize;
    const availableWidth = canvas.width - (totalBorderWidth * 2);
    const availableHeight = canvas.height - (totalBorderWidth * 2);
    
    const scaleWidth = availableWidth / image.width;
    const scaleHeight = availableHeight / image.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    // Calculate centered position
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    
    // Define the exact position and size of each border - consistent with static display
    // Note: Colors match the exact order in the static display (from outside to inside)
    const borderConfigs = [
      // Outer border - 2 gaps and 2 borders out from the middle border
      {
        x: x - baseBorderWidth/2 - baseGutterSize - baseBorderWidth - baseGutterSize - baseBorderWidth,
        y: y - baseBorderWidth/2 - baseGutterSize - baseBorderWidth - baseGutterSize - baseBorderWidth,
        width: scaledWidth + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2 + (baseGutterSize + baseBorderWidth) * 2,
        height: scaledHeight + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2 + (baseGutterSize + baseBorderWidth) * 2,
        color: borderColors[0]
      },
      // Middle border - 1 gap and 1 border out from inner border
      {
        x: x - baseBorderWidth/2 - baseGutterSize - baseBorderWidth,
        y: y - baseBorderWidth/2 - baseGutterSize - baseBorderWidth,
        width: scaledWidth + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2,
        height: scaledHeight + baseBorderWidth + (baseGutterSize + baseBorderWidth) * 2,
        color: borderColors[1]
      },
      // Inner border - flush with image
      {
        x: x - baseBorderWidth/2,
        y: y - baseBorderWidth/2,
        width: scaledWidth + baseBorderWidth,
        height: scaledHeight + baseBorderWidth,
        color: borderColors[2]
      }
    ];
    
    // Draw borders first (behind the image)
    // Draw from inside to outside (2→1→0)
    for (let i = 2; i >= 0; i--) {
      const config = borderConfigs[i];
      
      // Calculate animation progress for this border
      // Inner border (i=2) appears first, then middle (i=1), then outer (i=0)
      const borderProgress = Math.max(0, Math.min(1, animationProgress * 1.5 - (0.2 * (2-i))));
      
      // Only draw if this border has started animating
      if (borderProgress > 0) {
        ctx.strokeStyle = config.color;
        ctx.lineWidth = baseBorderWidth;
        
        // Set up clipping region for masking effect
        ctx.save();
        
        // Create a mask that grows outward from the center as a square
        const maskSize = borderProgress * Math.max(canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Create a square clipping mask from the center
        ctx.beginPath();
        ctx.rect(
          centerX - maskSize, 
          centerY - maskSize, 
          maskSize * 2, 
          maskSize * 2
        );
        ctx.clip();
        
        // Draw the rectangle border
        ctx.strokeRect(config.x, config.y, config.width, config.height);
        
        // Restore context
        ctx.restore();
      }
    }
    
    // Draw the image on top
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    return canvas;
  };

  // Generate all animation frames
  const generateAnimationFrames = () => {
    const frames = [];
    const totalFrames = 60; // More frames for smoother animation
    
    for (let i = 0; i < totalFrames; i++) {
      // Animation progresses from 0 to 1
      const progress = i / totalFrames;
      
      // Create frame
      const frame = drawAnimationFrame(progress);
      frames.push(frame);
    }
    
    return frames;
  };

  // Start animation
  const startAnimation = () => {
    if (!image) return;
    
    setIsAnimating(true);
    setAnimationProgress(0);
    
    // Generate all frames
    const frames = generateAnimationFrames();
    setAnimationFrames(frames);
    
    // Start animation loop
    let frameIndex = 0;
    const animateFrame = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear and draw current frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[frameIndex], 0, 0);
      
      // Update progress
      setAnimationProgress((frameIndex / frames.length) * 100);
      
      // Increment frame index
      frameIndex = (frameIndex + 1) % frames.length;
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animateFrame);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateFrame);
  };

  // Stop animation
  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
    
    // Redraw the static version
    updateCanvasWithImage();
  };

  // Toggle animation
  const toggleAnimation = () => {
    if (isAnimating) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Download animated GIF
  const downloadGif = () => {
    if (!image || animationFrames.length === 0) return;
    
    // Create GIF using gif.js
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvasSize.width,
      height: canvasSize.height,
      transparent: 0xFFFFFF, // White becomes transparent
      workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
    });
    
    // Add each frame to the GIF
    animationFrames.forEach(frame => {
      gif.addFrame(frame, { delay: 50, copy: true }); // 50ms delay between frames
    });
    
    // Progress callback
    gif.on('progress', progress => {
      setAnimationProgress(progress * 100);
    });
    
    // Finished callback
    gif.on('finished', blob => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'animated-border.gif';
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      setAnimationProgress(0);
    });
    
    // Start rendering
    gif.render();
  };

  // Download the result with transparency
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    // Create a temporary canvas for the transparent version
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Get the image data from the original canvas
    const imageData = canvasRef.current.getContext('2d').getImageData(
      0, 0, canvasRef.current.width, canvasRef.current.height
    );
    
    // Clear the temp canvas (transparent by default)
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the image data to the temp canvas
    tempCtx.putImageData(imageData, 0, 0);
    
    // Create white-to-transparent conversion
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // If pixel is white (255,255,255), make it transparent
      if (data[i] === 255 && data[i+1] === 255 && data[i+2] === 255) {
        data[i+3] = 0; // Set alpha channel to 0 (transparent)
      }
    }
    
    // Put the modified image data back
    tempCtx.putImageData(imageData, 0, 0);
    
    // Download the transparent version
    const link = document.createElement('a');
    link.download = 'bordered-image.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-4xl overflow-hidden">
        {/* Canvas Display */}
        <div className="relative w-full" style={{ height: 'calc(100vh - 240px)', maxHeight: '800px' }}>
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-contain"
          />
          
          {!image && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-50 cursor-pointer"
              onClick={triggerFileInput}
            >
              <div className="text-center p-6 border border-dashed border-gray-300 rounded bg-white">
                <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-xs text-gray-600 uppercase tracking-wide">Upload image</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls - Minimal Design */}
        <div className="p-3 border-t border-gray-100">
          {/* Animation Progress Bar */}
          {animationProgress > 0 && (
            <div className="w-full h-1 bg-gray-200 mb-3 relative">
              <div className="progress-bar absolute top-0 left-0 h-full" style={{ width: `${animationProgress}%` }}></div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Upload Button */}
              <button 
                onClick={triggerFileInput}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition uppercase tracking-wide"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </button>
              
              {/* Compact Controls Group */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Width</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Gap</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={gutterSize}
                    onChange={(e) => setGutterSize(parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
              
              {/* Color Display and Randomize Button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 pr-2 border-r border-gray-200">
                  {borderColors.map((color, index) => (
                    <div 
                      key={index} 
                      className={`w-7 h-7 rounded-full cursor-move transition-transform ${
                        draggedIndex === index ? 'scale-110 shadow-sm border-gray-400' : 'border-gray-200'
                      } ${
                        dragOverIndex === index ? 'border-dashed border-gray-800' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center justify-center h-full text-xs text-white opacity-60">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={randomizeColors}
                  className="text-xs px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition flex items-center gap-1 uppercase tracking-wide"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Random
                </button>
              </div>
            </div>
            
            {/* Animation and Download Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAnimation}
                disabled={!image}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition uppercase tracking-wide ${
                  !image 
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : isAnimating
                      ? 'border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-100'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAnimating ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  )}
                </svg>
                {isAnimating ? 'Stop' : 'Animate'}
              </button>
              
              {isAnimating && (
                <button
                  onClick={downloadGif}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition uppercase tracking-wide"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                  </svg>
                  Save GIF
                </button>
              )}
              
              <button
                onClick={downloadImage}
                disabled={!image}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition uppercase tracking-wide font-medium ${
                  image 
                    ? 'bg-[#C1ABF6] text-black hover:bg-opacity-90' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the app to the root element
ReactDOM.render(<ImageBorderEffect />, document.getElementById('root'));
