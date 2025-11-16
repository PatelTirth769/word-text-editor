'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const Header = ({ editor, isOpen, onClose }) => {
  const [headerDistance, setHeaderDistance] = useState(0.5);
  const [footerDistance, setFooterDistance] = useState(0.5);
  const [unit, setUnit] = useState('in'); // 'in' or 'mm'
  const [applyTo, setApplyTo] = useState('whole'); // 'whole', 'section', 'section-only'
  const [differentFirstPage, setDifferentFirstPage] = useState(false);
  const [differentOddEven, setDifferentOddEven] = useState(false);
  const [linkToPrevious, setLinkToPrevious] = useState(true);
  const [headerError, setHeaderError] = useState('');
  const [footerError, setFooterError] = useState('');
  const headerInputRef = useRef(null);
  const applyButtonRef = useRef(null);
  const dialogRef = useRef(null);

  // Convert between units
  const convertUnit = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'in' && toUnit === 'mm') {
      return value * 25.4;
    } else if (fromUnit === 'mm' && toUnit === 'in') {
      return value / 25.4;
    }
    return value;
  };

  // Initialize values when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Load saved values from document or use defaults
      const savedHeaderDistance = localStorage.getItem('headerDistance') || 0.5;
      const savedFooterDistance = localStorage.getItem('footerDistance') || 0.5;
      const savedUnit = localStorage.getItem('headerUnit') || 'in';
      
      setHeaderDistance(parseFloat(savedHeaderDistance));
      setFooterDistance(parseFloat(savedFooterDistance));
      setUnit(savedUnit);
      
      // Focus first input
      setTimeout(() => {
        if (headerInputRef.current) {
          headerInputRef.current.focus();
          headerInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen]);

  // Handle unit change
  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    
    setHeaderDistance(prev => {
      const converted = convertUnit(prev, unit, newUnit);
      return parseFloat(converted.toFixed(2));
    });
    
    setFooterDistance(prev => {
      const converted = convertUnit(prev, unit, newUnit);
      return parseFloat(converted.toFixed(2));
    });
    
    setUnit(newUnit);
  };

  // Validate distance values
  const validateDistance = (value, isHeader) => {
    const maxDistance = unit === 'in' ? 5 : 127; // ~5 inches or 127mm (half page)
    
    if (value <= 0) {
      if (isHeader) {
        setHeaderError('Enter a positive number.');
      } else {
        setFooterError('Enter a positive number.');
      }
      return false;
    }
    
    if (value > maxDistance) {
      if (isHeader) {
        setHeaderError(`Value too large — choose a smaller margin (max ${maxDistance}${unit}).`);
      } else {
        setFooterError(`Value too large — choose a smaller margin (max ${maxDistance}${unit}).`);
      }
      return false;
    }
    
    if (isHeader) {
      setHeaderError('');
    } else {
      setFooterError('');
    }
    return true;
  };

  // Handle header distance change
  const handleHeaderDistanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setHeaderDistance(value);
    validateDistance(value, true);
  };

  // Handle footer distance change
  const handleFooterDistanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setFooterDistance(value);
    validateDistance(value, false);
  };

  // Handle Apply button
  const handleApply = () => {
    // Validate inputs
    const headerValid = validateDistance(headerDistance, true);
    const footerValid = validateDistance(footerDistance, false);
    
    if (!headerValid || !footerValid) {
      return;
    }

    // Check for destructive changes
    if (differentFirstPage && !differentFirstPage) {
      // Would need to show confirmation in real implementation
      // For now, proceed
    }

    // Save settings
    localStorage.setItem('headerDistance', headerDistance.toString());
    localStorage.setItem('footerDistance', footerDistance.toString());
    localStorage.setItem('headerUnit', unit);
    localStorage.setItem('headerDifferentFirstPage', differentFirstPage.toString());
    localStorage.setItem('headerDifferentOddEven', differentOddEven.toString());
    localStorage.setItem('headerLinkToPrevious', linkToPrevious.toString());
    localStorage.setItem('headerApplyTo', applyTo);

    // Apply to document
    applyHeaderFooterSettings();
    
    onClose();
  };

  // Apply header/footer settings to document
  const applyHeaderFooterSettings = () => {
    if (!editor) return;

    // Convert to pixels for CSS (assuming 96 DPI)
    const headerDistancePx = unit === 'in' ? headerDistance * 96 : headerDistance * 3.779527559; // mm to px
    const footerDistancePx = unit === 'in' ? footerDistance * 96 : footerDistance * 3.779527559;

    // Apply CSS custom properties to document
    const editorElement = editor.view.dom.closest('.ProseMirror') || document.querySelector('.ProseMirror');
    if (editorElement) {
      const root = document.documentElement;
      root.style.setProperty('--header-distance', `${headerDistancePx}px`);
      root.style.setProperty('--footer-distance', `${footerDistancePx}px`);
    }

    // Apply data attributes to page container
    const pageContainer = document.querySelector('.page-container') || editor.view.dom.closest('[class*="page"]');
    if (pageContainer) {
      pageContainer.setAttribute('data-header-distance', headerDistancePx);
      pageContainer.setAttribute('data-footer-distance', footerDistancePx);
      pageContainer.setAttribute('data-different-first-page', differentFirstPage);
      pageContainer.setAttribute('data-different-odd-even', differentOddEven);
      pageContainer.setAttribute('data-link-to-previous', linkToPrevious);
      pageContainer.setAttribute('data-apply-to', applyTo);
    }

    // Trigger custom event for other components to listen
    window.dispatchEvent(new CustomEvent('headerFooterSettingsChanged', {
      detail: {
        headerDistance: headerDistancePx,
        footerDistance: footerDistancePx,
        headerDistanceValue: headerDistance,
        footerDistanceValue: footerDistance,
        unit,
        differentFirstPage,
        differentOddEven,
        linkToPrevious,
        applyTo
      }
    }));
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && e.target === applyButtonRef.current) {
        handleApply();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate preview values
  const previewHeaderDistance = headerDistance;
  const previewFooterDistance = footerDistance;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby="header-dialog-title"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl w-[360px] max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: '8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 id="header-dialog-title" className="text-lg font-bold text-gray-800">
            Header & footer settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close dialog"
            title="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Header Distance */}
          <div>
            <label htmlFor="header-distance" className="block text-sm font-medium text-gray-700 mb-1">
              Header:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  id="header-distance"
                  ref={headerInputRef}
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={unit === 'in' ? 5 : 127}
                  value={headerDistance}
                  onChange={handleHeaderDistanceChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    headerError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-describedby={headerError ? 'header-error' : 'header-helper'}
                />
                {headerError && (
                  <p id="header-error" className="text-xs text-red-500 mt-1" role="alert">
                    {headerError}
                  </p>
                )}
                <p id="header-helper" className="text-xs text-gray-500 mt-1">
                  Distance from top of page
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleUnitChange('in')}
                  className={`px-3 py-2 rounded-md text-sm border ${
                    unit === 'in'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={unit === 'in'}
                >
                  in
                </button>
                <button
                  onClick={() => handleUnitChange('mm')}
                  className={`px-3 py-2 rounded-md text-sm border ${
                    unit === 'mm'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={unit === 'mm'}
                >
                  mm
                </button>
              </div>
            </div>
          </div>

          {/* Footer Distance */}
          <div>
            <label htmlFor="footer-distance" className="block text-sm font-medium text-gray-700 mb-1">
              Footer:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  id="footer-distance"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={unit === 'in' ? 5 : 127}
                  value={footerDistance}
                  onChange={handleFooterDistanceChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    footerError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-describedby={footerError ? 'footer-error' : 'footer-helper'}
                />
                {footerError && (
                  <p id="footer-error" className="text-xs text-red-500 mt-1" role="alert">
                    {footerError}
                  </p>
                )}
                <p id="footer-helper" className="text-xs text-gray-500 mt-1">
                  Distance from bottom of page
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleUnitChange('in')}
                  className={`px-3 py-2 rounded-md text-sm border ${
                    unit === 'in'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={unit === 'in'}
                >
                  in
                </button>
                <button
                  onClick={() => handleUnitChange('mm')}
                  className={`px-3 py-2 rounded-md text-sm border ${
                    unit === 'mm'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={unit === 'mm'}
                >
                  mm
                </button>
              </div>
            </div>
          </div>

          {/* Apply To Dropdown */}
          <div>
            <label htmlFor="apply-to" className="block text-sm font-medium text-gray-700 mb-1">
              Apply to:
            </label>
            <select
              id="apply-to"
              value={applyTo}
              onChange={(e) => setApplyTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Apply to"
            >
              <option value="whole">Whole document</option>
              <option value="section">This section</option>
              <option value="section-only">This section — only</option>
            </select>
          </div>

          {/* Different First Page Checkbox */}
          <div className="flex items-start">
            <input
              id="different-first-page"
              type="checkbox"
              checked={differentFirstPage}
              onChange={(e) => setDifferentFirstPage(e.target.checked)}
              className="mt-1 mr-2"
              aria-label="Different first page"
            />
            <label htmlFor="different-first-page" className="flex-1">
              <span className="text-sm text-gray-700">Different first page</span>
              <div className="text-xs text-gray-500 mt-0.5">
                Make the first page header different from the rest of the document.
              </div>
            </label>
          </div>

          {/* Different Odd & Even Pages Checkbox */}
          <div className="flex items-start">
            <input
              id="different-odd-even"
              type="checkbox"
              checked={differentOddEven}
              onChange={(e) => setDifferentOddEven(e.target.checked)}
              className="mt-1 mr-2"
              aria-label="Different odd and even pages"
            />
            <label htmlFor="different-odd-even" className="flex-1">
              <span className="text-sm text-gray-700">Different odd & even pages</span>
              <div className="text-xs text-gray-500 mt-0.5">
                Use different headers on odd and even pages.
              </div>
            </label>
          </div>

          {/* Link to Previous Checkbox */}
          <div className="flex items-start">
            <input
              id="link-to-previous"
              type="checkbox"
              checked={linkToPrevious}
              onChange={(e) => setLinkToPrevious(e.target.checked)}
              className="mt-1 mr-2"
              aria-label="Link to previous"
            />
            <label htmlFor="link-to-previous" className="flex-1">
              <span className="text-sm text-gray-700">Link to previous</span>
              <div className="text-xs text-gray-500 mt-0.5">
                Link this section's header to the previous section's header.
              </div>
            </label>
          </div>

          {/* Preview Area */}
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-2">Preview</div>
            <div className="relative h-24 bg-white border border-gray-300 rounded">
              {/* Page representation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200 border-b border-blue-400"
                style={{ height: `${Math.max(2, (previewHeaderDistance / 0.5) * 2)}px` }}
                title={`Header distance: ${previewHeaderDistance} ${unit}`}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200 border-t border-blue-400"
                style={{ height: `${Math.max(2, (previewFooterDistance / 0.5) * 2)}px` }}
                title={`Footer distance: ${previewFooterDistance} ${unit}`}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                Page content area
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            ref={applyButtonRef}
            onClick={handleApply}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Apply changes"
            disabled={!!headerError || !!footerError}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;







