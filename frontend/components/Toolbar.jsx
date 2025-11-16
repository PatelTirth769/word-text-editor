'use client';

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
  FaSquare
} from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import TableManager from './TableManager';
import ImageManager from './ImageManager';
import DateTime from './DateTime';
import Shapes from './Shapes';

const Toolbar = ({ editor }) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showTableManager, setShowTableManager] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showDateTime, setShowDateTime] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const colorMenuRef = useRef(null);
  const fontMenuRef = useRef(null);
  const highlightMenuRef = useRef(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editor]);

  if (!editor) return null;

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
    'Comic Sans MS'
  ];
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808080',
    '#C0C0C0', '#800080', '#008080', '#FFA500'
  ];

  const addImage = () => {
    setShowImageManager(true);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    setShowTableManager(true);
  };

  const addDateTime = () => {
    setShowDateTime(true);
  };

  const insertHorizontalLine = () => {
    if (!editor) return;
    // Insert a full-width horizontal rule
    editor.chain().focus().setHorizontalRule().run();
  };


  const addShapes = () => {
    setShowShapes(true);
  };

  return (
    <div className="toolbar">
      {/* Clipboard Group */}
      <div className="toolbar-group" data-label="Clipboard">
        <button
          className="toolbar-button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <FaUndo />
        </button>
        <button
          className="toolbar-button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>

      {/* Font Group */}
      <div className="toolbar-group" data-label="Font">
        <div className="relative" ref={fontMenuRef}>
          <button
            className="toolbar-button"
            onClick={() => setShowFontMenu(!showFontMenu)}
            title="Font Family"
          >
            <FaFont />
          </button>
          {showFontMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-32">
              {fontFamilies.map(font => (
                <button
                  key={font}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                  style={{ fontFamily: font }}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font).run();
                    setShowFontMenu(false);
                  }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          className="toolbar-select"
          defaultValue="11"
          onChange={(e) => {
            const fontSize = e.target.value + 'pt';
            editor.chain().focus().setFontSize(fontSize).run();
          }}
          title="Font Size"
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().toggleBold()}
          className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold"
        >
          <FaBold />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().toggleItalic()}
          className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        >
          <FaItalic />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline"
        >
          <FaUnderline />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().toggleStrike()}
          className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strikethrough"
        >
          <FaStrikethrough />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`toolbar-button ${editor.isActive('subscript') ? 'active' : ''}`}
          title="Subscript"
        >
          <FaSubscript />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`toolbar-button ${editor.isActive('superscript') ? 'active' : ''}`}
          title="Superscript"
        >
          <FaSuperscript />
        </button>
      </div>

      {/* Color Group */}
      <div className="toolbar-group" data-label="Colors">
        <div className="relative" ref={colorMenuRef}>
          <button
            className="toolbar-button"
            onClick={() => setShowColorMenu(!showColorMenu)}
            title="Text Color"
          >
            <FaPalette />
          </button>
          {showColorMenu && (
            <div className="color-picker-dropdown">
              <div className="mb-2 text-sm font-medium text-gray-700">Text Color</div>
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
                    title={color}
                  />
                ))}
              </div>
              <div className="color-picker-custom">
                <input
                  type="color"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                    setShowColorMenu(false);
                  }}
                  title="Custom Color"
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={highlightMenuRef}>
          <button
            className={`toolbar-button ${editor.isActive('highlight') ? 'active' : ''}`}
            onClick={() => setShowHighlightMenu(!showHighlightMenu)}
            title="Highlight Color"
          >
            <FaHighlighter />
          </button>
          {showHighlightMenu && (
            <div className="color-picker-dropdown">
              <div className="mb-2 text-sm font-medium text-gray-700">Highlight Color</div>
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
                    title={color}
                  />
                ))}
              </div>
              <div className="color-picker-custom">
                <input
                  type="color"
                  onChange={(e) => {
                    editor.chain().focus().setHighlight({ color: e.target.value }).run();
                    setShowHighlightMenu(false);
                  }}
                  title="Custom Highlight Color"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paragraph Group */}
      <div className="toolbar-group" data-label="Paragraph">
        <button
          className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          onClick={() => {
            // Apply alignment to all selected content including images and shapes
            const { selection } = editor.state;
            const { from, to } = selection;
            
            // Apply to text content
            editor.chain().focus().setAlignment('left').run();
            
            // Apply to images and shapes in selection
            editor.state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'image') {
                const tr = editor.state.tr;
                const attrs = { ...node.attrs };
                attrs.style = (attrs.style || '') + '; text-align: left; display: inline-block; float: left; margin-right: 1em;';
                tr.setNodeMarkup(pos, null, attrs);
                editor.view.dispatch(tr);
              }
            });
          }}
          title="Align Left"
        >
          <FaAlignLeft />
        </button>

        <button
          className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          onClick={() => {
            // Apply alignment to all selected content including images and shapes
            const { selection } = editor.state;
            const { from, to } = selection;
            
            // Apply to text content
            editor.chain().focus().setAlignment('center').run();
            
            // Apply to images and shapes in selection
            editor.state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'image') {
                const tr = editor.state.tr;
                const attrs = { ...node.attrs };
                attrs.style = (attrs.style || '') + '; text-align: center; display: block; margin: 0 auto; float: none;';
                tr.setNodeMarkup(pos, null, attrs);
                editor.view.dispatch(tr);
              }
            });
          }}
          title="Center"
        >
          <FaAlignCenter />
        </button>

        <button
          className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          onClick={() => {
            // Apply alignment to all selected content including images and shapes
            const { selection } = editor.state;
            const { from, to } = selection;
            
            // Apply to text content
            editor.chain().focus().setAlignment('right').run();
            
            // Apply to images and shapes in selection
            editor.state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'image') {
                const tr = editor.state.tr;
                const attrs = { ...node.attrs };
                attrs.style = (attrs.style || '') + '; text-align: right; display: inline-block; float: right; margin-left: 1em;';
                tr.setNodeMarkup(pos, null, attrs);
                editor.view.dispatch(tr);
              }
            });
          }}
          title="Align Right"
        >
          <FaAlignRight />
        </button>

        <button
          className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
          onClick={() => {
            // Apply alignment to all selected content including images and shapes
            const { selection } = editor.state;
            const { from, to } = selection;
            
            // Apply to text content
            editor.chain().focus().setAlignment('justify').run();
            
            // Apply to images and shapes in selection
            editor.state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'image') {
                const tr = editor.state.tr;
                const attrs = { ...node.attrs };
                attrs.style = (attrs.style || '') + '; text-align: justify; width: 100%; display: block; margin: 1em 0; float: none;';
                tr.setNodeMarkup(pos, null, attrs);
                editor.view.dispatch(tr);
              }
            });
          }}
          title="Justify"
        >
          <FaAlignJustify />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          <FaListUl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Numbered List"
        >
          <FaListOl />
        </button>
      </div>

      {/* Home: Font Size +/- and Clear Formatting */}
      <div className="toolbar-group" data-label="Format">
        <button
          className="toolbar-button"
          onClick={() => {
            const current = parseFloat((editor.getAttributes('textStyle')?.fontSize || '11pt').replace('pt', ''));
            const next = current + 1;
            editor.chain().focus().setFontSize(next + 'pt').run();
          }}
          title="Increase Font Size"
        >
          A+
        </button>
        <button
          className="toolbar-button"
          onClick={() => {
            const current = parseFloat((editor.getAttributes('textStyle')?.fontSize || '11pt').replace('pt', ''));
            const next = Math.max(1, current - 1);
            editor.chain().focus().setFontSize(next + 'pt').run();
          }}
          title="Decrease Font Size"
        >
          A-
        </button>
        <button
          className="toolbar-button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear All Formatting"
        >
          CLR
        </button>
      </div>

      {/* Home: Indent/Outdent */}
      <div className="toolbar-group" data-label="Indent">
        <button
          className="toolbar-button"
          onClick={() => {
            const didSink = editor.chain().focus().sinkListItem('listItem').run();
            if (!didSink) {
              // Not in a list: wrap in blockquote as an indent surrogate
              editor.chain().focus().wrapIn('blockquote').run();
            }
          }}
          title="Increase Indent"
        >
          ➜
        </button>
        <button
          className="toolbar-button"
          onClick={() => {
            const didLift = editor.chain().focus().liftListItem('listItem').run();
            if (!didLift) {
              // Not in a list: try to outdent by lifting out of blockquote
              if (!editor.chain().focus().lift().run()) {
                editor.chain().focus().toggleBlockquote().run();
              }
            }
          }}
          title="Decrease Indent"
        >
          ⇠
        </button>
      </div>

      {/* Home: Line Spacing */}
      <div className="toolbar-group" data-label="Spacing">
        <select
          className="toolbar-select"
          defaultValue="1.15"
          onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
          title="Line Spacing"
        >
          {lineHeights.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Insert Group */}
      <div className="toolbar-group" data-label="Insert">
        <button
          className="toolbar-button"
          onClick={addTable}
          title="Insert Table"
        >
          <FaTable />
        </button>

        <button
          className="toolbar-button"
          onClick={addImage}
          title="Insert Image"
        >
          <FaImage />
        </button>

        <button
          className="toolbar-button"
          onClick={addLink}
          title="Insert Link"
        >
          <FaLink />
        </button>
      </div>

      {/* Page Tools */}
      <div className="toolbar-group" data-label="Page">
        <button
          className="toolbar-button"
          onClick={insertHorizontalLine}
          title="Insert Horizontal Line"
        >
          <FaFileAlt />
        </button>
      </div>


      {/* Date/Time Group */}
      <div className="toolbar-group" data-label="DateTime">
        <button
          className="toolbar-button"
          onClick={addDateTime}
          title="Insert Date/Time"
        >
          <FaCalendarAlt />
        </button>
      </div>


      {/* Shapes Group */}
      <div className="toolbar-group" data-label="Shapes">
        <button
          className="toolbar-button"
          onClick={addShapes}
          title="Insert Shapes"
        >
          <FaSquare />
        </button>
      </div>

      {/* Table Manager Modal */}
      <TableManager 
        editor={editor} 
        isOpen={showTableManager} 
        onClose={() => setShowTableManager(false)} 
      />

      {/* Image Manager Modal */}
      <ImageManager 
        editor={editor} 
        isOpen={showImageManager} 
        onClose={() => setShowImageManager(false)} 
      />


      {/* Date/Time Modal */}
      <DateTime 
        editor={editor} 
        isOpen={showDateTime} 
        onClose={() => setShowDateTime(false)} 
      />


      {/* Shapes Modal */}
      <Shapes 
        editor={editor} 
        isOpen={showShapes} 
        onClose={() => setShowShapes(false)} 
      />
    </div>
  );
};

export default Toolbar;
