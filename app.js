// Import React hooks from the React object for standalone use
const { useState, useRef, useEffect } = React;

const ImageBorderEffect = () => {
  const [image, setImage] = useState(null);
  const [borderColors, setBorderColors] = useState(['#88A7FD', '#EFB646', '#749469']);
  const [gutterSize, setGutterSize] = useState(8);
  const [borderWidth, setBorderWidth] = useState(6);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  // Color palette for randomization
  const colorPalette = [
    '#88A7FD', '#EFB646', '#749469', // Default colors
    '#ABD7F6', '#4670DB', '#808CAC', '#FFE3CE', 
    '#FF9483', '#BB6400', '#B38D7A', '#FFFB4E', 
    '#756927', '#3A8266', '#5BE0A0', '#E7FFC6'
  ];
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Fixed canvas dimensions
  const canvasSize = { width: 800, height: 800 };
  
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
  
  // Update canvas when image or border settings change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set fixed canvas dimensions
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!image) return;
    
    // Calculate border dimensions
    const totalBorderWidth = 3 * borderWidth + 2 * gutterSize;
    
    // Calculate scale to fit image within canvas while maintaining aspect ratio
    // Leave space for borders
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
    
    // Draw the image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    // Draw border rectangles
    for (let i = 0; i < 3; i++) {
      const offset = i * (borderWidth + gutterSize);
      ctx.strokeStyle = borderColors[i];
      ctx.lineWidth = borderWidth;
      
      ctx.strokeRect(
        x - offset - borderWidth/2,
        y - offset - borderWidth/2,
        scaledWidth + (offset + borderWidth/2) * 2,
        scaledHeight + (offset + borderWidth/2) * 2
      );
    }
  }, [image, borderColors, gutterSize, borderWidth, canvasSize]);
  
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

  // Download the result
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'bordered-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
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
          <div className="flex flex-wrap items-center gap-3">
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
            
            {/* Spacer */}
            <div className="flex-grow"></div>
            
            {/* Download Button */}
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
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the app to the root element
ReactDOM.render(<ImageBorderEffect />, document.getElementById('root'));
