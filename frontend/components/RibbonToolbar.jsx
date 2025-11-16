'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaListUl,
  FaListOl,
  FaTable,
  FaImage,
  FaLink,
  FaUndo,
  FaRedo,
  FaSubscript,
  FaSuperscript,
  FaHighlighter,
  FaFont,
  FaPalette,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaSquare,
  FaPaintBrush,
  FaShapes,
  FaPen,
  FaEraser,
  FaCopy,
  FaCut,
  FaPaste,
  FaSearch,
  FaSpellCheck,
  FaComments,
  FaComment,
  FaEye,
  FaPrint,
  FaSave,
  FaFolderOpen,
  FaFilePdf,
  FaFileWord,
  FaFileImport,
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMinus,
  FaExpand,
  FaCompress,
  FaRotateLeft,
  FaRotateRight,
  FaFlipHorizontal,
  FaFlipVertical,
  FaLayerGroup,
  FaObjectGroup,
  FaObjectUngroup,
  FaVectorSquare,
  FaCircle,
  FaTriangle,
  FaStar,
  FaHeart,
  FaArrowRight,
  FaArrowDown,
  FaArrowUp,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaBookmark,
  FaBook,
  FaLanguage,
  FaGlobe,
  FaMicrophone,
  FaVolumeUp,
  FaCheck,
  FaTimes,
  FaLock,
  FaRuler,
  FaFileText
} from 'react-icons/fa';
import { MdOutlineInsertPageBreak } from 'react-icons/md';
import { RiPageSeparator, RiPagesLine } from 'react-icons/ri';
import TableManager from './TableManager';
import ImageManager from './ImageManager';
import DateTime from './DateTime';
import Shapes from './Shapes';
import ShapeQuickPalette from './ShapeQuickPalette';
import FindReplace from './FindReplace';
import SpellCheck from './SpellCheck';
import WordCount from './WordCount';
import ReadAloud from './ReadAloud';

const RibbonToolbar = ({ editor, onOpenReadAloud }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [customHighlightColor, setCustomHighlightColor] = useState('#ffff00');
  const [showTableManager, setShowTableManager] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showDateTime, setShowDateTime] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showShapePalette, setShowShapePalette] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showFontSetPicker, setShowFontSetPicker] = useState(false);
  const [currentFontSet, setCurrentFontSet] = useState('Office');
  const [showParagraphSpacingPicker, setShowParagraphSpacingPicker] = useState(false);
  const [paragraphSpacing, setParagraphSpacing] = useState('Default');
  const [showPageBorders, setShowPageBorders] = useState(false);
  const [pageBorderStyle, setPageBorderStyle] = useState('None');
  const [showPageColor, setShowPageColor] = useState(false);
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#FFFFFF');
  
  const colorMenuRef = useRef(null);
  const fontMenuRef = useRef(null);
  const highlightMenuRef = useRef(null);
  const fontSetMenuRef = useRef(null);
  const paragraphSpacingMenuRef = useRef(null);
  const pageBordersMenuRef = useRef(null);
  const pageColorMenuRef = useRef(null);

  // Font sets definition (like MS Word)
  const fontSets = {
    'Office': { heading: 'Calibri Light', body: 'Calibri' },
    'Calibri Light': { heading: 'Calibri Light', body: 'Calibri' },
    'Candara': { heading: 'Candara', body: 'Candara' },
    'Corbel': { heading: 'Corbel', body: 'Corbel' },
    'Franklin Gothic': { heading: 'Franklin Gothic Medium', body: 'Franklin Gothic Book' },
    'Georgia': { heading: 'Georgia', body: 'Georgia' },
    'Office 2007-2010': { heading: 'Cambria', body: 'Calibri' },
    'Office 2': { heading: 'Calibri Light', body: 'Calibri' },
    'Office Classic': { heading: 'Times New Roman', body: 'Times New Roman' },
    'Office Classic 2': { heading: 'Arial', body: 'Arial' },
    'Trebuchet': { heading: 'Trebuchet MS', body: 'Trebuchet MS' }
  };

  // Paragraph spacing options (like MS Word)
  const paragraphSpacingOptions = [
    { name: 'Default', lineHeight: '1.15', marginTop: '0', marginBottom: '0' },
    { name: 'No Paragraph Space', lineHeight: '1', marginTop: '0', marginBottom: '0' },
    { name: 'Compact', lineHeight: '1.08', marginTop: '0', marginBottom: '0' },
    { name: 'Tight', lineHeight: '1.1', marginTop: '0', marginBottom: '0' },
    { name: 'Relaxed', lineHeight: '1.3', marginTop: '0', marginBottom: '0' },
    { name: 'Double', lineHeight: '2', marginTop: '0', marginBottom: '0' },
    { name: 'Open', lineHeight: '1.15', marginTop: '0.5em', marginBottom: '0.5em' },
    { name: 'Very Open', lineHeight: '1.15', marginTop: '1em', marginBottom: '1em' }
  ];

  // Apply font set to document (like MS Word)
  const applyFontSet = (fontSet) => {
    if (!editor) return;
    const fonts = fontSets[fontSet] || fontSets['Office'];
    
    // Apply fonts to document
    editor.chain().focus().setFontFamily(fonts.body).run();
    
    // Store font set for headings
    const styleId = 'design-font-set';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = `
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, 
      .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 { 
        font-family: '${fonts.heading}', sans-serif !important; 
      }
      .ProseMirror p, .ProseMirror li, .ProseMirror td { 
        font-family: '${fonts.body}', sans-serif !important; 
      }
    `;
    
    // Store in localStorage
    localStorage.setItem('word-editor-design-fonts', fontSet);
  };

  // Apply paragraph spacing to document (like MS Word)
  const applyParagraphSpacing = (spacingName) => {
    if (!editor) return;
    
    const spacing = paragraphSpacingOptions.find(s => s.name === spacingName);
    if (!spacing) return;
    
    // Apply paragraph spacing globally via CSS (like MS Word document formatting)
    const styleId = 'design-paragraph-spacing';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    // Apply to all paragraphs, headings, list items, and table cells
    styleElement.textContent = `
      .ProseMirror p {
        line-height: ${spacing.lineHeight} !important;
        margin-top: ${spacing.marginTop} !important;
        margin-bottom: ${spacing.marginBottom} !important;
      }
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3,
      .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
        line-height: ${spacing.lineHeight} !important;
        margin-top: ${spacing.marginTop} !important;
        margin-bottom: ${spacing.marginBottom} !important;
      }
      .ProseMirror li {
        line-height: ${spacing.lineHeight} !important;
        margin-top: ${spacing.marginTop} !important;
        margin-bottom: ${spacing.marginBottom} !important;
      }
      .ProseMirror td, .ProseMirror th {
        line-height: ${spacing.lineHeight} !important;
      }
    `;
    
    // Store in localStorage
    localStorage.setItem('word-editor-design-paragraph-spacing', spacingName);
  };

  // Apply page borders to A4 pages (like MS Word)
  const applyPageBorders = (style, borderColor = '#000000', borderWidth = '1pt', borderStyle = 'solid') => {
    if (!editor) return;
    
    const styleId = 'design-page-borders';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    if (style === 'None') {
      // Explicitly remove border by removing the pseudo-element
      styleElement.textContent = `
        .ProseMirror .document-page::before {
          display: none !important;
        }
      `;
      localStorage.setItem('word-editor-design-page-borders', 'None');
      return;
    }
    
    // Convert pt to px (1pt ≈ 1.33px)
    const widthValue = borderWidth.replace('pt', '').trim();
    const widthNum = parseFloat(widthValue) || 1;
    const widthPx = `${widthNum * 1.33}px`;
    
    // Map border style names
    let cssBorderStyle = borderStyle.toLowerCase();
    if (cssBorderStyle === 'solid') cssBorderStyle = 'solid';
    else if (cssBorderStyle === 'dashed') cssBorderStyle = 'dashed';
    else if (cssBorderStyle === 'dotted') cssBorderStyle = 'dotted';
    else if (cssBorderStyle === 'double') cssBorderStyle = 'double';
    
    let borderCSS = '';
    let boxShadowCSS = '';
    
    switch(style) {
      case 'Box':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`;
        break;
      case 'Shadow':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`;
        boxShadowCSS = `box-shadow: 4px 4px 8px rgba(0,0,0,0.3) !important;`;
        break;
      case '3-D':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`;
        boxShadowCSS = `box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.1) !important;`;
        break;
      case 'Custom':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`;
        break;
      default:
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`;
    }
    
    // Apply borders to A4 page containers (.document-page)
    // Borders should be inside the page boundaries (like MS Word)
    // Use a pseudo-element inset from edges to create borders inside the page
    // Inset by 2mm from each edge to match MS Word behavior
    styleElement.textContent = `
      .ProseMirror .document-page {
        position: relative !important;
        box-sizing: border-box !important;
      }
      .ProseMirror .document-page::before {
        content: '';
        position: absolute;
        top: 2mm;
        left: 2mm;
        right: 2mm;
        bottom: 2mm;
        ${borderCSS}
        ${boxShadowCSS}
        pointer-events: none;
        z-index: 1;
      }
    `;
    
    // Store in localStorage
    localStorage.setItem('word-editor-design-page-borders', JSON.stringify({
      style,
      borderColor,
      borderWidth,
      borderStyle
    }));
  };

  // Apply page color to A4 pages (like MS Word)
  const applyPageColor = (color) => {
    if (!editor) return;
    
    const styleId = 'design-page-color';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    // Apply background color to A4 page containers (.document-page)
    // Use !important to override existing CSS rules
    styleElement.textContent = `
      .ProseMirror .document-page {
        background-color: ${color} !important;
      }
    `;
    
    // Store in localStorage
    localStorage.setItem('word-editor-design-page-color', color);
  };

  // Load design preferences from localStorage on mount
  useEffect(() => {
    const savedFontSet = localStorage.getItem('word-editor-design-fonts');
    if (savedFontSet && fontSets[savedFontSet]) {
      setCurrentFontSet(savedFontSet);
      if (editor) {
        applyFontSet(savedFontSet);
      }
    }
    
    const savedParagraphSpacing = localStorage.getItem('word-editor-design-paragraph-spacing');
    if (savedParagraphSpacing && paragraphSpacingOptions.find(s => s.name === savedParagraphSpacing)) {
      setParagraphSpacing(savedParagraphSpacing);
      if (editor) {
        applyParagraphSpacing(savedParagraphSpacing);
      }
    }
    
    const savedPageBorders = localStorage.getItem('word-editor-design-page-borders');
    if (savedPageBorders) {
      try {
        const borders = JSON.parse(savedPageBorders);
        if (borders.style) {
          setPageBorderStyle(borders.style);
          if (editor) {
            applyPageBorders(borders.style, borders.borderColor || '#000000', borders.borderWidth || '1pt', borders.borderStyle || 'solid');
          }
        }
      } catch (e) {
        // If not JSON, it's probably the old format
        if (savedPageBorders !== 'None') {
          setPageBorderStyle(savedPageBorders);
        }
      }
    }
    
    const savedPageColor = localStorage.getItem('word-editor-design-page-color');
    if (savedPageColor) {
      setPageBackgroundColor(savedPageColor);
      if (editor) {
        applyPageColor(savedPageColor);
      }
    }
  }, [editor]);

  // Close menus when clicking outside
  useEffect(() => {
    if (!editor) return;

    const handleClickOutside = (event) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
        setShowColorMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target)) {
        setShowFontMenu(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(event.target)) {
        setShowHighlightMenu(false);
      }
      if (fontSetMenuRef.current && !fontSetMenuRef.current.contains(event.target)) {
        setShowFontSetPicker(false);
      }
      if (paragraphSpacingMenuRef.current && !paragraphSpacingMenuRef.current.contains(event.target)) {
        setShowParagraphSpacingPicker(false);
      }
      if (pageBordersMenuRef.current && !pageBordersMenuRef.current.contains(event.target)) {
        setShowPageBorders(false);
      }
      if (pageColorMenuRef.current && !pageColorMenuRef.current.contains(event.target)) {
        setShowPageColor(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editor]);

  // Avoid returning early before hooks; guard handlers internally instead

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
  const lineHeights = ['1', '1.15', '1.5', '2', '2.5'];
  const fontFamilies = [
    'Arial',
    'Calibri',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Tahoma',
    'Courier New',
    'Comic Sans MS',
    'Garamond',
    'Trebuchet MS',
    'Helvetica',
    'Segoe UI',
    'Cambria',
    'Candara',
    'Consolas',
    'Monaco',
    'Lucida Sans',
    'Lucida Console',
    'Palatino Linotype',
    'Gill Sans',
    'Impact'
  ];
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808080',
    '#C0C0C0', '#800080', '#008080', '#FFA500'
  ];

  const tabs = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'insert', label: 'Insert', icon: FaPlus },
    { id: 'draw', label: 'Draw', icon: FaPen },
    { id: 'design', label: 'Design', icon: FaPaintBrush },
    { id: 'layout', label: 'Layout', icon: FaEdit },
    { id: 'references', label: 'References', icon: FaFileAlt },
    { id: 'mailings', label: 'Mailings', icon: FaFileAlt },
    { id: 'review', label: 'Review', icon: FaComments },
    { id: 'view', label: 'View', icon: FaEye },
    { id: 'help', label: 'Help', icon: FaFileAlt }
  ];

  // Clipboard actions
  const handleCopy = async () => {
    try {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, '\n');
      if (text && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      // Fallback
      document.execCommand('copy');
    } catch {
      document.execCommand('copy');
    }
  };

  const handleCut = async () => {
    try {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, '\n');
      if (text && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        editor.chain().focus().deleteSelection().run();
        return;
      }
      // Fallback
      document.execCommand('cut');
    } catch {
      document.execCommand('cut');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.chain().focus().insertContent(text).run();
        return;
      }
    } catch {}
    // Fallback
    document.execCommand('paste');
  };

  // (Format Painter removed)

  const addImage = () => setShowImageManager(true);
  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };
  const addTable = () => setShowTableManager(true);
  const addDateTime = () => setShowDateTime(true);
  const addShapes = () => setShowShapePalette(!showShapePalette);
  const insertHorizontalLine = () => {
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
  };

  // Insert → Pages actions
  const insertPageBreak = () => {
    if (!editor) return;
    // Only a semantic break; no spacers that shift layout
    editor.chain().focus().insertContent('<hr class="page-break" />').run();
  };

  const insertBlankPage = () => {
    if (!editor) return;
    // Append a new pageBlock at the document root end to avoid nesting
    editor.chain().focus('end').command(({ state, tr, dispatch }) => {
      const { schema } = state;
      const pageNodeType = schema.nodes.pageBlock;
      if (!pageNodeType) return false;
      const endPos = state.doc.content.size; // absolute end of doc at root
      const newPage = pageNodeType.createAndFill({}, schema.nodes.paragraph ? schema.nodes.paragraph.create() : undefined);
      if (!newPage) return false;
      tr.insert(endPos, newPage);
      if (dispatch) dispatch(tr.scrollIntoView());
      return true;
    }).run();
  };

  const insertCoverPage = () => {
    if (!editor) return;
    // Replace the content of the first page only (do not create a new page)
    editor.chain().focus('start').command(({ state, tr, dispatch }) => {
      const { doc, schema } = state;
      const pageType = schema.nodes.pageBlock;
      if (!pageType) return false;

      let firstPagePos = null;
      let firstPageNode = null;
      doc.descendants((node, pos) => {
        if (firstPageNode) return false;
        if (node.type === pageType) {
          firstPagePos = pos;
          firstPageNode = node;
          return false;
        }
        return true;
      });
      if (!firstPageNode || firstPagePos == null) return false;

      const pageContentStart = firstPagePos + 1;
      const pageContentEnd = firstPagePos + firstPageNode.nodeSize - 1;

      const coverNodes = schema
        .nodes
        .paragraph
        ? [
            schema.nodes.heading.create({ level: 1 }, schema.text('Document Title')),
            schema.nodes.paragraph.create(null, schema.text('Subtitle or Tagline')),
            schema.nodes.paragraph.create(null, schema.text('Author Name')),
            schema.nodes.paragraph.create(null, schema.text(new Date().toLocaleDateString())),
          ]
        : [];

      // Replace inner content of the first page with cover nodes
      tr.replaceWith(pageContentStart, pageContentEnd, coverNodes);
      if (dispatch) dispatch(tr.scrollIntoView());
      return true;
    }).run();
  };

  const renderHomeTab = () => (
    <div className="ribbon-content">
      {/* Clipboard Group */}
      <div className="ribbon-group ribbon-group--clipboard">
        <div className="ribbon-group-label">Clipboard</div>
        <div className="ribbon-group-content">
          <div className="ribbon-row">
            <button className="ribbon-button" title="Paste" onClick={handlePaste}>
              <FaPaste />
            </button>
            <button className="ribbon-button" title="Cut" onClick={handleCut}>
              <FaCut />
            </button>
            <button className="ribbon-button" title="Copy" onClick={handleCopy}>
              <FaCopy />
            </button>
          </div>
          {/* Format Painter removed */}
        </div>
      </div>

      {/* Font Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Font</div>
        <div className="ribbon-group-content">
          <div className="ribbon-row">
            <div className="relative" ref={fontMenuRef}>
              <select
                className="ribbon-select"
                value={editor?.getAttributes('textStyle')?.fontFamily || 'Calibri'}
                onChange={(e) => {
                  const family = e.target.value;
                  if (!editor) return;
                  editor.chain().focus().setFontFamily(family).run();
                }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="ribbon-select"
              value={(editor?.getAttributes('textStyle')?.fontSize || '11pt').replace('px','pt')}
              onChange={(e) => {
                const sizePt = e.target.value; // e.g., '12' or '12pt'
                if (!editor) return;
                const normalized = /pt$/.test(sizePt) ? sizePt : `${sizePt}pt`;
                if (editor.commands.setFontSize) {
                  editor.commands.setFontSize(normalized);
                } else {
                  // Fallback: apply as textStyle
                  editor.chain().focus().setMark('textStyle', { fontSize: normalized }).run();
                }
              }}
            >
              {fontSizes.map(size => (
                <option key={size} value={`${size}pt`}>{size}</option>
              ))}
            </select>
          </div>
          <div className="ribbon-row">
            <button
              className={`ribbon-button ${(editor && editor.isActive('bold')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              className={`ribbon-button ${(editor && editor.isActive('italic')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              className={`ribbon-button ${(editor && editor.isActive('underline')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <FaUnderline />
            </button>
            <button
              className={`ribbon-button ${(editor && editor.isActive('strike')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <FaStrikethrough />
            </button>
            <button
              className={`ribbon-button ${(editor && editor.isActive('subscript')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleSubscript().run()}
              title="Subscript"
            >
              <FaSubscript />
            </button>
            <button
              className={`ribbon-button ${(editor && editor.isActive('superscript')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleSuperscript().run()}
              title="Superscript"
            >
              <FaSuperscript />
            </button>
          </div>
          <div className="ribbon-row">
            <div className="relative" ref={colorMenuRef}>
              <button
                className="ribbon-button"
                onClick={() => setShowColorMenu(!showColorMenu)}
                title="Text Color"
              >
                <FaPalette />
              </button>
              {showColorMenu && (
                <div className="color-picker-dropdown">
                  <div className="color-picker-grid">
                    {colors.map(color => (
                      <button
                        key={color}
                        className="color-picker-item"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          editor.chain().focus().setColor(color).run();
                          setShowColorMenu(false);
                        }}
                      />
                    ))}
                  </div>
                  <div className="color-picker-manual" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      title="Pick any color"
                      style={{ width: 36, height: 28, border: '1px solid #d1d5db', borderRadius: 4, padding: 0 }}
                    />
                    <input
                      type="text"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      placeholder="#000000"
                      className="ribbon-select"
                      style={{ minWidth: 100, height: 32 }}
                    />
                    <button
                      className="ribbon-button"
                      onClick={() => {
                        if (!customTextColor) return;
                        editor.chain().focus().setColor(customTextColor).run();
                        setShowColorMenu(false);
                      }}
                      title="Apply custom color"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={highlightMenuRef}>
              <button
                className={`ribbon-button ${editor.isActive('highlight') ? 'active' : ''}`}
                onClick={() => setShowHighlightMenu(!showHighlightMenu)}
                title="Highlight Color"
              >
                <FaHighlighter />
              </button>
              {showHighlightMenu && (
                <div className="color-picker-dropdown">
                  <div className="color-picker-grid">
                    {colors.map(color => (
                      <button
                        key={color}
                        className="color-picker-item"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          editor.chain().focus().setHighlight({ color }).run();
                          setShowHighlightMenu(false);
                        }}
                      />
                    ))}
                  </div>
                  <div className="color-picker-manual" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customHighlightColor}
                      onChange={(e) => setCustomHighlightColor(e.target.value)}
                      title="Pick any highlight color"
                      style={{ width: 36, height: 28, border: '1px solid #d1d5db', borderRadius: 4, padding: 0 }}
                    />
                    <input
                      type="text"
                      value={customHighlightColor}
                      onChange={(e) => setCustomHighlightColor(e.target.value)}
                      placeholder="#ffff00"
                      className="ribbon-select"
                      style={{ minWidth: 100, height: 32 }}
                    />
                    <button
                      className="ribbon-button"
                      onClick={() => {
                        if (!customHighlightColor) return;
                        editor.chain().focus().setHighlight({ color: customHighlightColor }).run();
                        setShowHighlightMenu(false);
                      }}
                      title="Apply custom highlight"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paragraph Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Paragraph</div>
        <div className="ribbon-group-content">
          <div className="ribbon-row">
            <button
              className={`ribbon-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setAlignment('left').run()}
              title="Align Left"
            >
              <FaAlignLeft />
            </button>
            <button
              className={`ribbon-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setAlignment('center').run()}
              title="Center"
            >
              <FaAlignCenter />
            </button>
            <button
              className={`ribbon-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setAlignment('right').run()}
              title="Align Right"
            >
              <FaAlignRight />
            </button>
            <button
              className={`ribbon-button ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setAlignment('justify').run()}
              title="Justify"
            >
              <FaAlignJustify />
            </button>
          </div>
          <div className="ribbon-row">
            <button
              className={`ribbon-button ${(editor && editor.isActive('bulletList')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleBulletList().run()}
              disabled={!editor || !editor.can().chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <FaListUl />
            </button>
            <button
              className={`ribbon-button ${(editor && editor.isActive('orderedList')) ? 'active' : ''}`}
              onClick={() => editor && editor.chain().focus().toggleOrderedList().run()}
              disabled={!editor || !editor.can().chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <FaListOl />
            </button>
            {/* Advanced bullet styles */}
            <select
              className="ribbon-select"
              title="Bullet Style"
              onChange={(e) => {
                if (!editor) return;
                const type = e.target.value;
                if (!editor.isActive('bulletList')) {
                  editor.chain().focus().toggleBulletList().run();
                }
                editor.chain().focus().setBulletListStyleType(type).run();
              }}
              defaultValue="disc"
            >
              <option value="disc">• Disc</option>
              <option value="circle">○ Circle</option>
              <option value="square">■ Square</option>
            </select>

            {/* Advanced number styles */}
            <select
              className="ribbon-select"
              title="Number Style"
              onChange={(e) => {
                if (!editor) return;
                const type = e.target.value;
                if (!editor.isActive('orderedList')) {
                  editor.chain().focus().toggleOrderedList().run();
                }
                editor.chain().focus().setOrderedListStyleType(type).run();
              }}
              defaultValue="decimal"
            >
              <option value="decimal">1, 2, 3</option>
              <option value="lower-alpha">a, b, c</option>
              <option value="upper-alpha">A, B, C</option>
              <option value="lower-roman">i, ii, iii</option>
              <option value="upper-roman">I, II, III</option>
            </select>
          </div>
          <div className="ribbon-row">
            <button
              className="ribbon-button"
              onClick={() => editor && editor.chain().focus().sinkListItem('listItem').run()}
              disabled={!editor || !editor.can().chain().focus().sinkListItem('listItem').run()}
              title="Increase Indent"
            >
              ➜
            </button>
            <button
              className="ribbon-button"
              onClick={() => editor && editor.chain().focus().liftListItem('listItem').run()}
              disabled={!editor || !editor.can().chain().focus().liftListItem('listItem').run()}
              title="Decrease Indent"
            >
              ⇠
            </button>
          </div>
        </div>
      </div>

      {/* Styles Group */}
      <div className="ribbon-group ribbon-group--styles">
        <div className="ribbon-group-label">Styles</div>
        <div className="ribbon-group-content">
          <div className="style-tiles">
            <button
              className={`style-tile ${editor?.isActive('paragraph') ? 'active' : ''}`}
              title="Normal"
              onClick={() => {
                if (!editor) return;
                let chain = editor.chain().focus().setParagraph();
                if (editor.commands.setLineHeight) {
                  chain = chain.setLineHeight('1.15');
                }
                chain.run();
              }}
            >
              <div className="style-tile-title">Normal</div>
              <div className="style-tile-preview">This is example text.</div>
            </button>

            {/* Title */}
            <button
              className="style-tile"
              title="Title"
              onClick={() => {
                if (!editor) return;
                // Do NOT change node type; only apply formatting to avoid content loss
                let c = editor.chain().focus();
                if (editor.commands.setFontFamily) c = c.setFontFamily('Cambria');
                if (editor.commands.setFontSize) c = c.setFontSize('26pt');
                c = c.setBold().setAlignment('center');
                if (editor.commands.setLineHeight) c = c.setLineHeight('1');
                c.run();
              }}
            >
              <div className="style-tile-title">Title</div>
              <div className="style-tile-preview style-title">This is example text.</div>
            </button>

            {/* Subtitle */}
            <button
              className="style-tile"
              title="Subtitle"
              onClick={() => {
                if (!editor) return;
                let c = editor.chain().focus();
                // Keep text intact; only apply marks/attrs
                // If current block is a heading, convert to paragraph to match Subtitle semantics
                if (editor.isActive('heading')) c = c.setParagraph();
                // Cambria, 12pt, italic, gray, centered, single spacing
                if (editor.commands.setFontFamily) c = c.setFontFamily('Cambria');
                if (editor.commands.setFontSize) c = c.setFontSize('12pt');
                // Ensure italic (do not toggle off if already italic)
                if (!editor.isActive('italic')) c = c.toggleItalic();
                // Apply gray color and centered alignment
                c = c.setColor('#6b7280').setAlignment('center');
                if (editor.commands.setLineHeight) c = c.setLineHeight('1');
                c.run();
              }}
            >
              <div className="style-tile-title">Subtitle</div>
              <div className="style-tile-preview style-subtitle">This is example text.</div>
            </button>

            <button
              className={`style-tile ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              title="Heading 1"
              onClick={() => {
                if (!editor) return;
                let chain = editor.chain().focus().setHeading({ level: 1 });
                if (editor.commands.setLineHeight) {
                  chain = chain.setLineHeight('1.15');
                }
                chain.run();
              }}
            >
              <div className="style-tile-title">Heading 1</div>
              <div className="style-tile-preview style-h1">This is example text.</div>
            </button>

            <button
              className={`style-tile ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              title="Heading 2"
              onClick={() => {
                if (!editor) return;
                let chain = editor.chain().focus().setHeading({ level: 2 });
                if (editor.commands.setLineHeight) {
                  chain = chain.setLineHeight('1.15');
                }
                chain.run();
              }}
            >
              <div className="style-tile-title">Heading 2</div>
              <div className="style-tile-preview style-h2">This is example text.</div>
            </button>

            {/* Heading 3 */}
            <button
              className={`style-tile ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`}
              title="Heading 3"
              onClick={() => {
                if (!editor) return;
                let chain = editor.chain().focus().setHeading({ level: 3 });
                if (editor.commands.setLineHeight) {
                  chain = chain.setLineHeight('1.15');
                }
                chain.run();
              }}
            >
              <div className="style-tile-title">Heading 3</div>
              <div className="style-tile-preview style-h3">This is example text.</div>
            </button>

            {/* List Paragraph */}
            <button
              className="style-tile"
              title="List Paragraph"
              onClick={() => {
                if (!editor) return;
                // Safety: only apply formatting to avoid any content changes
                let c = editor.chain().focus();
                if (editor.commands.setFontFamily) c = c.setFontFamily('Calibri');
                if (editor.commands.setFontSize) c = c.setFontSize('11pt');
                // Ensure regular weight/style and black color, left align, 1.08 line spacing
                if (editor.isActive('bold')) c = c.toggleBold();
                if (editor.isActive('italic')) c = c.toggleItalic();
                c = c.setColor('#000000').setAlignment('left');
                if (editor.commands.setLineHeight) c = c.setLineHeight('1.08');
                c.run();
              }}
            >
              <div className="style-tile-title">List Paragraph</div>
              <div className="style-tile-preview style-listparagraph">• Example list item</div>
            </button>
          </div>
        </div>
      </div>

      {/* Editing Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Editing</div>
        <div className="ribbon-group-content">
          <div className="ribbon-row">
            <button
              className="ribbon-button"
              onClick={() => setShowFindReplace(true)}
              title="Find"
            >
              <FaSearch />
            </button>
            <button
              className="ribbon-button"
              onClick={() => setShowFindReplace(true)}
              title="Replace"
            >
              <FaEdit />
            </button>
            {/* Spell Check button removed: right-click suggestions are now inline */}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="ribbon-content">
      {/* Pages Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Pages</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button-large" onClick={insertCoverPage} title="Cover Page">
            <RiPagesLine className="ribbon-icon" />
            <span>Cover Page</span>
          </button>
          <button className="ribbon-button-large" onClick={insertBlankPage} title="Blank Page">
            <RiPageSeparator className="ribbon-icon" />
            <span>Blank Page</span>
          </button>
          <button className="ribbon-button-large" onClick={insertPageBreak} title="Page Break">
            <MdOutlineInsertPageBreak className="ribbon-icon" />
            <span>Page Break</span>
          </button>
        </div>
      </div>

      {/* Tables Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Tables</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button-large" onClick={addTable} title="Table">
            <FaTable className="ribbon-icon" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Illustrations Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Illustrations</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" onClick={addImage} title="Pictures">
            <FaImage />
          </button>
          <div className="relative">
          <button className="ribbon-button" onClick={addShapes} title="Shapes">
            <FaShapes />
          </button>
          {showShapePalette && (
            <div className="absolute left-0 top-8 z-50">
              <ShapeQuickPalette editor={editor} onClose={() => setShowShapePalette(false)} />
            </div>
          )}
          </div>
          <button className="ribbon-button" title="Icons">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="3D Models">
            <FaSquare />
          </button>
        </div>
      </div>

      {/* Links Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Links</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" onClick={addLink} title="Link">
            <FaLink />
          </button>
        </div>
      </div>

      {/* Header & Footer Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Header & Footer</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Header">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Footer">
            <FaFileAlt />
          </button>
        </div>
      </div>

      {/* Text Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Text</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Text Box">
            <FaFileText />
          </button>
          <button className="ribbon-button" title="Date & Time">
            <FaClock />
          </button>
          <button className="ribbon-button" title="Comments">
            <FaComment />
          </button>
          
        </div>
      </div>

      {/* Symbols Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Symbols</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Equation">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Symbol">
            <FaSquare />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDrawTab = () => (
    <div className="ribbon-content">
      {/* Tools Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Tools</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Pen">
            <FaPen />
          </button>
          <button className="ribbon-button" title="Pencil">
            <FaPen />
          </button>
          <button className="ribbon-button" title="Highlighter">
            <FaHighlighter />
          </button>
          <button className="ribbon-button" title="Eraser">
            <FaEraser />
          </button>
        </div>
      </div>

      {/* Pens Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Pens</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Pen">
            <FaPen />
          </button>
          <button className="ribbon-button" title="Pencil">
            <FaPen />
          </button>
          <button className="ribbon-button" title="Highlighter">
            <FaHighlighter />
          </button>
        </div>
      </div>

      {/* Convert Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Convert</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Ink to Text">
            <FaPen />
          </button>
          <button className="ribbon-button" title="Ink to Shape">
            <FaShapes />
          </button>
          <button className="ribbon-button" title="Ink to Math">
            <FaSquare />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="ribbon-content">
      {/* Document Formatting Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Document Formatting</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Themes">
            <FaPaintBrush />
          </button>
          <button className="ribbon-button" title="Colors">
            <FaPalette />
          </button>
          <div className="relative" ref={fontSetMenuRef}>
            <button 
              className="ribbon-button" 
              title="Fonts"
              onClick={() => setShowFontSetPicker(!showFontSetPicker)}
            >
              <FaFont />
            </button>
            {showFontSetPicker && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 w-64" style={{ left: 0, top: '100%' }}>
                <div className="text-xs font-semibold mb-2">Font Sets</div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {Object.keys(fontSets).map(fontSet => (
                    <button
                      key={fontSet}
                      onClick={() => {
                        setCurrentFontSet(fontSet);
                        applyFontSet(fontSet);
                        setShowFontSetPicker(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${currentFontSet === fontSet ? 'bg-blue-100' : ''}`}
                    >
                      {fontSet}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={paragraphSpacingMenuRef}>
            <button 
              className="ribbon-button" 
              title="Paragraph Spacing"
              onClick={() => setShowParagraphSpacingPicker(!showParagraphSpacingPicker)}
            >
              <FaEdit />
            </button>
            {showParagraphSpacingPicker && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 w-64" style={{ left: 0, top: '100%' }}>
                <div className="text-xs font-semibold mb-2">Paragraph Spacing</div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {paragraphSpacingOptions.map(spacing => (
                    <button
                      key={spacing.name}
                      onClick={() => {
                        setParagraphSpacing(spacing.name);
                        applyParagraphSpacing(spacing.name);
                        setShowParagraphSpacingPicker(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${paragraphSpacing === spacing.name ? 'bg-blue-100' : ''}`}
                    >
                      {spacing.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="ribbon-button" title="Effects">
            <FaPaintBrush />
          </button>
          <button className="ribbon-button" title="Set as Default">
            <FaSave />
          </button>
        </div>
      </div>

      {/* Page Background Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Page Background</div>
        <div className="ribbon-group-content">
          <div className="relative" ref={pageColorMenuRef}>
            <button 
              className="ribbon-button" 
              title="Page Color"
              onClick={() => setShowPageColor(!showPageColor)}
            >
              <FaPalette />
            </button>
            {showPageColor && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg p-4 w-64" style={{ left: 0, top: '100%' }}>
                <h3 className="text-sm font-semibold mb-3">Page Color</h3>
                <div className="space-y-3">
                  <div>
                    <div className="grid grid-cols-8 gap-2 mb-3">
                      {['#FFFFFF', '#F2F2F2', '#E7E6E6', '#D0CECE', '#AFABAB', '#757575', '#3A3838', '#000000', 
                        '#C0504D', '#F79646', '#FFC000', '#9BBB59', '#4BACC6', '#1F497D', '#8064A2', '#7030A0'].map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setPageBackgroundColor(color);
                            applyPageColor(color);
                            setShowPageColor(false);
                          }}
                          className={`w-8 h-8 border border-gray-300 rounded hover:scale-110 transition-transform ${pageBackgroundColor === color ? 'ring-2 ring-blue-500' : ''}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        ></button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">More Colors</label>
                    <input
                      type="color"
                      value={pageBackgroundColor}
                      onChange={(e) => {
                        setPageBackgroundColor(e.target.value);
                        applyPageColor(e.target.value);
                      }}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setPageBackgroundColor('#FFFFFF');
                        applyPageColor('#FFFFFF');
                        setShowPageColor(false);
                      }}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      No Color
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={pageBordersMenuRef}>
            <button 
              className="ribbon-button" 
              title="Page Borders"
              onClick={() => setShowPageBorders(!showPageBorders)}
            >
              <FaSquare />
            </button>
            {showPageBorders && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg p-4 w-80" style={{ left: 0, top: '100%' }}>
                <h3 className="text-sm font-semibold mb-3">Borders and Shading</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-2">Setting</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['None', 'Box', 'Shadow', '3-D'].map(setting => (
                        <button
                          key={setting}
                          onClick={() => {
                            setPageBorderStyle(setting);
                            applyPageBorders(setting, '#000000', '1pt', 'solid');
                            setShowPageBorders(false);
                          }}
                          className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 ${pageBorderStyle === setting ? 'bg-blue-100 border-blue-500' : ''}`}
                        >
                          {setting}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Color</label>
                    <input
                      type="color"
                      defaultValue="#000000"
                      className="w-full h-8 border border-gray-300 rounded"
                      onChange={(e) => {
                        applyPageBorders(pageBorderStyle === 'None' ? 'Box' : pageBorderStyle, e.target.value, '1pt', 'solid');
                        if (pageBorderStyle === 'None') setPageBorderStyle('Box');
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Width</label>
                    <select 
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      defaultValue="1pt"
                      onChange={(e) => {
                        applyPageBorders(pageBorderStyle === 'None' ? 'Box' : pageBorderStyle, '#000000', e.target.value, 'solid');
                        if (pageBorderStyle === 'None') setPageBorderStyle('Box');
                      }}
                    >
                      <option value="0.5pt">½ pt</option>
                      <option value="1pt">1 pt</option>
                      <option value="1.5pt">1½ pt</option>
                      <option value="2.25pt">2¼ pt</option>
                      <option value="3pt">3 pt</option>
                      <option value="4.5pt">4½ pt</option>
                      <option value="6pt">6 pt</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="ribbon-content">
      {/* Page Setup Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Page Setup</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Margins">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Orientation">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Size">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Columns">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Breaks">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Line Numbers">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Hyphenation">
            <FaEdit />
          </button>
        </div>
      </div>

      {/* Paragraph Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Paragraph</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Indent Left">
            <FaAlignLeft />
          </button>
          <button className="ribbon-button" title="Indent Right">
            <FaAlignRight />
          </button>
          <button className="ribbon-button" title="Spacing Before">
            <FaChevronUp />
          </button>
          <button className="ribbon-button" title="Spacing After">
            <FaChevronDown />
          </button>
        </div>
      </div>

      {/* Arrange Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Arrange</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Position">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Wrap Text">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Bring Forward">
            <FaChevronUp />
          </button>
          <button className="ribbon-button" title="Send Backward">
            <FaChevronDown />
          </button>
          <button className="ribbon-button" title="Selection Pane">
            <FaEye />
          </button>
          <button className="ribbon-button" title="Align">
            <FaAlignLeft />
          </button>
          <button className="ribbon-button" title="Group">
            <FaLayerGroup />
          </button>
          <button className="ribbon-button" title="Rotate">
            <FaSquare />
          </button>
        </div>
      </div>
    </div>
  );

  const renderReferencesTab = () => (
    <div className="ribbon-content">
      {/* Table of Contents Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Table of Contents</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Table of Contents">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Add Text">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Update Table">
            <FaEdit />
          </button>
        </div>
      </div>

      {/* Footnotes Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Footnotes</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Insert Footnote">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Insert Endnote">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Next Footnote">
            <FaChevronDown />
          </button>
          <button className="ribbon-button" title="Show Notes">
            <FaEye />
          </button>
        </div>
      </div>

      {/* Citations & Bibliography Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Citations & Bibliography</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Insert Citation">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Manage Sources">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Style">
            <FaFont />
          </button>
          <button className="ribbon-button" title="Bibliography">
            <FaFileAlt />
          </button>
        </div>
      </div>

      {/* Captions Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Captions</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Insert Caption">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Insert Table of Figures">
            <FaTable />
          </button>
          <button className="ribbon-button" title="Update Table">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Cross-reference">
            <FaLink />
          </button>
        </div>
      </div>

      {/* Index Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Index</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Mark Entry">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Insert Index">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Update Index">
            <FaEdit />
          </button>
        </div>
      </div>
    </div>
  );

  const renderMailingsTab = () => (
    <div className="ribbon-content">
      {/* Create Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Create</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Envelopes">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Labels">
            <FaFileAlt />
          </button>
        </div>
      </div>

      {/* Start Mail Merge Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Start Mail Merge</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Start Mail Merge">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Select Recipients">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Edit Recipient List">
            <FaEdit />
          </button>
        </div>
      </div>

      {/* Write & Insert Fields Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Write & Insert Fields</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Highlight Merge Fields">
            <FaHighlighter />
          </button>
          <button className="ribbon-button" title="Address Block">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Greeting Line">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Insert Merge Field">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Rules">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Match Fields">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Update Labels">
            <FaEdit />
          </button>
        </div>
      </div>

      {/* Preview Results Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Preview Results</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Preview Results">
            <FaEye />
          </button>
          <button className="ribbon-button" title="Previous Record">
            <FaChevronLeft />
          </button>
          <button className="ribbon-button" title="Next Record">
            <FaChevronRight />
          </button>
          <button className="ribbon-button" title="Find Recipient">
            <FaSearch />
          </button>
          <button className="ribbon-button" title="Auto Check for Errors">
            <FaSpellCheck />
          </button>
        </div>
      </div>

      {/* Finish Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Finish</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Finish & Merge">
            <FaFileAlt />
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewTab = () => (
    <div className="ribbon-content">
      {/* Proofing Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Proofing</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Spelling & Grammar">
            <FaSpellCheck />
          </button>
          <button className="ribbon-button" title="Thesaurus">
            <FaBook />
          </button>
          <button className="ribbon-button" title="Research">
            <FaSearch />
          </button>
          <button className="ribbon-button" title="Translate">
            <FaLanguage />
          </button>
          <button className="ribbon-button" title="Language">
            <FaGlobe />
          </button>
        </div>
      </div>

      {/* Speech Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Speech</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Dictate">
            <FaMicrophone />
          </button>
          <button className="ribbon-button" title="Read Aloud">
            <FaVolumeUp />
          </button>
        </div>
      </div>

      {/* Accessibility Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Accessibility</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Check Accessibility">
            <FaEye />
          </button>
          <button className="ribbon-button" title="Smart Lookup">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Comments Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Comments</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="New Comment">
            <FaComments />
          </button>
          <button className="ribbon-button" title="Delete">
            <FaTrash />
          </button>
          <button className="ribbon-button" title="Previous">
            <FaChevronUp />
          </button>
          <button className="ribbon-button" title="Next">
            <FaChevronDown />
          </button>
        </div>
      </div>

      {/* Tracking Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Tracking</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Track Changes">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Accept">
            <FaCheck />
          </button>
          <button className="ribbon-button" title="Reject">
            <FaTimes />
          </button>
          <button className="ribbon-button" title="Previous">
            <FaChevronUp />
          </button>
          <button className="ribbon-button" title="Next">
            <FaChevronDown />
          </button>
          <button className="ribbon-button" title="Show Markup">
            <FaEye />
          </button>
        </div>
      </div>

      {/* Changes Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Changes</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Accept">
            <FaCheck />
          </button>
          <button className="ribbon-button" title="Reject">
            <FaTimes />
          </button>
          <button className="ribbon-button" title="Previous">
            <FaChevronUp />
          </button>
          <button className="ribbon-button" title="Next">
            <FaChevronDown />
          </button>
        </div>
      </div>

      {/* Compare Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Compare</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Compare">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Combine">
            <FaFileAlt />
          </button>
        </div>
      </div>

      {/* Protect Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Protect</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Restrict Editing">
            <FaLock />
          </button>
        </div>
      </div>
    </div>
  );

  const renderViewTab = () => (
    <div className="ribbon-content">
      {/* Views Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Views</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Read Mode">
            <FaEye />
          </button>
          <button className="ribbon-button" title="Print Layout">
            <FaPrint />
          </button>
          <button className="ribbon-button" title="Web Layout">
            <FaGlobe />
          </button>
        </div>
      </div>

      {/* Immersive Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Immersive</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Immersive Reader">
            <FaEye />
          </button>
          <button className="ribbon-button" title="Focus">
            <FaEye />
          </button>
        </div>
      </div>

      {/* Read Aloud Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Read Aloud</div>
        <div className="ribbon-group-content">
          <button 
            className="ribbon-button" 
            title="Read Aloud"
            onClick={() => onOpenReadAloud && onOpenReadAloud()}
          >
            <FaVolumeUp />
          </button>
        </div>
      </div>

      {/* Page Movement Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Page Movement</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Vertical">
            <FaChevronUp />
          </button>
          <button className="ribbon-button" title="Side to Side">
            <FaChevronLeft />
          </button>
        </div>
      </div>

      {/* Show Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Show</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Ruler">
            <FaRuler />
          </button>
          <button className="ribbon-button" title="Gridlines">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Navigation Pane">
            <FaEye />
          </button>
        </div>
      </div>

      {/* Zoom Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Zoom</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="Zoom">
            <FaSearch />
          </button>
          <button className="ribbon-button" title="100%">
            <span>100%</span>
          </button>
          <button className="ribbon-button" title="One Page">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Multiple Pages">
            <FaFileAlt />
          </button>
          <button className="ribbon-button" title="Page Width">
            <FaSquare />
          </button>
        </div>
      </div>

      {/* Window Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Window</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="New Window">
            <FaPlus />
          </button>
          <button className="ribbon-button" title="Arrange All">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Split">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="View Side by Side">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Synchronous Scrolling">
            <FaChevronDown />
          </button>
          <button className="ribbon-button" title="Reset Window Position">
            <FaSquare />
          </button>
          <button className="ribbon-button" title="Switch Windows">
            <FaSquare />
          </button>
        </div>
      </div>

      {/* Macros Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-label">Macros</div>
        <div className="ribbon-group-content">
          <button className="ribbon-button" title="View Macros">
            <FaEdit />
          </button>
          <button className="ribbon-button" title="Record Macro">
            <FaCircle />
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    if (!editor) return null;
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'insert':
        return renderInsertTab();
      case 'draw':
        return renderDrawTab();
      case 'design':
        return renderDesignTab();
      case 'layout':
        return renderLayoutTab();
      case 'references':
        return renderReferencesTab();
      case 'mailings':
        return renderMailingsTab();
      case 'review':
        return renderReviewTab();
      case 'view':
        return renderViewTab();
      default:
        return renderHomeTab();
    }
  };

  return (
    <div className="ribbon-toolbar ribbon--side">
      {/* Side Tab Navigation */}
      <div className="ribbon-tabs ribbon-tabs--side">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`ribbon-tab ribbon-tab--side ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent className="ribbon-tab-icon ribbon-tab-icon--side" />
              <span className="ribbon-tab-label ribbon-tab-label--side">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tools Panel */}
      <div className="ribbon-content-container ribbon-content--side">
        {renderActiveTab()}
      </div>

      {/* Modals */}
      <TableManager 
        editor={editor} 
        isOpen={showTableManager} 
        onClose={() => setShowTableManager(false)} 
      />

      <ImageManager 
        editor={editor} 
        isOpen={showImageManager} 
        onClose={() => setShowImageManager(false)} 
      />

      <DateTime 
        editor={editor} 
        isOpen={showDateTime} 
        onClose={() => setShowDateTime(false)} 
      />

      <Shapes 
        editor={editor} 
        isOpen={showShapes} 
        onClose={() => setShowShapes(false)} 
      />

      <FindReplace 
        editor={editor} 
        isOpen={showFindReplace} 
        onClose={() => setShowFindReplace(false)} 
      />

      <SpellCheck 
        editor={editor} 
        isOpen={showSpellCheck} 
        onClose={() => setShowSpellCheck(false)} 
      />
    </div>
  );
};

export default RibbonToolbar;
