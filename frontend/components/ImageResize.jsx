'use client';

import { useEffect, useRef } from 'react';

const ImageResize = ({ editor }) => {
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startXY = useRef({ x: 0, y: 0 });
  const currentImage = useRef(null);
  const resizeDirection = useRef('');
  const overlay = useRef(null);
  // Drag-and-drop disabled: only resizing supported
  const isRotating = useRef(false);
  const rotateStart = useRef({ angle: 0, base: 0 });

  useEffect(() => {
    if (!editor) return;

    const ensureOverlay = () => {
      if (overlay.current) return overlay.current;
      const el = document.createElement('div');
      el.className = 'image-selection-overlay';
      // add handles
      const positions = ['tl','tr','bl','br','tm','bm','ml','mr'];
      positions.forEach(pos => {
        const h = document.createElement('div');
        h.className = `resize-handle ${pos}`;
        el.appendChild(h);
      });
      const rot = document.createElement('div');
      rot.className = 'rotate-handle';
      el.appendChild(rot);
      document.body.appendChild(el);
      overlay.current = el;
      return el;
    };

    const removeOverlay = () => {
      if (overlay.current && overlay.current.parentNode) {
        overlay.current.parentNode.removeChild(overlay.current);
      }
      overlay.current = null;
      // also clear any stale visual selection
      document.querySelectorAll('.resizable-image.selected').forEach(x => x.classList.remove('selected'));
    };

    const positionOverlayToImage = (img) => {
      const ol = ensureOverlay();
      const rect = img.getBoundingClientRect();
      ol.style.width = rect.width + 'px';
      ol.style.height = rect.height + 'px';
      ol.style.left = rect.left + window.scrollX + 'px';
      ol.style.top = rect.top + window.scrollY + 'px';
    };

    // Re-sync overlay to the currently selected image (if still present)
    const syncOverlayToCurrent = () => {
      // Don't sync during active resize/rotate operations
      if (isResizing.current || isRotating.current) return;
      const img = currentImage.current;
      if (!img) return;
      // If image is detached from DOM (removed), clear overlay
      if (!document.body.contains(img)) {
        currentImage.current = null;
        removeOverlay();
        return;
      }
      positionOverlayToImage(img);
    };

    const getImageContainerElement = (img) => {
      // Use the closest page block's inner ProseMirror as the positioning container
      const page = img.closest('.document-page');
      if (page) {
        const inner = page.querySelector('.ProseMirror');
        if (inner) return inner;
        return page;
      }
      // Fallback: outer editor root
      return document.querySelector('.ProseMirror') || document.body;
    };

    const selectImage = (img) => {
      // mark selection
      document.querySelectorAll('.resizable-image.selected').forEach(x => x.classList.remove('selected'));
      img.classList.add('selected');
      positionOverlayToImage(img);
    };

    const handleMouseDown = (event) => {
      const target = event.target;
      const overHandle = target.classList && target.classList.contains('resize-handle');
      const overRotate = target.classList && target.classList.contains('rotate-handle');
      const overImage = target.closest('.resizable-image');

      // Handle resize/rotate handles
      if (overHandle || overRotate) {
        event.preventDefault();
        event.stopPropagation();
        
        const image = currentImage.current || document.querySelector('.resizable-image.selected');
        if (image && image.tagName === 'IMG') {
          selectImage(image);
          
          const rect = image.getBoundingClientRect();
          currentImage.current = image;
          startPos.current = { x: event.clientX, y: event.clientY };
          startSize.current = { width: rect.width, height: rect.height };

          if (overHandle) {
            isResizing.current = true;
            const h = target;
            if (h.classList.contains('br')) resizeDirection.current = 'se';
            else if (h.classList.contains('bl')) resizeDirection.current = 'sw';
            else if (h.classList.contains('tr')) resizeDirection.current = 'ne';
            else if (h.classList.contains('tl')) resizeDirection.current = 'nw';
            else if (h.classList.contains('mr')) resizeDirection.current = 'e';
            else if (h.classList.contains('ml')) resizeDirection.current = 'w';
            else if (h.classList.contains('tm')) resizeDirection.current = 'n';
            else if (h.classList.contains('bm')) resizeDirection.current = 's';
            
            // Record starting x/y relative to container if currently floating
            const container = getImageContainerElement(image);
            const cRect = container.getBoundingClientRect();
            startXY.current = { x: rect.left - cRect.left, y: rect.top - cRect.top };
          }

          if (overRotate) {
            isRotating.current = true;
            const ol = overlay.current;
            if (ol) {
              const rect2 = ol.getBoundingClientRect();
              const center = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
              const start = Math.atan2(event.clientY - center.y, event.clientX - center.x);
              const nodeAngle = Number(image.getAttribute('data-rotate')) || 0;
              rotateStart.current = { angle: nodeAngle, base: start };
            }
          }

          image.classList.add('resizing');
          document.addEventListener('mousemove', handleMouseMove, { passive: false });
          document.addEventListener('mouseup', handleMouseUp);
        }
      } else if (overImage && target.tagName === 'IMG') {
        // Clicked on image itself - select it
        event.preventDefault();
        event.stopPropagation();
        selectImage(target);
        currentImage.current = target;
      } else if (!target.closest('.image-selection-overlay')) {
        // Clicked outside: clear current selection/overlay
        currentImage.current = null;
        removeOverlay();
      }
    };

    const handleMouseMove = (event) => {
      if (!currentImage.current) {
        // Clean up if image disappeared
        if (isResizing.current || isRotating.current) {
          handleMouseUp();
        }
        return;
      }
      
      if (isResizing.current) {
        event.preventDefault();
        event.stopPropagation();
        const deltaX = event.clientX - startPos.current.x;
        const deltaY = event.clientY - startPos.current.y;
        const container = getImageContainerElement(currentImage.current);
        const cRect = container.getBoundingClientRect();
        const bounds = { w: cRect.width, h: cRect.height };

        let newWidth = startSize.current.width;
        let newHeight = startSize.current.height;
        let newX = startXY.current.x;
        let newY = startXY.current.y;

        switch (resizeDirection.current) {
          case 'se':
            newWidth = startSize.current.width + deltaX;
            newHeight = startSize.current.height + deltaY;
            break;
          case 'sw':
            newWidth = startSize.current.width - deltaX;
            newHeight = startSize.current.height + deltaY;
            newX = startXY.current.x + deltaX;
            break;
          case 'ne':
            newWidth = startSize.current.width + deltaX;
            newHeight = startSize.current.height - deltaY;
            newY = startXY.current.y + deltaY;
            break;
          case 'nw':
            newWidth = startSize.current.width - deltaX;
            newHeight = startSize.current.height - deltaY;
            newX = startXY.current.x + deltaX;
            newY = startXY.current.y + deltaY;
            break;
          case 'e':
            newWidth = startSize.current.width + deltaX;
            break;
          case 'w':
            newWidth = startSize.current.width - deltaX;
            newX = startXY.current.x + deltaX;
            break;
          case 's':
            newHeight = startSize.current.height + deltaY;
            break;
          case 'n':
            newHeight = startSize.current.height - deltaY;
            newY = startXY.current.y + deltaY;
            break;
        }

        // Min size
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        // Clamp into container
        if (newX < 0) { newWidth += newX; newX = 0; }
        if (newY < 0) { newHeight += newY; newY = 0; }
        if (newX + newWidth > bounds.w) newWidth = Math.max(50, bounds.w - newX);
        if (newY + newHeight > bounds.h) newHeight = Math.max(50, bounds.h - newY);

        // Apply to DOM for immediate feedback
        currentImage.current.style.width = `${newWidth}px`;
        currentImage.current.style.height = `${newHeight}px`;
        // If image is floating and we're resizing from W/N sides, also move it so opposite side stays anchored
        const isFloatingNow = (() => {
          const img = currentImage.current;
          if (!img) return false;
          // Check node attrs for floating
          let floating = false;
          const { state } = editor;
          state.doc.descendants((node) => {
            if (!floating && node.type.name === 'image' && node.attrs.src === img.src) {
              floating = !!node.attrs.floating;
              return false;
            }
            return true;
          });
          return floating;
        })();
        if (isFloatingNow && ['w','nw','sw','n','ne'].includes(resizeDirection.current)) {
          currentImage.current.style.position = 'absolute';
          currentImage.current.style.left = `${Math.round(newX)}px`;
          currentImage.current.style.top = `${Math.round(newY)}px`;
        }
        positionOverlayToImage(currentImage.current);

        // Update node attrs (width/height and x/y when floating)
        const { state, view } = editor;
        const { tr } = state;
        let dispatched = false;
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === currentImage.current.src) {
            const nextAttrs = { ...node.attrs, width: newWidth, height: newHeight };
            if (node.attrs.floating) {
              nextAttrs.x = Math.round(newX);
              nextAttrs.y = Math.round(newY);
            }
            tr.setNodeMarkup(pos, null, nextAttrs);
            dispatched = true;
            return false;
          }
          return true;
        });
        if (dispatched) {
          editor.view.dispatch(tr);
          // After doc update, the image DOM node may be replaced; rebind reference
          try {
            const prevSrc = currentImage.current && currentImage.current.getAttribute('src');
            if (prevSrc) {
              const root = editor.view?.dom || document;
              const candidates = Array.from(root.querySelectorAll('img.resizable-image'));
              const found = candidates.find(el => el.getAttribute('src') === prevSrc) || null;
              if (found && found !== currentImage.current) {
                currentImage.current = found;
                // keep visual selected state
                document.querySelectorAll('.resizable-image.selected').forEach(x => x.classList.remove('selected'));
                found.classList.add('selected');
                // Re-apply resizing class if still resizing
                if (isResizing.current) found.classList.add('resizing');
                positionOverlayToImage(found);
              }
            }
          } catch (e) {
            console.warn('Error rebinding image after resize:', e);
          }
        }
      }

      if (isRotating.current) {
        event.preventDefault();
        event.stopPropagation();
        const ol = overlay.current;
        if (!ol || !currentImage.current) return;
        const rect = ol.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const angle = Math.atan2(event.clientY - center.y, event.clientX - center.x);
        const deg = (rotateStart.current.angle || 0) + ((angle - rotateStart.current.base) * 180) / Math.PI;
        updateImageAttrs({ rotate: Math.round(deg) });
        positionOverlayToImage(currentImage.current);
      }
    };

    const handleMouseUp = () => {
      if (currentImage.current) {
        currentImage.current.classList.remove('resizing');
      }
      isResizing.current = false;
      // Drag disabled
      isRotating.current = false;
      currentImage.current = null;
      resizeDirection.current = '';
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleImageClick = (event) => {
      const image = event.target;
      if (image.tagName === 'IMG' && image.classList.contains('resizable-image')) {
        selectImage(image);
      }
    };

    // Drag helper removed

    const updateImageAttrs = (attrs) => {
      const img = currentImage.current;
      if (!img) return;
      const { state, view } = editor;
      const { tr } = state;
      let dispatched = false;
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === img.src) {
          tr.setNodeMarkup(pos, null, { ...node.attrs, ...attrs });
          dispatched = true;
          return false;
        }
        return true;
      });
      if (dispatched) view.dispatch(tr);
      // Sync DOM attributes helpful for quick reads
      if (attrs.rotate != null) img.setAttribute('data-rotate', String(attrs.rotate));
    };

    // Add event listeners
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('click', handleImageClick);
    const onScrollOrResize = () => {
      if (currentImage.current && overlay.current) positionOverlayToImage(currentImage.current);
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize, true);

    // Observe DOM mutations under the editor to keep overlay in sync
    const root = editor.view?.dom || document.querySelector('.ProseMirror');
    const mo = new MutationObserver(() => {
      syncOverlayToCurrent();
    });
    if (root) mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'width', 'height'] });

    // Also respond to editor doc/selection updates
    const offUpdate = editor.on('update', syncOverlayToCurrent);
    const offSel = editor.on('selectionUpdate', syncOverlayToCurrent);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('click', handleImageClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      removeOverlay();
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize, true);
      try { mo.disconnect(); } catch {}
      try { offUpdate?.(); } catch {}
      try { offSel?.(); } catch {}
    };
  }, [editor]);

  return null;
};

export default ImageResize;
