'use client';

import { useState, useRef, useEffect } from 'react';
import { FaSquare, FaCircle, FaMinus, FaArrowRight, FaStar, FaHeart, FaTimes } from 'react-icons/fa';

// Custom icon components for shapes that don't have direct icon equivalents
const TriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2 L14 14 L2 14 Z" />
  </svg>
);

const DiamondIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2 L14 8 L8 14 L2 8 Z" />
  </svg>
);

const HexagonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1 L13 4 L13 11 L8 14 L3 11 L3 4 Z" />
  </svg>
);

const PentagonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1 L14 5 L12 12 L4 12 L2 5 Z" />
  </svg>
);

const OvalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <ellipse cx="8" cy="8" rx="6" ry="4" />
  </svg>
);

const SHAPES = [
  { id: 'rectangle', label: 'Rectangle', icon: FaSquare },
  { id: 'circle', label: 'Circle', icon: FaCircle },
  { id: 'oval', label: 'Oval', icon: OvalIcon },
  { id: 'line', label: 'Line', icon: FaMinus },
  { id: 'arrow', label: 'Arrow', icon: FaArrowRight },
  { id: 'triangle', label: 'Triangle', icon: TriangleIcon },
  { id: 'diamond', label: 'Diamond', icon: DiamondIcon },
  { id: 'star', label: 'Star', icon: FaStar },
  { id: 'hexagon', label: 'Hexagon', icon: HexagonIcon },
  { id: 'pentagon', label: 'Pentagon', icon: PentagonIcon },
  { id: 'heart', label: 'Heart', icon: FaHeart },
  { id: 'cross', label: 'Cross', icon: FaTimes },
];

export default function ShapeQuickPalette({ editor, onClose }) {
  const [color, setColor] = useState('#111827');
  const overlayRef = useRef(null);
  const handlersRef = useRef({});

  useEffect(() => () => {
    // Do not remove overlay here; it is removed at the end of drawing (on mouseup).
    const h = handlersRef.current;
    if (h.down && h.overlay) h.overlay.removeEventListener('mousedown', h.down);
  }, []);

  const drawOnPage = (shapeId) => {
    if (!editor) return;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'crosshair';
    overlay.style.background = 'transparent';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.pointerEvents = 'auto';
    svg.style.userSelect = 'none';
    overlay.appendChild(svg);
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    let node = null; let start = null;
    // Track the page the user clicked; restrict drawing inside that page rect
    let pageRect = null;
    const findPageRectAt = (clientX, clientY) => {
      const pages = Array.from(document.querySelectorAll('.ProseMirror .document-page'));
      for (const el of pages) {
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return r;
      }
      return null;
    };
    const toSVGPoint = (e) => {
      const r = overlay.getBoundingClientRect();
      let x = e.clientX - r.left;
      let y = e.clientY - r.top;
      if (pageRect) {
        // clamp to pageRect
        const px1 = pageRect.left - r.left;
        const py1 = pageRect.top - r.top;
        const px2 = pageRect.right - r.left;
        const py2 = pageRect.bottom - r.top;
        x = Math.min(Math.max(x, px1), px2);
        y = Math.min(Math.max(y, py1), py2);
      }
      return { x, y };
    };
    const down = (e) => {
      e.preventDefault();
      // Resolve which page is under the pointer
      pageRect = findPageRectAt(e.clientX, e.clientY);
      if (!pageRect) { return; }
      start = toSVGPoint(e);
      switch (shapeId) {
        case 'rectangle': node = document.createElementNS('http://www.w3.org/2000/svg','rect'); break;
        case 'triangle': case 'diamond': case 'star': case 'hexagon': case 'pentagon': node = document.createElementNS('http://www.w3.org/2000/svg','polygon'); break;
        case 'circle': case 'oval': node = document.createElementNS('http://www.w3.org/2000/svg', shapeId==='circle'?'circle':'ellipse'); break;
        case 'line': case 'arrow': node = document.createElementNS('http://www.w3.org/2000/svg','line'); break;
        case 'heart': case 'cross': node = document.createElementNS('http://www.w3.org/2000/svg','path'); break;
        default: node = document.createElementNS('http://www.w3.org/2000/svg','rect');
      }
      node.setAttribute('fill', (shapeId==='line'||shapeId==='arrow'||shapeId==='cross')?'none':color);
      node.setAttribute('stroke', color);
      node.setAttribute('stroke-width', '2');
      svg.appendChild(node);
      svg.addEventListener('mousemove', move);
      svg.addEventListener('mouseup', up, { once: true });
    };
    const move = (e) => {
      if (!node||!start) return; e.preventDefault(); const p = toSVGPoint(e);
      const x=Math.min(start.x,p.x), y=Math.min(start.y,p.y), w=Math.abs(p.x-start.x), h=Math.abs(p.y-start.y);
      const cx=(start.x+p.x)/2, cy=(start.y+p.y)/2;
      switch (shapeId) {
        case 'rectangle': node.setAttribute('x',x); node.setAttribute('y',y); node.setAttribute('width',Math.max(1,w)); node.setAttribute('height',Math.max(1,h)); break;
        case 'circle': node.setAttribute('cx',cx); node.setAttribute('cy',cy); node.setAttribute('r',Math.max(1,Math.sqrt(w*w+h*h)/2)); break;
        case 'oval': node.setAttribute('cx',cx); node.setAttribute('cy',cy); node.setAttribute('rx',Math.max(1,w/2)); node.setAttribute('ry',Math.max(1,h/2)); break;
        case 'line': case 'arrow': node.setAttribute('x1',start.x); node.setAttribute('y1',start.y); node.setAttribute('x2',p.x); node.setAttribute('y2',p.y); break;
        case 'triangle': node.setAttribute('points',`${start.x},${y} ${x+w},${y+h} ${x},${y+h}`); break;
        case 'diamond': { const hw=Math.max(1,Math.abs(p.x-start.x)/2), hh=Math.max(1,Math.abs(p.y-start.y)/2); node.setAttribute('points',`${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}`); break; }
        case 'star': { const outer=Math.min(w,h)/2, inner=outer*0.5; const pts=[]; for(let i=0;i<10;i++){const r=i%2===0?outer:inner;const ang=-Math.PI/2+(i*Math.PI)/5; pts.push(`${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`);} node.setAttribute('points',pts.join(' ')); break; }
        case 'hexagon': { const r=Math.min(w,h)/2, pts=[]; for(let i=0;i<6;i++){const ang=-Math.PI/2+(i*Math.PI)/3; pts.push(`${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`);} node.setAttribute('points',pts.join(' ')); break; }
        case 'pentagon': { const r=Math.min(w,h)/2, pts=[]; for(let i=0;i<5;i++){const ang=-Math.PI/2+(i*2*Math.PI)/5; pts.push(`${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`);} node.setAttribute('points',pts.join(' ')); break; }
        case 'heart': { const rw=Math.max(1,w), rh=Math.max(1,h), left=x, top=y+rh*0.35; const d=[`M ${cx},${top+rh*0.65}`,`C ${cx},${top+rh*0.4} ${left+rw*0.25},${top+rh*0.25} ${left+rw*0.25},${top+rh*0.5}`,`C ${left+rw*0.25},${top+rh*0.75} ${cx},${top+rh*0.85} ${cx},${top+rh}`,`C ${cx},${top+rh*0.85} ${left+rw*0.75},${top+rh*0.75} ${left+rw*0.75},${top+rh*0.5}`,`C ${left+rw*0.75},${top+rh*0.25} ${cx},${top+rh*0.4} ${cx},${top+rh*0.65}`,'Z'].join(' '); node.setAttribute('d',d); break; }
        case 'cross': { const size=Math.min(w,h)/2; node.setAttribute('d',`M ${cx},${cy-size} L ${cx},${cy+size} M ${cx-size},${cy} L ${cx+size},${cy}`); node.setAttribute('stroke-linecap','round'); node.setAttribute('stroke-width','6'); node.setAttribute('fill','none'); break; }
      }
    };
    const up = () => {
      svg.removeEventListener('mousemove', move);
      svg.removeEventListener('mouseup', up);
      const clone = svg.cloneNode(true); clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
      const bbox = svg.getBBox();
      if (bbox && bbox.width>0 && bbox.height>0) {
        clone.setAttribute('viewBox',`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        clone.setAttribute('width',Math.max(1,Math.round(bbox.width)));
        clone.setAttribute('height',Math.max(1,Math.round(bbox.height)));
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
        editor.chain().focus().setImage({ src: dataUrl, title:'shape', style:'background:transparent;' }).run();
      }
      overlay.remove(); overlayRef.current=null; handlersRef.current={};
    };
    svg.addEventListener('mousedown', down);
    // Pointer/touch support
    svg.addEventListener('touchstart', (te)=> down(te.touches[0]));
    svg.addEventListener('touchmove', (te)=> move(te.touches[0]));
    svg.addEventListener('touchend', up, { once: true });
    handlersRef.current={ down, overlay };
    if (onClose) onClose();
  };

  return (
    <div className="p-2 bg-white border border-gray-300 rounded-md shadow-md w-[280px]">
      <div className="grid grid-cols-6 gap-2 mb-2">
        {SHAPES.map(s => {
          const Icon = s.icon || FaSquare;
          return (
            <button key={s.id} className="p-2 border rounded hover:bg-gray-50 flex items-center justify-center" title={s.label} onClick={() => drawOnPage(s.id)}>
              <Icon />
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Color</span>
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-8 h-6 border rounded" />
        <span className="text-[11px] text-gray-500">Click icon, then drag on page</span>
      </div>
    </div>
  );
}


