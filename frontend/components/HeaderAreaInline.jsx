'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const HeaderAreaInline = ({ editor, isOpen, onClose, position }) => {
  const [headerDistance, setHeaderDistance] = useState(0.5);
  const [footerDistance, setFooterDistance] = useState(0.5);
  const [unit, setUnit] = useState('in');
  const [applyTo, setApplyTo] = useState('whole');
  const [differentFirstPage, setDifferentFirstPage] = useState(false);
  const [differentOddEven, setDifferentOddEven] = useState(false);
  const [linkToPrevious, setLinkToPrevious] = useState(true);
  const [headerError, setHeaderError] = useState('');
  const [footerError, setFooterError] = useState('');
  const popupRef = useRef(null);
  const headerInputRef = useRef(null);
  const applyButtonRef = useRef(null);

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
      // Load saved values from localStorage or use defaults
      const savedHeaderDistance = localStorage.getItem('headerDistance') || 0.5;
      const savedFooterDistance = localStorage.getItem('footerDistance') || 0.5;
      const savedUnit = localStorage.getItem('headerUnit') || 'in';
      const savedDifferentFirstPage = localStorage.getItem('headerDifferentFirstPage') === 'true';
      const savedDifferentOddEven = localStorage.getItem('headerDifferentOddEven') === 'true';
      const savedLinkToPrevious = localStorage.getItem('headerLinkToPrevious') !== 'false';
      const savedApplyTo = localStorage.getItem('headerApplyTo') || 'whole';
      
      setHeaderDistance(parseFloat(savedHeaderDistance));
      setFooterDistance(parseFloat(savedFooterDistance));
      setUnit(savedUnit);
      setDifferentFirstPage(savedDifferentFirstPage);
      setDifferentOddEven(savedDifferentOddEven);
      setLinkToPrevious(savedLinkToPrevious);
      setApplyTo(savedApplyTo);
      
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
    const maxDistance = unit === 'in' ? 5 : 127;
    
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

  // Handle header distance change with live preview
  const handleHeaderDistanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setHeaderDistance(value);
    if (validateDistance(value, true)) {
      // Live preview update
      applyPreviewDistance(value, footerDistance, true, false);
    }
  };

  // Handle footer distance change with live preview
  const handleFooterDistanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setFooterDistance(value);
    if (validateDistance(value, false)) {
      // Live preview update
      applyPreviewDistance(headerDistance, value, false, true);
    }
  };

  // Apply preview distance (live update without saving)
  const applyPreviewDistance = (headerVal, footerVal, isHeader, isFooter) => {
    const headerDistancePx = unit === 'in' ? headerVal * 96 : headerVal * 3.779527559;
    const footerDistancePx = unit === 'in' ? footerVal * 96 : footerVal * 3.779527559;

    const root = document.documentElement;
    if (isHeader) {
      root.style.setProperty('--header-distance-preview', `${headerDistancePx}px`);
      // Update header area height live
      const headerArea = document.querySelector('.header-area');
      if (headerArea) {
        const headerContent = headerArea.querySelector('div[class*="border-b"]');
        if (headerContent) {
          headerContent.style.height = `${Math.max(40, headerDistancePx)}px`;
        }
      }
    }
    if (isFooter) {
      root.style.setProperty('--footer-distance-preview', `${footerDistancePx}px`);
    }

    // Apply to page container temporarily
    const pageContainer = document.querySelector('.page-container') || document.querySelector('[class*="max-w-\\[210mm\\]"]');
    if (pageContainer) {
      if (isHeader) {
        pageContainer.style.setProperty('--header-distance-preview', `${headerDistancePx}px`);
      }
      if (isFooter) {
        pageContainer.style.setProperty('--footer-distance-preview', `${footerDistancePx}px`);
      }
    }
  };

  // Handle Apply button
  const handleApply = () => {
    // Validate inputs
    const headerValid = validateDistance(headerDistance, true);
    const footerValid = validateDistance(footerDistance, false);
    
    if (!headerValid || !footerValid) {
      return;
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
    
    // Clear preview styles
    document.documentElement.style.removeProperty('--header-distance-preview');
    document.documentElement.style.removeProperty('--footer-distance-preview');
    
    onClose();
  };

  // Apply header/footer settings to document
  const applyHeaderFooterSettings = () => {
    if (!editor) return;

    // Convert to pixels for CSS
    const headerDistancePx = unit === 'in' ? headerDistance * 96 : headerDistance * 3.779527559;
    const footerDistancePx = unit === 'in' ? footerDistance * 96 : footerDistance * 3.779527559;

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--header-distance', `${headerDistancePx}px`);
    root.style.setProperty('--footer-distance', `${footerDistancePx}px`);

    // Apply data attributes to page container
    const pageContainer = document.querySelector('.page-container') || document.querySelector('[class*="max-w-\\[210mm\\]"]');
    if (pageContainer) {
      pageContainer.setAttribute('data-header-distance', headerDistancePx);
      pageContainer.setAttribute('data-footer-distance', footerDistancePx);
      pageContainer.setAttribute('data-different-first-page', differentFirstPage);
      pageContainer.setAttribute('data-different-odd-even', differentOddEven);
      pageContainer.setAttribute('data-link-to-previous', linkToPrevious);
      pageContainer.setAttribute('data-apply-to', applyTo);
    }

    // Trigger custom event
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

  // Handle Cancel - restore original values
  const handleCancel = () => {
    // Restore original values from localStorage
    const savedHeaderDistance = localStorage.getItem('headerDistance') || 0.5;
    const savedFooterDistance = localStorage.getItem('footerDistance') || 0.5;
    const savedUnit = localStorage.getItem('headerUnit') || 'in';
    
    setHeaderDistance(parseFloat(savedHeaderDistance));
    setFooterDistance(parseFloat(savedFooterDistance));
    setUnit(savedUnit);
    
    // Clear preview styles
    document.documentElement.style.removeProperty('--header-distance-preview');
    document.documentElement.style.removeProperty('--footer-distance-preview');
    
    onClose();
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter' && e.target === applyButtonRef.current) {
        handleApply();
      }
    };

    // Close on outside click
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        // Check if click is not in the header area
        const headerArea = document.querySelector('.header-area');
        if (!headerArea || !headerArea.contains(e.target)) {
          handleCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen || !position) return null;

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-labelledby="header-inline-dialog-title"
      aria-modal="true"
      className="fixed bg-white rounded-lg shadow-lg border border-gray-300 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '300px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 id="header-inline-dialog-title" className="text-sm font-bold text-gray-800">
          Header & footer options
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close dialog"
          title="Close"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Header Distance */}
        <div>
          <label htmlFor="header-distance-inline" className="block text-xs font-medium text-gray-700 mb-1">
            Header
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                id="header-distance-inline"
                ref={headerInputRef}
                type="number"
                step="0.1"
                min="0.1"
                max={unit === 'in' ? 5 : 127}
                value={headerDistance}
                onChange={handleHeaderDistanceChange}
                className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  headerError ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby={headerError ? 'header-error-inline' : 'header-helper-inline'}
              />
              {headerError && (
                <p id="header-error-inline" className="text-xs text-red-500 mt-0.5" role="alert">
                  {headerError}
                </p>
              )}
              <p id="header-helper-inline" className="text-xs text-gray-500 mt-0.5">
                Distance from top of page
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleUnitChange('in')}
                className={`px-2 py-1.5 text-xs rounded border ${
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
                className={`px-2 py-1.5 text-xs rounded border ${
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
          <label htmlFor="footer-distance-inline" className="block text-xs font-medium text-gray-700 mb-1">
            Footer
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                id="footer-distance-inline"
                type="number"
                step="0.1"
                min="0.1"
                max={unit === 'in' ? 5 : 127}
                value={footerDistance}
                onChange={handleFooterDistanceChange}
                className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  footerError ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby={footerError ? 'footer-error-inline' : 'footer-helper-inline'}
              />
              {footerError && (
                <p id="footer-error-inline" className="text-xs text-red-500 mt-0.5" role="alert">
                  {footerError}
                </p>
              )}
              <p id="footer-helper-inline" className="text-xs text-gray-500 mt-0.5">
                Distance from bottom of page
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleUnitChange('in')}
                className={`px-2 py-1.5 text-xs rounded border ${
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
                className={`px-2 py-1.5 text-xs rounded border ${
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

        {/* Different First Page Checkbox */}
        <div className="flex items-start">
          <input
            id="different-first-page-inline"
            type="checkbox"
            checked={differentFirstPage}
            onChange={(e) => setDifferentFirstPage(e.target.checked)}
            className="mt-0.5 mr-2"
            aria-label="Different first page"
          />
          <label htmlFor="different-first-page-inline" className="flex-1">
            <span className="text-xs text-gray-700">Different first page</span>
            <div className="text-xs text-gray-500 mt-0.5">
              Use a different header or footer on the first page.
            </div>
          </label>
        </div>

        {/* Different Odd & Even Pages Checkbox */}
        <div className="flex items-start">
          <input
            id="different-odd-even-inline"
            type="checkbox"
            checked={differentOddEven}
            onChange={(e) => setDifferentOddEven(e.target.checked)}
            className="mt-0.5 mr-2"
            aria-label="Different odd and even pages"
          />
          <label htmlFor="different-odd-even-inline" className="flex-1">
            <span className="text-xs text-gray-700">Different odd & even</span>
            <div className="text-xs text-gray-500 mt-0.5">
              Use separate headers on odd and even pages.
            </div>
          </label>
        </div>

        {/* Link to Previous Checkbox */}
        <div className="flex items-start">
          <input
            id="link-to-previous-inline"
            type="checkbox"
            checked={linkToPrevious}
            onChange={(e) => setLinkToPrevious(e.target.checked)}
            className="mt-0.5 mr-2"
            aria-label="Link to previous"
          />
          <label htmlFor="link-to-previous-inline" className="flex-1">
            <span className="text-xs text-gray-700">Link to previous section</span>
            <div className="text-xs text-gray-500 mt-0.5">
              Use the same header/footer as the previous section.
            </div>
          </label>
        </div>

        {/* Apply to Dropdown */}
        <div>
          <label htmlFor="apply-to-inline" className="block text-xs font-medium text-gray-700 mb-1">
            Apply to:
          </label>
          <select
            id="apply-to-inline"
            value={applyTo}
            onChange={(e) => setApplyTo(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Apply to"
          >
            <option value="whole">Whole document</option>
            <option value="section">This section</option>
            <option value="section-only">This section — only</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t border-gray-200 flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          ref={applyButtonRef}
          onClick={handleApply}
          className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Apply changes"
          disabled={!!headerError || !!footerError}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default HeaderAreaInline;







