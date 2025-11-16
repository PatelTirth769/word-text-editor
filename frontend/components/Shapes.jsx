'use client';

import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaSquare, FaCircle, FaArrowRight, FaMinus, FaPlus } from 'react-icons/fa';

const Shapes = ({ editor, isOpen, onClose }) => {
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [shapeSize, setShapeSize] = useState('medium');
  const [shapeColor, setShapeColor] = useState('#3b82f6');
  const [drawingMode, setDrawingMode] = useState(false); // draw on page
  const overlayRef = useRef(null);
  const handlersRef = useRef({});

  // Do not return early before hooks; render null later to preserve hook order

  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: FaSquare },
    { id: 'circle', name: 'Circle', icon: FaCircle },
    { id: 'triangle', name: 'Triangle', icon: FaSquare },
    { id: 'arrow', name: 'Arrow', icon: FaArrowRight },
    { id: 'line', name: 'Line', icon: FaMinus },
    { id: 'star', name: 'Star', icon: FaPlus },
    { id: 'heart', name: 'Heart', icon: FaPlus },
    { id: 'diamond', name: 'Diamond', icon: FaSquare },
    { id: 'hexagon', name: 'Hexagon', icon: FaSquare },
    { id: 'pentagon', name: 'Pentagon', icon: FaSquare },
    { id: 'oval', name: 'Oval', icon: FaCircle },
    { id: 'cross', name: 'Cross', icon: FaPlus },
  ];

  const sizes = {
    small: { width: 50, height: 50 },
    medium: { width: 100, height: 100 },
    large: { width: 150, height: 150 }
  };

  const insertShape = () => {
    // In draw-on-page mode, switch into drawing and close modal
    if (drawingMode) {
      enablePageDraw();
      onClose();
      return;
    }
    const size = sizes[shapeSize];
    
    // Create a data URL for the shape as an image
    const createShapeImage = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = size.width;
      canvas.height = size.height;
      
      // Set background to transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the shape based on type
      ctx.fillStyle = shapeColor;
      ctx.strokeStyle = shapeColor;
      ctx.lineWidth = 2;
      
      switch (selectedShape) {
        case 'rectangle':
          ctx.fillRect(2, 2, size.width - 4, size.height - 4);
          ctx.strokeRect(2, 2, size.width - 4, size.height - 4);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(size.width/2, size.height/2, Math.min(size.width, size.height)/2 - 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(size.width/2, 5);
          ctx.lineTo(size.width - 5, size.height - 5);
          ctx.lineTo(5, size.height - 5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(0, size.height * 0.2);
          ctx.lineTo(size.width * 0.6, size.height * 0.2);
          ctx.lineTo(size.width * 0.6, 0);
          ctx.lineTo(size.width, size.height / 2);
          ctx.lineTo(size.width * 0.6, size.height);
          ctx.lineTo(size.width * 0.6, size.height * 0.8);
          ctx.lineTo(0, size.height * 0.8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(0, size.height / 2);
          ctx.lineTo(size.width, size.height / 2);
          ctx.lineWidth = 4;
          ctx.stroke();
          break;
        case 'star':
          ctx.beginPath();
          const centerX = size.width / 2;
          const centerY = size.height / 2;
          const outerRadius = Math.min(size.width, size.height) / 2 - 2;
          const innerRadius = outerRadius * 0.4;
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + radius * Math.cos(angle - Math.PI / 2);
            const y = centerY + radius * Math.sin(angle - Math.PI / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'heart':
          ctx.beginPath();
          const heartX = size.width / 2;
          const heartY = size.height / 2;
          const heartSize = Math.min(size.width, size.height) / 4;
          ctx.moveTo(heartX, heartY + heartSize);
          ctx.bezierCurveTo(heartX, heartY, heartX - heartSize, heartY, heartX - heartSize, heartY + heartSize);
          ctx.bezierCurveTo(heartX - heartSize, heartY + heartSize * 1.5, heartX, heartY + heartSize * 1.5, heartX, heartY + heartSize * 2);
          ctx.bezierCurveTo(heartX, heartY + heartSize * 1.5, heartX + heartSize, heartY + heartSize * 1.5, heartX + heartSize, heartY + heartSize);
          ctx.bezierCurveTo(heartX + heartSize, heartY, heartX, heartY, heartX, heartY + heartSize);
          ctx.fill();
          ctx.stroke();
          break;
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(size.width / 2, 5);
          ctx.lineTo(size.width - 5, size.height / 2);
          ctx.lineTo(size.width / 2, size.height - 5);
          ctx.lineTo(5, size.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'hexagon':
          ctx.beginPath();
          const hexCenterX = size.width / 2;
          const hexCenterY = size.height / 2;
          const hexRadius = Math.min(size.width, size.height) / 2 - 2;
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = hexCenterX + hexRadius * Math.cos(angle);
            const y = hexCenterY + hexRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'pentagon':
          ctx.beginPath();
          const pentCenterX = size.width / 2;
          const pentCenterY = size.height / 2;
          const pentRadius = Math.min(size.width, size.height) / 2 - 2;
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = pentCenterX + pentRadius * Math.cos(angle);
            const y = pentCenterY + pentRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'oval':
          ctx.beginPath();
          ctx.ellipse(size.width/2, size.height/2, (size.width - 4)/2, (size.height - 4)/2, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          break;
        case 'cross':
          ctx.beginPath();
          const crossCenterX = size.width / 2;
          const crossCenterY = size.height / 2;
          const crossSize = Math.min(size.width, size.height) / 3;
          // Vertical line
          ctx.moveTo(crossCenterX, crossCenterY - crossSize);
          ctx.lineTo(crossCenterX, crossCenterY + crossSize);
          // Horizontal line
          ctx.moveTo(crossCenterX - crossSize, crossCenterY);
          ctx.lineTo(crossCenterX + crossSize, crossCenterY);
          ctx.lineWidth = 6;
          ctx.stroke();
          break;
      }
      
      // Export as PNG with transparent background; remove any extra margins
      return canvas.toDataURL('image/png');
    };

    const imageUrl = createShapeImage();
    
        // Insert as an image using TipTap's image extension with alignment
        editor.chain().focus().setImage({ 
          src: imageUrl, 
          alt: `${selectedShape} shape`,
          title: `${selectedShape} shape`,
          style: 'text-align: center; display: block; margin: 0 auto; background: transparent;',
          width: size.width,
          height: size.height,
        }).run();
    
    onClose();
  };

  // Page drawing: attach listeners to editor surface and draw in an overlay
  const enablePageDraw = () => {
    if (!editor) return;
    const surface = editor.view.dom;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '60';
    overlay.style.cursor = 'crosshair';
    overlay.style.background = 'transparent';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    // capture events on SVG so we can compute positions reliably
    svg.style.pointerEvents = 'auto';
    overlay.appendChild(svg);
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    let node = null;
    let start = null;

    const toSVGPoint = (e) => {
      const rect = overlay.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const down = (e) => {
      e.preventDefault();
      start = toSVGPoint(e);
      switch (selectedShape) {
        case 'rectangle':
          node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          break;
        case 'triangle':
        case 'diamond':
          node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          break;
        case 'circle':
        case 'oval':
          node = document.createElementNS('http://www.w3.org/2000/svg', selectedShape === 'circle' ? 'circle' : 'ellipse');
          break;
        case 'line':
        case 'arrow':
          node = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          break;
        case 'star':
        case 'hexagon':
        case 'pentagon':
          node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          break;
        case 'heart':
        case 'cross':
          node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          break;
        default:
          node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      }
      node.setAttribute('fill', (selectedShape === 'line' || selectedShape === 'arrow' || selectedShape === 'cross') ? 'none' : shapeColor);
      node.setAttribute('stroke', shapeColor);
      node.setAttribute('stroke-width', '2');
      svg.appendChild(node);
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up, { once: true });
    };

    const move = (e) => {
      if (!node || !start) return;
      const p = toSVGPoint(e);
      const x = Math.min(start.x, p.x);
      const y = Math.min(start.y, p.y);
      const w = Math.abs(p.x - start.x);
      const h = Math.abs(p.y - start.y);
      const cx = (start.x + p.x) / 2;
      const cy = (start.y + p.y) / 2;
      switch (selectedShape) {
        case 'rectangle':
          node.setAttribute('x', x);
          node.setAttribute('y', y);
          node.setAttribute('width', Math.max(1, w));
          node.setAttribute('height', Math.max(1, h));
          break;
        case 'circle':
          node.setAttribute('cx', cx);
          node.setAttribute('cy', cy);
          node.setAttribute('r', Math.max(1, Math.sqrt(w*w + h*h)/2));
          break;
        case 'oval':
          node.setAttribute('cx', cx);
          node.setAttribute('cy', cy);
          node.setAttribute('rx', Math.max(1, w/2));
          node.setAttribute('ry', Math.max(1, h/2));
          break;
        case 'line':
        case 'arrow':
          node.setAttribute('x1', start.x);
          node.setAttribute('y1', start.y);
          node.setAttribute('x2', p.x);
          node.setAttribute('y2', p.y);
          break;
        case 'triangle': {
          const points = `${start.x},${y} ${x+w},${y+h} ${x},${y+h}`;
          node.setAttribute('points', points);
          break; }
        case 'diamond': {
          // Compute diamond corners using center and half-width/height for perfect diamond
          const cx2 = (start.x + p.x) / 2;
          const cy2 = (start.y + p.y) / 2;
          const hw = Math.max(1, Math.abs(p.x - start.x) / 2);
          const hh = Math.max(1, Math.abs(p.y - start.y) / 2);
          const pts = [
            `${cx2},${cy2 - hh}`,
            `${cx2 + hw},${cy2}`,
            `${cx2},${cy2 + hh}`,
            `${cx2 - hw},${cy2}`
          ].join(' ');
          node.setAttribute('points', pts);
          break; }
        case 'star': {
          const outer = Math.min(w, h)/2;
          const inner = outer * 0.5;
          const pts = [];
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const ang = -Math.PI/2 + (i * Math.PI)/5;
            pts.push(`${cx + r*Math.cos(ang)},${cy + r*Math.sin(ang)}`);
          }
          node.setAttribute('points', pts.join(' '));
          break; }
        case 'hexagon': {
          const r = Math.min(w, h)/2;
          const pts = [];
          for (let i = 0; i < 6; i++) {
            const ang = -Math.PI/2 + (i * Math.PI)/3;
            pts.push(`${cx + r*Math.cos(ang)},${cy + r*Math.sin(ang)}`);
          }
          node.setAttribute('points', pts.join(' '));
          break; }
        case 'pentagon': {
          const r = Math.min(w, h)/2;
          const pts = [];
          for (let i = 0; i < 5; i++) {
            const ang = -Math.PI/2 + (i * 2 * Math.PI)/5;
            pts.push(`${cx + r*Math.cos(ang)},${cy + r*Math.sin(ang)}`);
          }
          node.setAttribute('points', pts.join(' '));
          break; }
        case 'heart': {
          const rw = Math.max(1, w);
          const rh = Math.max(1, h);
          const left = x;
          const top = y + rh*0.35;
          const path = [
            `M ${cx},${top + rh*0.65}`,
            `C ${cx},${top + rh*0.4} ${left + rw*0.25},${top + rh*0.25} ${left + rw*0.25},${top + rh*0.5}`,
            `C ${left + rw*0.25},${top + rh*0.75} ${cx},${top + rh*0.85} ${cx},${top + rh}`,
            `C ${cx},${top + rh*0.85} ${left + rw*0.75},${top + rh*0.75} ${left + rw*0.75},${top + rh*0.5}`,
            `C ${left + rw*0.75},${top + rh*0.25} ${cx},${top + rh*0.4} ${cx},${top + rh*0.65}`,
            'Z'
          ].join(' ');
          node.setAttribute('d', path);
          break; }
        case 'cross': {
          const size = Math.min(w, h)/2;
          const path = `M ${cx},${cy - size} L ${cx},${cy + size} M ${cx - size},${cy} L ${cx + size},${cy}`;
          node.setAttribute('d', path);
          node.setAttribute('stroke-linecap', 'round');
          node.setAttribute('stroke-width', '6');
          node.setAttribute('fill', 'none');
          break; }
      }
    };

    const up = () => {
      document.removeEventListener('mousemove', move);
      // Export current overlay SVG bounds to data URL and insert
      const clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const bbox = svg.getBBox();
      if (bbox && bbox.width > 0 && bbox.height > 0) {
        clone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        // clip to drawn bbox to avoid invisible background area
        clone.setAttribute('width', Math.max(1, Math.round(bbox.width)));
        clone.setAttribute('height', Math.max(1, Math.round(bbox.height)));
        // Ensure transparent background
        const svgStr = new XMLSerializer().serializeToString(clone);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
        editor.chain().focus().setImage({ src: dataUrl, alt: `${selectedShape} shape`, title: 'shape', style: 'background: transparent;' }).run();
      }
      overlay.remove();
      overlayRef.current = null;
      handlersRef.current = {};
    };

    overlay.addEventListener('mousedown', down);
    handlersRef.current = { down, overlay };
  };

  useEffect(() => {
    return () => {
      const h = handlersRef.current;
      if (h.down && h.overlay) h.overlay.removeEventListener('mousedown', h.down);
      if (overlayRef.current) overlayRef.current.remove();
    };
  }, []);

  if (!isOpen || !editor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Insert Shape</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape Type:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {shapes.map(shape => {
              const IconComponent = shape.icon;
              return (
                <button
                  key={shape.id}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
                    selectedShape === shape.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedShape(shape.id)}
                >
                  <IconComponent className="text-lg" />
                  <span className="text-xs">{shape.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded ${drawingMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => {
                setDrawingMode(true);
                enablePageDraw();
                onClose();
              }}
            >
              Draw on page
            </button>
          </div>
          <span className="text-xs text-gray-500">Select shape, then drag directly on page</span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size:
          </label>
          <div className="flex gap-2">
            {Object.keys(sizes).map(size => (
              <button
                key={size}
                className={`px-3 py-2 rounded ${
                  shapeSize === size 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setShapeSize(size)}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shapeColor}
              onChange={(e) => setShapeColor(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">{shapeColor}</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-100 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview:
          </label>
          <div className="flex items-center gap-2">
            {selectedShape === 'rectangle' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <rect width={sizes[shapeSize].width} height={sizes[shapeSize].height} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'circle' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <circle cx={sizes[shapeSize].width/2} cy={sizes[shapeSize].height/2} r={Math.min(sizes[shapeSize].width, sizes[shapeSize].height)/2 - 2} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'triangle' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <polygon points={`${sizes[shapeSize].width/2},5 ${sizes[shapeSize].width-5},${sizes[shapeSize].height-5} 5,${sizes[shapeSize].height-5}`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'arrow' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <polygon points={`0,${sizes[shapeSize].height*0.2} ${sizes[shapeSize].width*0.6},${sizes[shapeSize].height*0.2} ${sizes[shapeSize].width*0.6},0 ${sizes[shapeSize].width},${sizes[shapeSize].height/2} ${sizes[shapeSize].width*0.6},${sizes[shapeSize].height} ${sizes[shapeSize].width*0.6},${sizes[shapeSize].height*0.8} 0,${sizes[shapeSize].height*0.8}`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'line' && (
              <svg width={sizes[shapeSize].width} height="10">
                <line x1="0" y1="5" x2={sizes[shapeSize].width} y2="5" stroke={shapeColor} strokeWidth="4"/>
              </svg>
            )}
            {selectedShape === 'star' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <polygon points={`${sizes[shapeSize].width/2},5 ${sizes[shapeSize].width*0.6},${sizes[shapeSize].height*0.4} ${sizes[shapeSize].width-5},${sizes[shapeSize].height*0.4} ${sizes[shapeSize].width*0.7},${sizes[shapeSize].height*0.6} ${sizes[shapeSize].width*0.8},${sizes[shapeSize].height-5} ${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width*0.2},${sizes[shapeSize].height-5} ${sizes[shapeSize].width*0.3},${sizes[shapeSize].height*0.6} 5,${sizes[shapeSize].height*0.4} ${sizes[shapeSize].width*0.4},${sizes[shapeSize].height*0.4}`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'heart' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <path d={`M${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.7} C${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.5} ${sizes[shapeSize].width*0.3},${sizes[shapeSize].height*0.3} ${sizes[shapeSize].width*0.3},${sizes[shapeSize].height*0.5} C${sizes[shapeSize].width*0.3},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.7} C${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width*0.7},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width*0.7},${sizes[shapeSize].height*0.5} C${sizes[shapeSize].width*0.7},${sizes[shapeSize].height*0.3} ${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.5} ${sizes[shapeSize].width/2},${sizes[shapeSize].height*0.7} Z`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'diamond' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <polygon points={`${sizes[shapeSize].width/2},5 ${sizes[shapeSize].width-5},${sizes[shapeSize].height/2} ${sizes[shapeSize].width/2},${sizes[shapeSize].height-5} 5,${sizes[shapeSize].height/2}`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'hexagon' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <polygon points={`${sizes[shapeSize].width/2},5 ${sizes[shapeSize].width*0.8},${sizes[shapeSize].height*0.3} ${sizes[shapeSize].width*0.8},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width/2},${sizes[shapeSize].height-5} ${sizes[shapeSize].width*0.2},${sizes[shapeSize].height*0.7} ${sizes[shapeSize].width*0.2},${sizes[shapeSize].height*0.3}`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'pentagon' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <polygon points={`${sizes[shapeSize].width/2},5 ${sizes[shapeSize].width*0.9},${sizes[shapeSize].height*0.4} ${sizes[shapeSize].width*0.7},${sizes[shapeSize].height-5} ${sizes[shapeSize].width*0.3},${sizes[shapeSize].height-5} ${sizes[shapeSize].width*0.1},${sizes[shapeSize].height*0.4}`} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'oval' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <ellipse cx={sizes[shapeSize].width/2} cy={sizes[shapeSize].height/2} rx={(sizes[shapeSize].width-4)/2} ry={(sizes[shapeSize].height-4)/2} fill={shapeColor} stroke={shapeColor} strokeWidth="2"/>
              </svg>
            )}
            {selectedShape === 'cross' && (
              <svg width={sizes[shapeSize].width} height={sizes[shapeSize].height}>
                <line x1={sizes[shapeSize].width/2} y1="5" x2={sizes[shapeSize].width/2} y2={sizes[shapeSize].height-5} stroke={shapeColor} strokeWidth="6"/>
                <line x1="5" y1={sizes[shapeSize].height/2} x2={sizes[shapeSize].width-5} y2={sizes[shapeSize].height/2} stroke={shapeColor} strokeWidth="6"/>
              </svg>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={insertShape}
          >
            Insert Shape
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shapes;
