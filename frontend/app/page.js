'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useEditor, EditorContent } from '@tiptap/react'
import { TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { TableCellWithAttrs } from '../lib/tableCellWithAttrs'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextStyle from '@tiptap/extension-text-style'
import FontSize from '../lib/fontSizeExtension'
import FontCase from '../lib/fontCaseExtension'
import HiddenText from '../lib/hiddenTextExtension'
import Spacing from '../lib/spacingExtension'
import PageBreak from '../lib/pageBreakExtension'
import { PageBlock } from '../lib/pageBlockExtension'
import { DocumentProtection } from '../lib/documentProtectionExtension'
import { CursorBoundaryExtension } from '../lib/cursorBoundaryExtension'
import { AutoPageExtension } from '../lib/autoPageExtension'
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
  FaTextWidth,
  FaMarker,
  FaSave,
  FaFolderOpen,
  FaFileImport,
  FaSearch,
  FaSpellCheck,
  FaFilePdf,
  FaFileWord,
  FaChevronDown,
  FaClipboard,
  FaQuoteLeft,
  FaQuoteRight,
  FaParagraph,
  FaIndent,
  FaShapes,
  FaSearchPlus,
  FaSearchMinus,
  FaEdit,
  FaEye,
  FaComments,
  FaVolumeUp
} from 'react-icons/fa'
import { AiOutlineFontSize, AiOutlineBorder } from 'react-icons/ai'
import { MdOutlineFormatLineSpacing, MdOutlineInsertPageBreak } from 'react-icons/md'
import { RiPageSeparator, RiPagesLine } from 'react-icons/ri'
import { TfiWidget } from 'react-icons/tfi'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'

// Import existing components
import FindReplace from '../components/FindReplace'
import Shapes from '../components/Shapes'
import ShapeQuickPalette from '../components/ShapeQuickPalette'
import DateTime from '../components/DateTime'
import SpellCheck from '../components/SpellCheck'
import ImageManager from '../components/ImageManager'
import TableManager from '../components/TableManager'
import Ruler from '../components/Ruler'
import VerticalRuler from '../components/VerticalRuler'
import ImageResize from '../components/ImageResize'
import { ImageResize as ImageResizeExtension } from '../lib/imageResizeExtension'
import { EnhancedAlignment } from '../lib/enhancedAlignmentExtension'
import ImageWrapToolbar from '../components/ImageWrapToolbar'
import { ParagraphWithStyle, HeadingWithStyle } from '../lib/indentBlockExtension'
import TableContextMenu from '../components/TableContextMenu'
import LinkEditor from '../components/LinkEditor'
import LinkActions from '../components/LinkActions'
import CommentsPanel from '../components/CommentsPanel'
import CommentDialog from '../components/CommentDialog'
import WordCount from '../components/WordCount'
import { CommentMark } from '../lib/commentExtension'
import ReadAloud from '../components/ReadAloud'

export default function Home() {
  const [activeTab, setActiveTab] = useState('Home')
  const [wordCount, setWordCount] = useState(0)
  const [documentTitle, setDocumentTitle] = useState('Untitled Document')
  const [documentId, setDocumentId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showShapes, setShowShapes] = useState(false)
  const [showShapePalette, setShowShapePalette] = useState(false)
  const [shapesButtonRef, setShapesButtonRef] = useState(null)
  const [shapePalettePosition, setShapePalettePosition] = useState({ top: 0, left: 0 })
  const shapePaletteRef = useRef(null)
  const [showDateTime, setShowDateTime] = useState(false)
  const [showSpellCheck, setShowSpellCheck] = useState(false)
  const [showImageManager, setShowImageManager] = useState(false)
  const [showTableManager, setShowTableManager] = useState(false)
  const [showTableContextMenu, setShowTableContextMenu] = useState(false)
  const [tableContextPosition, setTableContextPosition] = useState({ x: 0, y: 0 })
  const [showImageWrapToolbar, setShowImageWrapToolbar] = useState(false)
  const [imageWrapPosition, setImageWrapPosition] = useState({ x: 0, y: 0 })
  const [textColor, setTextColor] = useState('#000000')
  const [highlightColor, setHighlightColor] = useState('#ffff00')
  const [showHiddenText, setShowHiddenText] = useState(false)
  const [showBulletOptions, setShowBulletOptions] = useState(false)
  const [showNumberOptions, setShowNumberOptions] = useState(false)
  // Home → Paragraph → Shading
  const [showShadingMenu, setShowShadingMenu] = useState(false)
  const [lastShadingColor, setLastShadingColor] = useState('#ffff00')
  const fileInputRef = useRef(null)

  // Design section state
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontSetPicker, setShowFontSetPicker] = useState(false)
  const [showParagraphSpacing, setShowParagraphSpacing] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const [showWatermark, setShowWatermark] = useState(false)
  const [showPageColor, setShowPageColor] = useState(false)
  const [showPageBorders, setShowPageBorders] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('Office')
  const [currentColorScheme, setCurrentColorScheme] = useState('Blue')
  const [currentFontSet, setCurrentFontSet] = useState('Office')
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#FFFFFF')
  const [paragraphSpacing, setParagraphSpacing] = useState('Default')
  const [currentEffect, setCurrentEffect] = useState('None')
  const [watermarkText, setWatermarkText] = useState('')
  const [pageBorderStyle, setPageBorderStyle] = useState('None')
  const [showWordCountPopup, setShowWordCountPopup] = useState(false)
  const [showReadAloud, setShowReadAloud] = useState(false)
  const [showRuler, setShowRuler] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('word-editor-zoom-level')
    return saved ? parseFloat(saved) : 100
  })
  const [showZoomDropdown, setShowZoomDropdown] = useState(false)
  const [viewMode, setViewMode] = useState('editing') // 'editing', 'reviewing', 'viewing'

  // Zoom functions
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 500)
    setZoomLevel(newZoom)
    localStorage.setItem('word-editor-zoom-level', newZoom.toString())
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 25)
    setZoomLevel(newZoom)
    localStorage.setItem('word-editor-zoom-level', newZoom.toString())
  }

  const handleZoomChange = (zoom) => {
    setZoomLevel(zoom)
    localStorage.setItem('word-editor-zoom-level', zoom.toString())
    setShowZoomDropdown(false)
  }

  const handleFitToWidth = () => {
    // Calculate fit to width zoom (approximate)
    const container = document.querySelector('.flex-1.bg-gray-100')
    if (container) {
      const containerWidth = container.clientWidth - 64 // Account for padding
      const pageWidth = 210 // A4 width in mm
      const pageWidthPx = pageWidth * 3.779527559 // Convert to pixels
      const fitZoom = Math.floor((containerWidth / pageWidthPx) * 100)
      const clampedZoom = Math.max(25, Math.min(500, fitZoom))
      handleZoomChange(clampedZoom)
    }
  }

  const handleFitToPage = () => {
    // Calculate fit to page zoom (approximate)
    const container = document.querySelector('.flex-1.bg-gray-100')
    if (container) {
      const containerWidth = container.clientWidth - 64
      const containerHeight = container.clientHeight - 64
      const pageWidth = 210 * 3.779527559
      const pageHeight = 297 * 3.779527559
      const widthZoom = (containerWidth / pageWidth) * 100
      const heightZoom = (containerHeight / pageHeight) * 100
      const fitZoom = Math.floor(Math.min(widthZoom, heightZoom))
      const clampedZoom = Math.max(25, Math.min(500, fitZoom))
      handleZoomChange(clampedZoom)
    }
  }

  // Comprehensive theme definitions (like MS Word) - includes colors, fonts, and effects
  const themeStyles = {
    'Office': { 
      colors: {
        text: '#000000',
        background: '#FFFFFF',
        accent1: '#4472C4',
        accent2: '#ED7D31',
        accent3: '#A5A5A5',
        accent4: '#FFC000',
        accent5: '#5B9BD5',
        accent6: '#70AD47',
        hyperlink: '#0563C1',
        followedLink: '#954F72'
      },
      fonts: {
        heading: 'Calibri Light, sans-serif',
        body: 'Calibri, sans-serif'
      },
      effects: {
        border: '1px solid #D0D0D0',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
    'Apex': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#31859B',
        accent2: '#E36C0A',
        accent3: '#95B3D7',
        accent4: '#B3A2C7',
        accent5: '#C0504D',
        accent6: '#9BBB59',
        hyperlink: '#1F4E79',
        followedLink: '#4BACC6'
      },
      fonts: {
        heading: 'Cambria, serif',
        body: 'Calibri, sans-serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 2px 3px rgba(0,0,0,0.15)'
      }
    },
    'Aspect': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#4BACC6',
        accent2: '#F79646',
        accent3: '#7F7F7F',
        accent4: '#A2C4C9',
        accent5: '#F4B183',
        accent6: '#C00000',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Verdana, sans-serif',
        body: 'Verdana, sans-serif'
      },
      effects: {
        border: '1px solid #BBBBBB',
        shadow: '0 1px 3px rgba(0,0,0,0.2)'
      }
    },
    'Civic': {
      colors: {
        text: '#262626',
        background: '#FFFFFF',
        accent1: '#366092',
        accent2: '#77933C',
        accent3: '#953734',
        accent4: '#604A7B',
        accent5: '#4F81BD',
        accent6: '#9BBB59',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Cambria, serif',
        body: 'Gill Sans MT, sans-serif'
      },
      effects: {
        border: '1px solid #AAAAAA',
        shadow: '0 2px 4px rgba(0,0,0,0.15)'
      }
    },
    'Concourse': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#4BACC6',
        accent2: '#F79646',
        accent3: '#7F7F7F',
        accent4: '#A2C4C9',
        accent5: '#F4B183',
        accent6: '#C00000',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Trebuchet MS, sans-serif',
        body: 'Trebuchet MS, sans-serif'
      },
      effects: {
        border: '2px solid #4BACC6',
        shadow: '0 2px 4px rgba(75, 172, 198, 0.3)'
      }
    },
    'Equity': {
      colors: {
        text: '#222222',
        background: '#FFFFFF',
        accent1: '#7F7F7F',
        accent2: '#5B9BD5',
        accent3: '#70AD47',
        accent4: '#ED7D31',
        accent5: '#4472C4',
        accent6: '#A5A5A5',
        hyperlink: '#2E75B6',
        followedLink: '#BF9000'
      },
      fonts: {
        heading: 'Century Gothic, sans-serif',
        body: 'Book Antiqua, serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
    'Flow': {
      colors: {
        text: '#222222',
        background: '#FFFFFF',
        accent1: '#C00000',
        accent2: '#FFC000',
        accent3: '#00B0F0',
        accent4: '#92D050',
        accent5: '#7030A0',
        accent6: '#ED7D31',
        hyperlink: '#0070C0',
        followedLink: '#002060'
      },
      fonts: {
        heading: 'Corbel, sans-serif',
        body: 'Corbel, sans-serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 1px 2px rgba(0,0,0,0.15)'
      }
    },
    'Foundry': {
      colors: {
        text: '#333333',
        background: '#FFFFFF',
        accent1: '#7F7F7F',
        accent2: '#5B9BD5',
        accent3: '#70AD47',
        accent4: '#ED7D31',
        accent5: '#4472C4',
        accent6: '#A5A5A5',
        hyperlink: '#0563C1',
        followedLink: '#954F72'
      },
      fonts: {
        heading: 'Franklin Gothic Medium, sans-serif',
        body: 'Calibri, sans-serif'
      },
      effects: {
        border: '1px solid #E0E0E0',
        shadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    },
    'Median': {
      colors: {
        text: '#333333',
        background: '#FFFFFF',
        accent1: '#5B9BD5',
        accent2: '#ED7D31',
        accent3: '#A5A5A5',
        accent4: '#FFC000',
        accent5: '#4472C4',
        accent6: '#70AD47',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Garamond, serif',
        body: 'Calibri, sans-serif'
      },
      effects: {
        border: '1px solid #BBBBBB',
        shadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    },
    'Metro': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#5B9BD5',
        accent2: '#ED7D31',
        accent3: '#A5A5A5',
        accent4: '#FFC000',
        accent5: '#4472C4',
        accent6: '#70AD47',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Segoe UI Light, sans-serif',
        body: 'Segoe UI, sans-serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
    'Module': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#C0504D',
        accent2: '#F79646',
        accent3: '#FFC000',
        accent4: '#9BBB59',
        accent5: '#4BACC6',
        accent6: '#8064A2',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Franklin Gothic Medium, sans-serif',
        body: 'Franklin Gothic Book, sans-serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
    'Opulent': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#7030A0',
        accent2: '#C00000',
        accent3: '#ED7D31',
        accent4: '#FFC000',
        accent5: '#00B0F0',
        accent6: '#70AD47',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Bookman Old Style, serif',
        body: 'Candara, sans-serif'
      },
      effects: {
        border: '1px solid #D8D8D8',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
    'Oriel': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#4F81BD',
        accent2: '#9BBB59',
        accent3: '#F79646',
        accent4: '#8064A2',
        accent5: '#C0504D',
        accent6: '#4BACC6',
        hyperlink: '#4F81BD',
        followedLink: '#9BBB59'
      },
      fonts: {
        heading: 'Palatino Linotype, serif',
        body: 'Palatino Linotype, serif'
      },
      effects: {
        border: '1px solid #4F81BD',
        shadow: '0 2px 4px rgba(79, 129, 189, 0.2)'
      }
    },
    'Origin': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#5B9BD5',
        accent2: '#ED7D31',
        accent3: '#A5A5A5',
        accent4: '#FFC000',
        accent5: '#4472C4',
        accent6: '#70AD47',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Arial, sans-serif',
        body: 'Arial, sans-serif'
      },
      effects: {
        border: '1px solid #5B9BD5',
        shadow: '0 1px 3px rgba(91, 155, 213, 0.2)'
      }
    },
    'Paper': {
      colors: {
        text: '#2C2416',
        background: '#FEFEF0',
        accent1: '#BF8F00',
        accent2: '#E7C000',
        accent3: '#FFD966',
        accent4: '#C5C5C5',
        accent5: '#D9D9D9',
        accent6: '#F2F2F2',
        hyperlink: '#8B6914',
        followedLink: '#A0822D'
      },
      fonts: {
        heading: 'Times New Roman, serif',
        body: 'Times New Roman, serif'
      },
      effects: {
        border: '1px solid #BF8F00',
        shadow: '0 1px 3px rgba(191, 143, 0, 0.25)'
      }
    },
    'Solstice': {
      colors: {
        text: '#1F1F1F',
        background: '#F0F8FF',
        accent1: '#4BACC6',
        accent2: '#8DB4E2',
        accent3: '#C5D9F1',
        accent4: '#DCE6F1',
        accent5: '#F2F2F2',
        accent6: '#D9D9D9',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Lucida Sans Unicode, sans-serif',
        body: 'Lucida Sans Unicode, sans-serif'
      },
      effects: {
        border: '1px solid #4BACC6',
        shadow: '0 2px 5px rgba(75, 172, 198, 0.2)'
      }
    },
    'Technic': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#8064A2',
        accent2: '#B1A0C7',
        accent3: '#D9D2E9',
        accent4: '#E2EFDA',
        accent5: '#C5E0B4',
        accent6: '#9BBB59',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Franklin Gothic Medium, sans-serif',
        body: 'Franklin Gothic Book, sans-serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
    'Trek': {
      colors: {
        text: '#222222',
        background: '#FFFFFF',
        accent1: '#70AD47',
        accent2: '#5B9BD5',
        accent3: '#ED7D31',
        accent4: '#FFC000',
        accent5: '#A5A5A5',
        accent6: '#4472C4',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Century Gothic, sans-serif',
        body: 'Segoe UI, sans-serif'
      },
      effects: {
        border: '1px solid #C0C0C0',
        shadow: '0 2px 3px rgba(0,0,0,0.15)'
      }
    },
    'Urban': {
      colors: {
        text: '#1F1F1F',
        background: '#FAFAFA',
        accent1: '#44546A',
        accent2: '#5F7A95',
        accent3: '#A5A5A5',
        accent4: '#D0CECE',
        accent5: '#E7E6E6',
        accent6: '#F2F2F2',
        hyperlink: '#44546A',
        followedLink: '#5F7A95'
      },
      fonts: {
        heading: 'Tahoma, sans-serif',
        body: 'Tahoma, sans-serif'
      },
      effects: {
        border: '1px solid #44546A',
        shadow: '0 1px 3px rgba(68, 84, 106, 0.15)'
      }
    },
    'Verve': {
      colors: {
        text: '#1F1F1F',
        background: '#FFFFFF',
        accent1: '#963634',
        accent2: '#C0504D',
        accent3: '#E2A8A7',
        accent4: '#F4B183',
        accent5: '#F8CBAD',
        accent6: '#ED7D31',
        hyperlink: '#0070C0',
        followedLink: '#7030A0'
      },
      fonts: {
        heading: 'Corbel, sans-serif',
        body: 'Corbel, sans-serif'
      },
      effects: {
        border: '1px solid #CCCCCC',
        shadow: '0 1px 2px rgba(0,0,0,0.1)'
      }
    }
  }

  const colorSchemes = {
    'Blue': { primary: '#2E75B6', secondary: '#5B9BD5', accent: '#70AD47' },
    'Green': { primary: '#70AD47', secondary: '#A9D18E', accent: '#C5E0B4' },
    'Orange': { primary: '#ED7D31', secondary: '#F4B183', accent: '#F8CBAD' },
    'Purple': { primary: '#7030A0', secondary: '#A9A9A9', accent: '#D9D9D9' },
    'Red': { primary: '#C00000', secondary: '#FF0000', accent: '#FF6B6B' },
    'Teal': { primary: '#00B0F0', secondary: '#5BC0DE', accent: '#A8E6CF' },
    'Yellow': { primary: '#FFC000', secondary: '#FFD966', accent: '#FFE699' },
    'Grayscale': { primary: '#404040', secondary: '#808080', accent: '#C0C0C0' },
    'Blue Warm': { primary: '#4F81BD', secondary: '#95B3D7', accent: '#DCE6F1' },
    'Blue II': { primary: '#1F497D', secondary: '#4F81BD', accent: '#95B3D7' },
    'Green Yellow': { primary: '#9BBB59', secondary: '#C5E0B4', accent: '#E2EFDA' },
    'Marquee': { primary: '#4BACC6', secondary: '#8DB4E2', accent: '#C5D9F1' },
    'Median': { primary: '#8064A2', secondary: '#B1A0C7', accent: '#D9D2E9' },
    'Metro': { primary: '#5B9BD5', secondary: '#A5A5A5', accent: '#D9D9D9' },
    'Module': { primary: '#C0504D', secondary: '#F79646', accent: '#FFC000' },
    'Office': { primary: '#2E75B6', secondary: '#5B9BD5', accent: '#70AD47' },
    'Office 2007-2010': { primary: '#365F91', secondary: '#4F81BD', accent: '#95B3D7' },
    'Paper': { primary: '#BF8F00', secondary: '#E7C000', accent: '#FFD966' },
    'Solstice': { primary: '#4BACC6', secondary: '#8DB4E2', accent: '#C5D9F1' },
    'Technic': { primary: '#8064A2', secondary: '#B1A0C7', accent: '#D9D2E9' },
    'Trek': { primary: '#4BACC6', secondary: '#8DB4E2', accent: '#C5D9F1' },
    'Urban': { primary: '#44546A', secondary: '#5F7A95', accent: '#A5A5A5' },
    'Verve': { primary: '#963634', secondary: '#C0504D', accent: '#E2A8A7' },
    'Waveform': { primary: '#4F81BD', secondary: '#8DB4E2', accent: '#C5D9F1' }
  }

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
  }

  // Apply comprehensive theme to document (like MS Word) - includes colors, fonts, and effects
  const applyTheme = (theme) => {
    if (!editor) return
    const themeData = themeStyles[theme] || themeStyles['Office']
    const colors = themeData.colors
    const fonts = themeData.fonts
    const effects = themeData.effects
    
    // Create or update theme style element
    const styleId = 'document-theme-styles'
    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    // Theme-specific styling variations
    const themeVariations = {
      'Office': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Apex': { headingStyle: 'uppercase', bodyStyle: 'normal', spacing: 'relaxed' },
      'Aspect': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'compact' },
      'Civic': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Concourse': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Equity': { headingStyle: 'normal', bodyStyle: 'italic', spacing: 'relaxed' },
      'Flow': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Foundry': { headingStyle: 'bold', bodyStyle: 'normal', spacing: 'tight' },
      'Median': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'relaxed' },
      'Metro': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'compact' },
      'Module': { headingStyle: 'bold', bodyStyle: 'normal', spacing: 'normal' },
      'Opulent': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'relaxed' },
      'Oriel': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Origin': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Paper': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'relaxed' },
      'Solstice': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' },
      'Technic': { headingStyle: 'bold', bodyStyle: 'normal', spacing: 'tight' },
      'Trek': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'relaxed' },
      'Urban': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'compact' },
      'Verve': { headingStyle: 'normal', bodyStyle: 'normal', spacing: 'normal' }
    }
    
    const variation = themeVariations[theme] || themeVariations['Office']
    const lineHeight = variation.spacing === 'relaxed' ? '1.8' : variation.spacing === 'compact' ? '1.4' : variation.spacing === 'tight' ? '1.3' : '1.6'
    const headingTransform = variation.headingStyle === 'uppercase' ? 'uppercase' : 'none'
    const headingWeight = variation.headingStyle === 'bold' ? '700' : '600'
    const bodyStyle = variation.bodyStyle === 'italic' ? 'italic' : 'normal'
    
    // Apply comprehensive theme styles (colors, fonts, effects)
    styleElement.textContent = `
      /* Theme: ${theme} - Complete MS Word-style theme */
      .ProseMirror {
        --theme-text: ${colors.text};
        --theme-background: ${colors.background};
        --theme-accent1: ${colors.accent1};
        --theme-accent2: ${colors.accent2};
        --theme-accent3: ${colors.accent3};
        --theme-accent4: ${colors.accent4};
        --theme-accent5: ${colors.accent5};
        --theme-accent6: ${colors.accent6};
        --theme-hyperlink: ${colors.hyperlink};
        --theme-followed-link: ${colors.followedLink};
        --theme-heading-font: ${fonts.heading};
        --theme-body-font: ${fonts.body};
        color: ${colors.text};
        background-color: ${colors.background};
      }
      
      /* Headings - Theme colors and fonts with unique styling */
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3,
      .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
        font-family: ${fonts.heading} !important;
        font-weight: ${headingWeight};
        text-transform: ${headingTransform};
      }
      
      /* H1 uses accent1 with strong styling */
      .ProseMirror h1 {
        color: ${colors.accent1} !important;
        border-bottom: ${effects.border};
        border-bottom-color: ${colors.accent1};
        padding-bottom: 0.3em;
        margin-bottom: 0.5em;
        text-shadow: ${effects.shadow};
        font-size: 2.5em;
        letter-spacing: ${headingTransform === 'uppercase' ? '1px' : '-0.5px'};
      }
      
      /* H2 uses accent2 */
      .ProseMirror h2 {
        color: ${colors.accent2} !important;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        text-shadow: ${effects.shadow};
        font-size: 2em;
        letter-spacing: ${headingTransform === 'uppercase' ? '0.5px' : 'normal'};
      }
      
      /* H3 uses accent3 */
      .ProseMirror h3 {
        color: ${colors.accent3} !important;
        margin-top: 1.2em;
        margin-bottom: 0.4em;
        font-size: 1.5em;
      }
      
      /* H4 uses accent4 */
      .ProseMirror h4 {
        color: ${colors.accent4} !important;
        margin-top: 1em;
        font-size: 1.25em;
      }
      
      /* H5 uses accent5 */
      .ProseMirror h5 {
        color: ${colors.accent5} !important;
        font-size: 1.1em;
      }
      
      /* H6 uses accent6 */
      .ProseMirror h6 {
        color: ${colors.accent6} !important;
        font-size: 1em;
      }
      
      /* Body text - Theme fonts with proper spacing */
      .ProseMirror p {
        font-family: ${fonts.body} !important;
        color: ${colors.text};
        line-height: ${lineHeight};
        margin-bottom: 1em;
        font-style: ${bodyStyle};
      }
      
      .ProseMirror li, .ProseMirror td {
        font-family: ${fonts.body} !important;
        color: ${colors.text};
      }
      
      .ProseMirror div, .ProseMirror span {
        font-family: ${fonts.body} !important;
        color: ${colors.text};
      }
      
      /* Links - Theme hyperlink colors */
      .ProseMirror a {
        color: ${colors.hyperlink} !important;
        text-decoration-color: ${colors.hyperlink};
      }
      
      .ProseMirror a:visited {
        color: ${colors.followedLink} !important;
        text-decoration-color: ${colors.followedLink};
      }
      
      .ProseMirror a:hover {
        color: ${colors.accent1} !important;
        text-decoration: underline;
        text-shadow: ${effects.shadow};
      }
      
      /* Strong/Bold text - Uses accent colors */
      .ProseMirror strong, .ProseMirror b {
        color: ${colors.accent1} !important;
        font-weight: 700;
      }
      
      /* Emphasis - Uses accent2 */
      .ProseMirror em, .ProseMirror i {
        color: ${colors.accent2};
      }
      
      /* Tables - Theme colors with effects */
      .ProseMirror table {
        border: ${effects.border};
        border-color: ${colors.accent3};
        box-shadow: ${effects.shadow};
      }
      
      .ProseMirror table th {
        background-color: ${colors.accent1} !important;
        color: ${colors.background} !important;
        border: ${effects.border};
        border-color: ${colors.accent2};
        font-family: ${fonts.heading} !important;
        font-weight: 600;
        text-shadow: ${effects.shadow};
      }
      
      .ProseMirror table td {
        border: ${effects.border};
        border-color: ${colors.accent3};
        background-color: ${colors.background};
      }
      
      .ProseMirror table tr:nth-child(even) td {
        background-color: ${colors.accent6}20;
      }
      
      /* Blockquotes - Theme accent colors with effects */
      .ProseMirror blockquote {
        border-left: 4px solid ${colors.accent1} !important;
        background-color: ${colors.accent6}15;
        padding: 1em;
        margin: 1em 0;
        box-shadow: ${effects.shadow};
        font-family: ${fonts.body};
        color: ${colors.text};
      }
      
      /* Horizontal rules - Theme colors */
      .ProseMirror hr {
        border: none;
        border-top: 2px solid ${colors.accent2} !important;
        box-shadow: ${effects.shadow};
        margin: 2em 0;
      }
      
      /* Code blocks - Theme colors with effects */
      .ProseMirror code {
        background-color: ${colors.accent6}30;
        color: ${colors.accent1};
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        border: ${effects.border};
        border-color: ${colors.accent3};
      }
      
      .ProseMirror pre {
        background-color: ${colors.accent6}20;
        border: ${effects.border};
        border-color: ${colors.accent3};
        box-shadow: ${effects.shadow};
        padding: 1em;
        border-radius: 4px;
      }
      
      .ProseMirror pre code {
        background-color: transparent;
        border: none;
        padding: 0;
      }
      
      /* Lists - Theme accent colors */
      .ProseMirror ul li::marker,
      .ProseMirror ol li::marker {
        color: ${colors.accent1};
      }
      
      /* Selection - Theme accent colors */
      .ProseMirror ::selection {
        background-color: ${colors.accent1};
        color: ${colors.background};
      }
      
      /* Images - Theme effects */
      .ProseMirror img {
        border: ${effects.border};
        border-color: ${colors.accent3};
        box-shadow: ${effects.shadow};
        border-radius: 4px;
      }
      
      /* Buttons and interactive elements */
      .ProseMirror button,
      .ProseMirror [role="button"] {
        background-color: ${colors.accent1};
        color: ${colors.background};
        border: ${effects.border};
        box-shadow: ${effects.shadow};
      }
      
      .ProseMirror button:hover {
        background-color: ${colors.accent2};
      }
    `
    
    // Apply fonts to editor content via Tiptap
    if (editor.commands.setFontFamily) {
      const bodyFontName = fonts.body.split(',')[0].trim()
      editor.chain().focus().setFontFamily(bodyFontName).run()
    }
    
    // Update CSS variables for global use
    const root = document.documentElement
    root.style.setProperty('--theme-accent1', colors.accent1)
    root.style.setProperty('--theme-accent2', colors.accent2)
    root.style.setProperty('--theme-accent3', colors.accent3)
    root.style.setProperty('--theme-hyperlink', colors.hyperlink)
    root.style.setProperty('--theme-heading-font', fonts.heading)
    root.style.setProperty('--theme-body-font', fonts.body)
    
    // Update document background
    const editorElement = editor.view.dom.closest('.ProseMirror') || document.querySelector('.ProseMirror')
    if (editorElement) {
      editorElement.style.backgroundColor = colors.background
    }
    
    // Show notification
    const notification = document.createElement('div')
    notification.textContent = `Theme "${theme}" applied - Colors, Fonts & Effects`
    notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4CAF50; color: white; padding: 12px 24px; border-radius: 4px; z-index: 10000; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-weight: 500;'
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 2500)
  }

  // Apply color scheme to document
  const applyColorScheme = (scheme) => {
    if (!editor) return
    const colors = colorSchemes[scheme] || colorSchemes['Blue']
    
    // Apply colors to links, headings, etc.
    const root = document.documentElement
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-secondary', colors.secondary)
    root.style.setProperty('--color-accent', colors.accent)
    
    // Update link colors
    const styleId = 'design-color-scheme'
    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    styleElement.textContent = `
      .ProseMirror a { color: ${colors.primary} !important; }
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 { color: ${colors.primary} !important; }
      .ProseMirror strong { color: ${colors.primary} !important; }
    `
  }

  // Apply font set to document (like MS Word - applies to entire document)
  const applyFontSet = (fontSet) => {
    if (!editor) return
    const fonts = fontSets[fontSet] || fontSets['Office']
    
    // Store font set preference
    localStorage.setItem('word-editor-design-fonts', fontSet)
    setCurrentFontSet(fontSet)
    
    // Get the editor state
    const { state } = editor
    const { tr, schema } = state
    
    // Collect all text nodes with their positions and parent node types
    const textNodes = []
    state.doc.descendants((node, pos) => {
      if (node.isText) {
        // Use resolve to find the parent block node
        const $pos = state.doc.resolve(pos)
        let parentType = null
        
        // Walk up the document structure to find the parent block
        for (let depth = $pos.depth; depth > 0; depth--) {
          const parentNode = $pos.node(depth)
          if (parentNode.type.name === 'heading' || 
              parentNode.type.name === 'paragraph' || 
              parentNode.type.name === 'listItem' || 
              parentNode.type.name === 'tableCell' ||
              parentNode.type.name === 'tableHeader') {
            parentType = parentNode.type.name
            break
          }
        }
        
        if (parentType) {
          textNodes.push({
            node,
            pos,
            parentType
          })
        }
      }
    })
    
    // Apply fonts to all collected text nodes
    textNodes.forEach(({ node, pos, parentType }) => {
      const from = pos
      const to = pos + node.text.length
      
      // Determine which font to use based on parent type
      const targetFont = parentType === 'heading' ? fonts.heading : fonts.body
      
      // Get existing textStyle mark attributes (if any) to preserve other formatting
      const existingTextStyle = node.marks.find(m => m.type.name === 'textStyle')
      const existingAttrs = existingTextStyle?.attrs || {}
      
      // Remove existing textStyle mark
      if (existingTextStyle) {
        tr.removeMark(from, to, schema.marks.textStyle)
      }
      
      // Create new textStyle mark with fontFamily, preserving other attributes (color, fontSize, etc.)
      const newAttrs = { ...existingAttrs, fontFamily: targetFont }
      const textStyleMark = schema.marks.textStyle.create(newAttrs)
      tr.addMark(from, to, textStyleMark)
    })
    
    // Apply all updates in a single transaction
    if (tr.steps.length > 0) {
      editor.view.dispatch(tr)
    }
    
    // Also set CSS for default styling of new content
    const styleId = 'design-font-set'
    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    styleElement.textContent = `
      /* Default fonts for new content */
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, 
      .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 { 
        font-family: '${fonts.heading}', sans-serif !important; 
      }
      .ProseMirror p, .ProseMirror li, .ProseMirror td, .ProseMirror th { 
        font-family: '${fonts.body}', sans-serif !important; 
      }
    `
  }

  // Apply effect to document
  const applyEffect = (effect) => {
    if (!editor) return
    const editorElement = editor.view.dom.closest('.ProseMirror') || document.querySelector('.ProseMirror')
    if (!editorElement) return
    
    const styleId = 'design-effect'
    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    let effectCSS = ''
    switch(effect) {
      case '3-D':
        effectCSS = 'text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa;'
        break
      case 'Glow':
        effectCSS = 'text-shadow: 0 0 5px rgba(0,0,0,0.3), 0 0 10px rgba(0,0,0,0.2);'
        break
      case 'Shadow':
        effectCSS = 'text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
        break
      case 'Reflection':
        effectCSS = 'text-shadow: 0 1px 0 rgba(255,255,255,0.5);'
        break
      case 'Soft Edges':
        effectCSS = 'text-shadow: 0 0 3px rgba(0,0,0,0.2);'
        break
      case 'Bevel':
        effectCSS = 'text-shadow: 1px 1px 0 rgba(255,255,255,0.5), -1px -1px 0 rgba(0,0,0,0.3);'
        break
      case 'Sketch':
        effectCSS = 'text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;'
        break
      default:
        effectCSS = ''
    }
    
    styleElement.textContent = effectCSS ? `.ProseMirror * { ${effectCSS} }` : ''
  }

  // Add watermark to document
  const addWatermark = (text, fontSize = 80) => {
    if (!editor || !text) return
    
    const watermarkId = 'document-watermark'
    let watermark = document.getElementById(watermarkId)
    if (watermark) {
      watermark.remove()
    }
    
    watermark = document.createElement('div')
    watermark.id = watermarkId
    watermark.textContent = text
    watermark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: ${fontSize}px;
      color: rgba(0, 0, 0, 0.1);
      font-weight: bold;
      pointer-events: none;
      z-index: 1;
      white-space: nowrap;
      font-family: Arial, sans-serif;
    `
    
    // Find the best container for watermark
    const editorView = editor.view.dom
    const pageContainer = editorView.closest('.document-page') || 
                         editorView.closest('[class*="page"]') ||
                         editorView.closest('.ProseMirror') || 
                         editorView
    
    if (pageContainer && pageContainer.parentElement) {
      const container = pageContainer.parentElement
      container.style.position = 'relative'
      container.appendChild(watermark)
    } else {
      document.body.appendChild(watermark)
    }
  }

  // Apply page borders
  const applyPageBorders = (style, borderColor = '#000000', borderWidth = '1pt', borderStyle = 'solid') => {
    if (!editor) return
    
    const styleId = 'design-page-borders'
    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    if (style === 'None') {
      // Explicitly remove border by removing the pseudo-element
      styleElement.textContent = `
        .ProseMirror .document-page::before {
          display: none !important;
        }
      `
      localStorage.setItem('word-editor-design-page-borders', 'None')
      return
    }
    
    // Convert pt to px (1pt ≈ 1.33px)
    const widthValue = borderWidth.replace('pt', '').trim()
    const widthNum = parseFloat(widthValue) || 1
    const widthPx = `${widthNum * 1.33}px`
    
    // Map border style names
    let cssBorderStyle = borderStyle.toLowerCase()
    if (cssBorderStyle === 'solid') cssBorderStyle = 'solid'
    else if (cssBorderStyle === 'dashed') cssBorderStyle = 'dashed'
    else if (cssBorderStyle === 'dotted') cssBorderStyle = 'dotted'
    else if (cssBorderStyle === 'double') cssBorderStyle = 'double'
    
    let borderCSS = ''
    let boxShadowCSS = ''
    
    switch(style) {
      case 'Box':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`
        break
      case 'Shadow':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`
        boxShadowCSS = `box-shadow: 4px 4px 8px rgba(0,0,0,0.3) !important;`
        break
      case '3-D':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`
        boxShadowCSS = `box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.1) !important;`
        break
      case 'Custom':
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`
        break
      default:
        borderCSS = `border: ${widthPx} ${cssBorderStyle} ${borderColor} !important;`
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
    `
    
    // Store in localStorage
    localStorage.setItem('word-editor-design-page-borders', JSON.stringify({
      style,
      borderColor,
      borderWidth,
      borderStyle
    }))
  }


  // Position design dropdowns when they open
  useEffect(() => {
    const positionDropdown = (selector, buttonSelector) => {
      const button = document.querySelector(buttonSelector);
      const dropdown = document.querySelector(selector);
      if (button && dropdown) {
        const rect = button.getBoundingClientRect();
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.top = `${rect.bottom + 4}px`;
      }
    };

    if (showThemePicker) {
      setTimeout(() => positionDropdown('.design-dropdown-theme', '[data-theme-button]'), 0);
    }
    if (showColorPicker) {
      setTimeout(() => positionDropdown('.design-dropdown-color', '[data-color-button]'), 0);
    }
    if (showFontSetPicker) {
      setTimeout(() => positionDropdown('.design-dropdown-font', '[data-font-button]'), 0);
    }
    if (showParagraphSpacing) {
      setTimeout(() => positionDropdown('.design-dropdown-spacing', '[data-spacing-button]'), 0);
    }
    if (showEffects) {
      setTimeout(() => positionDropdown('.design-dropdown-effect', '[data-effect-button]'), 0);
    }
    if (showPageColor) {
      setTimeout(() => positionDropdown('.design-dropdown-pagecolor', '[data-pagecolor-button]'), 0);
    }
  }, [showThemePicker, showColorPicker, showFontSetPicker, showParagraphSpacing, showEffects, showPageColor])

  // Close design dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.design-dropdown')) {
        setShowThemePicker(false)
        setShowColorPicker(false)
        setShowFontSetPicker(false)
        setShowParagraphSpacing(false)
        setShowEffects(false)
        setShowPageColor(false)
      }
      // Close zoom dropdown when clicking outside
      if (!event.target.closest('.zoom-dropdown-container')) {
        setShowZoomDropdown(false)
      }
    }

    if (showThemePicker || showColorPicker || showFontSetPicker || showParagraphSpacing || showEffects || showPageColor || showZoomDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showThemePicker, showColorPicker, showFontSetPicker, showParagraphSpacing, showEffects, showPageColor, showZoomDropdown])

  // Link state
  const [showLinkEditor, setShowLinkEditor] = useState(false)
  const [linkEditorPosition, setLinkEditorPosition] = useState({ x: 0, y: 0 })
  const [showLinkActions, setShowLinkActions] = useState(false)
  const [linkActionsPosition, setLinkActionsPosition] = useState({ x: 0, y: 0 })
  const [currentLinkHref, setCurrentLinkHref] = useState('')
  const [currentLinkText, setCurrentLinkText] = useState('')
  const [currentLinkRange, setCurrentLinkRange] = useState({ from: null, to: null })
  const prevDocContentRef = useRef('')

  // Draw section state
  const [drawTool, setDrawTool] = useState('pen') // 'pen', 'pencil', 'highlighter', 'fountainPen'
  const [drawColor, setDrawColor] = useState('#000000')
  const [drawThickness, setDrawThickness] = useState(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStrokes, setDrawStrokes] = useState([])
  const [drawUndoStack, setDrawUndoStack] = useState([])
  const [drawRedoStack, setDrawRedoStack] = useState([])
  const drawCanvasRef = useRef(null)
  const drawContextRef = useRef(null)
  const currentStrokeRef = useRef(null)
  const lastPointRef = useRef(null)
  const drawSpeedRef = useRef(0)

  // Table Design state
  const [tableStyle, setTableStyle] = useState('plain')
  const [tableStyleOptions, setTableStyleOptions] = useState({
    headerRow: true,
    bandedRows: false,
    firstColumn: false,
    lastColumn: false,
    bandedColumns: false
  })
  const [showTableStylesPopup, setShowTableStylesPopup] = useState(false)
  const [tableStylesPopupPos, setTableStylesPopupPos] = useState({ x: 0, y: 0 })
  const tableStylesButtonRef = useRef(null)
  const tableStylesPopupRef = useRef(null)
  const [showQuickTables, setShowQuickTables] = useState(false)
  const [hasTable, setHasTable] = useState(false)

  // Tool-specific default thicknesses (MS Word-like)
  const getDefaultThickness = (tool) => {
    switch (tool) {
      case 'pen': return 2.25
      case 'pencil': return 1.5
      case 'highlighter': return 8
      case 'fountainPen': return 2.5
      default: return 2
    }
  }

  // Tool-specific default colors (MS Word-like)
  const getDefaultColor = (tool) => {
    switch (tool) {
      case 'pen': return '#000000'
      case 'pencil': return '#666666' // Grey color for pencil
      case 'highlighter': return '#FFFF00' // Yellow for highlighter
      case 'fountainPen': return '#000000'
      default: return '#000000'
    }
  }

  // Update thickness and color when tool changes
  useEffect(() => {
    if (activeTab === 'Draw') {
      setDrawThickness(getDefaultThickness(drawTool))
      setDrawColor(getDefaultColor(drawTool))
    }
  }, [drawTool, activeTab])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.bullet-options') && !event.target.closest('.number-options')) {
        setShowBulletOptions(false)
        setShowNumberOptions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Position the shapes palette under the button (fixed so it overlays sidebar)
  useEffect(() => {
    if (!showShapePalette || !shapesButtonRef) return
    const updatePosition = () => {
      const rect = shapesButtonRef.getBoundingClientRect()
      setShapePalettePosition({ top: rect.bottom + 4, left: rect.left })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [showShapePalette, shapesButtonRef])

  // Close palette on outside click
  useEffect(() => {
    if (!showShapePalette) return
    const onDown = (e) => {
      if (
        shapePaletteRef.current &&
        !shapePaletteRef.current.contains(e.target) &&
        shapesButtonRef && !shapesButtonRef.contains(e.target)
      ) {
        setShowShapePalette(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showShapePalette, shapesButtonRef])

  const editor = useEditor({
    editable: viewMode !== 'viewing',
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      ParagraphWithStyle,
      HeadingWithStyle,
      BulletList.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            bulletStyle: {
              default: null,
              parseHTML: element => element.getAttribute('data-bullet-style') || null,
              renderHTML: attributes => attributes.bulletStyle ? { 'data-bullet-style': attributes.bulletStyle } : {},
            },
          }
        },
      }).configure({ keepMarks: true, keepAttributes: true }),
      OrderedList.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            numberStyle: {
              default: null,
              parseHTML: element => element.getAttribute('data-number-style') || null,
              renderHTML: attributes => attributes.numberStyle ? { 'data-number-style': attributes.numberStyle } : {},
            },
          }
        },
      }).configure({ keepMarks: true, keepAttributes: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      EnhancedAlignment,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image,
      ImageResizeExtension,
      Link,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCellWithAttrs,
      Subscript,
      Superscript,
      TextStyle,
      FontSize,
      FontCase,
      HiddenText,
      Spacing,
      PageBreak,
      PageBlock,
      DocumentProtection,
      CursorBoundaryExtension,
      AutoPageExtension,
      CommentMark,
    ],
    content: '<div class="document-page"><p>Start typing your document here...</p></div>',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
      
      // Check if content actually changed (not just selection)
      const currentContent = editor.getHTML()
      const contentChanged = currentContent !== prevDocContentRef.current
      prevDocContentRef.current = currentContent
      
      // Check if document has tables
      const { state } = editor.view
      const { doc } = state
      let foundTable = false
      doc.descendants((node) => {
        if (node.type.name === 'table') {
          foundTable = true
          return false // Stop searching
        }
      })
      setHasTable(foundTable)
      
      // If DesignTable tab is active but table was deleted, switch to Home tab
      if (activeTab === 'DesignTable' && !foundTable) {
        setActiveTab('Home')
      }
      
      // Only check for overflow if content actually changed
      if (!contentChanged) return
      
      // Check for overflow and create new page if needed
      requestAnimationFrame(() => {
        const pageType = state.schema.nodes.pageBlock
        if (!pageType) return
        
        // Find all pages
        const pages = []
        doc.descendants((node, pos) => {
          if (node.type === pageType) {
            pages.push({ node, pos, start: pos + 1, end: pos + node.nodeSize - 1 })
          }
        })
        
        if (pages.length === 0) return
        
        // Check if cursor is in the last page
        const lastPage = pages[pages.length - 1]
        const cursorPos = state.selection.$to.pos
        const isInLastPage = cursorPos >= lastPage.start && cursorPos <= lastPage.end
        
        if (!isInLastPage) return
        
        const lastPageElement = document.querySelector('.ProseMirror .document-page:last-child')
        if (!lastPageElement) return
        
        const pageHeight = lastPageElement.clientHeight
        const contentHeight = lastPageElement.scrollHeight
        const overflowPx = contentHeight - pageHeight
        
        // Only create new page if actually overflowing with meaningful content
        // Check that there's actual text content (not just empty space)
        const lastPageNode = lastPage.node
        const hasActualContent = lastPageNode.textContent.trim().length > 0
        
        // Only create page if:
        // 1. There's actual overflow (more than 2px threshold)
        // 2. There's actual content in the page (not just empty paragraphs)
        if (overflowPx > 2 && hasActualContent && lastPageNode.childCount > 0) {
          // Use createAndFill to ensure same structure as manually inserted pages
          const newPage = pageType.createAndFill()
          if (!newPage) return
          
          const insertPos = doc.content.size
          const tr = state.tr
          tr.insert(insertPos, newPage)
          const newPageStart = insertPos + 1
          tr.setSelection(TextSelection.create(tr.doc, newPageStart))
          editor.view.dispatch(tr)
        }
      })
    },
    immediatelyRender: false,
  })

  // Update editor editable state when view mode changes
  useEffect(() => {
    if (editor) {
      // Both viewing and reviewing modes are read-only
      editor.setEditable(viewMode !== 'viewing' && viewMode !== 'reviewing')
    }
    // Force View tab when entering viewing or reviewing mode
    if ((viewMode === 'viewing' || viewMode === 'reviewing') && activeTab !== 'View') {
      setActiveTab('View')
    }
  }, [editor, viewMode, activeTab])

  // Page color is not persisted - always starts with default white on refresh
  useEffect(() => {
    if (!editor) return
    // Clear any existing page color style to ensure default white background
    const styleId = 'design-page-color'
    let styleElement = document.getElementById(styleId)
    if (styleElement) {
      styleElement.textContent = `
        .ProseMirror .document-page {
          background-color: #FFFFFF !important;
        }
      `
    }
    // Reset state to default white
    setPageBackgroundColor('#FFFFFF')
  }, [editor])

  // Load font set from localStorage on mount (after editor is initialized)
  useEffect(() => {
    if (!editor) return
    const savedFontSet = localStorage.getItem('word-editor-design-fonts')
    if (savedFontSet && fontSets[savedFontSet]) {
      setCurrentFontSet(savedFontSet)
      // Apply the saved font set to the document
      applyFontSet(savedFontSet)
    }
  }, [editor])

  // Table context menu and image wrap toolbar handlers
  useEffect(() => {
    if (!editor || !editor.view) return
    const el = editor.view.dom
    
    const onClick = (event) => {
      const t = event.target
      // Check for resize handles first - don't show menu if clicking handles
      if (t && (t.classList?.contains('resize-handle') || t.classList?.contains('rotate-handle') || t.closest('.image-selection-overlay'))) {
        return
      }
      
      if (t && t.closest && t.closest('table')) {
        setTableContextPosition({ x: event.clientX, y: event.clientY })
        setShowTableContextMenu(true)
        setShowImageWrapToolbar(false)
      } else {
        // Check if clicked on any image (even if not resizable-image class yet)
        const img = t.tagName === 'IMG' ? t : (t.closest && t.closest('img'))
        if (img && editor.view.dom.contains(img)) {
          // Mark image as selected (add class if not present)
          if (!img.classList.contains('resizable-image')) {
            img.classList.add('resizable-image')
          }
          document.querySelectorAll('.resizable-image.selected').forEach(x => x.classList.remove('selected'))
          img.classList.add('selected')
          
          // Position toolbar on left side near sidebar
          const rect = img.getBoundingClientRect()
          const scrollX = window.scrollX || window.pageXOffset
          const scrollY = window.scrollY || window.pageYOffset
          
          // Sidebar width is w-96 (384px), position popup near sidebar edge
          const sidebarWidth = showSidebar ? 384 : 0
          const popupWidth = 200
          
          // Position on left side of image, near sidebar
          let popupX = sidebarWidth + 10 + scrollX // 10px after sidebar
          let popupY = rect.top + scrollY + (rect.height / 2) // Vertically centered with image
          
          // Ensure popup doesn't go off screen vertically
          const popupHeight = 400
          if (popupY + popupHeight / 2 > window.innerHeight + scrollY) {
            popupY = window.innerHeight + scrollY - popupHeight / 2 - 10
          }
          if (popupY - popupHeight / 2 < scrollY) {
            popupY = scrollY + popupHeight / 2 + 10
          }
          
          setImageWrapPosition({ x: popupX, y: popupY })
          setShowImageWrapToolbar(true)
        setShowTableContextMenu(false)
        } else {
          setShowTableContextMenu(false)
          setShowImageWrapToolbar(false)
      }
    }
    }
    
    const onCtx = (event) => {
      const t = event.target
      if (t && t.closest && t.closest('table')) {
        event.preventDefault()
        setTableContextPosition({ x: event.clientX, y: event.clientY })
        setShowTableContextMenu(true)
        setShowImageWrapToolbar(false)
      } else {
        // Check if right-clicked on any image
        const img = t.tagName === 'IMG' ? t : (t.closest && t.closest('img'))
        if (img && editor.view.dom.contains(img)) {
          event.preventDefault()
          // Mark image as selected (add class if not present)
          if (!img.classList.contains('resizable-image')) {
            img.classList.add('resizable-image')
          }
          document.querySelectorAll('.resizable-image.selected').forEach(x => x.classList.remove('selected'))
          img.classList.add('selected')
          
          // Position toolbar on left side near sidebar
          const rect = img.getBoundingClientRect()
          const scrollX = window.scrollX || window.pageXOffset
          const scrollY = window.scrollY || window.pageYOffset
          
          // Sidebar width is w-96 (384px), position popup near sidebar edge
          const sidebarWidth = showSidebar ? 384 : 0
          const popupWidth = 200
          
          // Position on left side of image, near sidebar
          let popupX = sidebarWidth + 10 + scrollX // 10px after sidebar
          let popupY = rect.top + scrollY + (rect.height / 2) // Vertically centered with image
          
          // Ensure popup doesn't go off screen vertically
          const popupHeight = 400
          if (popupY + popupHeight / 2 > window.innerHeight + scrollY) {
            popupY = window.innerHeight + scrollY - popupHeight / 2 - 10
          }
          if (popupY - popupHeight / 2 < scrollY) {
            popupY = scrollY + popupHeight / 2 + 10
          }
          
          setImageWrapPosition({ x: popupX, y: popupY })
          setShowImageWrapToolbar(true)
          setShowTableContextMenu(false)
        }
      }
    }
    
    // Use capture phase to ensure we catch the event
    el.addEventListener('click', onClick, true)
    el.addEventListener('contextmenu', onCtx, true)
    return () => {
      el.removeEventListener('click', onClick, true)
      el.removeEventListener('contextmenu', onCtx, true)
    }
  }, [editor])

  // Hard stop: prevent adding content beyond A4 page content area (applies per page)
  useEffect(() => {
    if (!editor) return

    const getClosestPage = (node) => {
      if (!node) return null
      const el = node.nodeType === 1 ? node : node.parentElement
      if (!el) return null
      return el.closest && el.closest('.document-page')
    }

    const getSelectionPage = () => {
      const sel = window.getSelection && window.getSelection()
      if (!sel || !sel.anchorNode) return null
      return getClosestPage(sel.anchorNode)
    }

    const isPageFull = (pageEl) => {
      const page = pageEl || getSelectionPage()
      if (!page) return false
      
      // Check if content height exceeds available height
      const overflowPx = page.scrollHeight - page.clientHeight
      
      // Only consider page "full" if:
      // 1. There's meaningful overflow (more than 2px to account for rounding)
      // 2. There's actual content in the page (not just empty space)
      if (overflowPx <= 2) return false
      
      // Check if page has actual text content
      const pageContent = page.textContent || ''
      const hasActualContent = pageContent.trim().length > 0
      
      // Only block if page is overflowing AND has actual content
      return hasActualContent && overflowPx > 2
    }

    const beforeInputHandler = (event) => {
      // Allow deletions/format removals when full, block inserts when full
      const t = event.inputType
      const isDeletion = t && (t.startsWith('delete') || t === 'historyUndo')
      const page = getClosestPage(event.target)
      
      // Only block if:
      // 1. It's not a deletion
      // 2. The page is actually full (with content)
      // 3. The page is the last page (previous pages should always be editable)
      const allPages = Array.from(document.querySelectorAll('.ProseMirror .document-page'))
      const isLastPage = page && allPages.length > 0 && page === allPages[allPages.length - 1]
      
      if (!isDeletion && isPageFull(page) && isLastPage) {
        event.preventDefault()
      }
    }

    const keydownHandler = (event) => {
      const page = getClosestPage(event.target) || getSelectionPage()
      
      // Only block if it's the last page and actually full
      const allPages = Array.from(document.querySelectorAll('.ProseMirror .document-page'))
      const isLastPage = page && allPages.length > 0 && page === allPages[allPages.length - 1]
      
      if (isPageFull(page) && isLastPage) {
        // Allow navigation and deletions
        const navKeys = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown','Tab'])
        const allow = navKeys.has(event.key) || event.key === 'Backspace' || event.key === 'Delete' || (event.ctrlKey || event.metaKey)
        if (!allow) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    }

    const pasteHandler = (event) => {
      const page = getClosestPage(event.target)
      const allPages = Array.from(document.querySelectorAll('.ProseMirror .document-page'))
      const isLastPage = page && allPages.length > 0 && page === allPages[allPages.length - 1]
      
      // Only block paste on last page if it's actually full
      if (isPageFull(page) && isLastPage) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const dropHandler = (event) => {
      const page = getClosestPage(event.target)
      const allPages = Array.from(document.querySelectorAll('.ProseMirror .document-page'))
      const isLastPage = page && allPages.length > 0 && page === allPages[allPages.length - 1]
      
      // Only block drop on last page if it's actually full
      if (isPageFull(page) && isLastPage) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const dom = editor.view?.dom
    if (dom) {
      // Handle link clicks - show LinkActions popup (like Google Docs)
      const linkClickHandler = (e) => {
        const linkElement = e.target.closest('a[href]')
        if (linkElement) {
          // Allow Ctrl/Cmd+click to open link normally
          if (e.ctrlKey || e.metaKey) {
            return
          }
          
          // Prevent default link behavior
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          // Remove target attribute if it exists
          if (linkElement.hasAttribute('target')) {
            linkElement.removeAttribute('target')
          }
          
          const href = linkElement.getAttribute('href') || ''
          const linkText = linkElement.textContent || ''
          setCurrentLinkHref(href)
          setCurrentLinkText(linkText)
          
          // Find the link position in the editor
          if (editor) {
            const { state } = editor
            let linkFrom = null
            let linkTo = null
            
            // First, try to find link at current cursor/selection position
            const { from, to } = state.selection
            const linkMark = editor.getAttributes('link')
            if (linkMark?.href === href) {
              // If link is at current selection, use it
              if (from !== to) {
                setCurrentLinkRange({ from, to })
              } else {
                // Cursor is in link, need to expand selection to entire link
                // Find the start and end of the link mark
                let startPos = from
                let endPos = from
                
                // Find start of link mark
                while (startPos > 0) {
                  const $pos = state.doc.resolve(startPos - 1)
                  const marks = $pos.marks()
                  const hasLink = marks.some(m => m.type.name === 'link' && m.attrs.href === href)
                  if (hasLink) {
                    startPos--
                  } else {
                    break
                  }
                }
                
                // Find end of link mark
                while (endPos < state.doc.content.size) {
                  const $pos = state.doc.resolve(endPos)
                  const marks = $pos.marks()
                  const hasLink = marks.some(m => m.type.name === 'link' && m.attrs.href === href)
                  if (hasLink) {
                    endPos++
                  } else {
                    break
                  }
                }
                
                if (startPos < endPos) {
                  setCurrentLinkRange({ from: startPos, to: endPos })
                }
              }
            } else {
              // Search for the link in the document
              state.doc.descendants((node, pos) => {
                if (node.isText && node.marks) {
                  const linkMark = node.marks.find(mark => mark.type.name === 'link')
                  if (linkMark && linkMark.attrs.href === href) {
                    // Use the whole text node if it matches
                    linkFrom = pos
                    linkTo = pos + node.text.length
                    return false // Stop searching
                  }
                }
              })
              
              // If we found the link, store its range
              if (linkFrom !== null && linkTo !== null) {
                setCurrentLinkRange({ from: linkFrom, to: linkTo })
              }
            }
          }
          
          // Position popup directly under the link text
          const rect = linkElement.getBoundingClientRect()
          const scrollX = window.scrollX || window.pageXOffset
          const scrollY = window.scrollY || window.pageYOffset
          
          // Position popup directly below the link
          let popupX = rect.left + scrollX
          let popupY = rect.bottom + scrollY + 4
          
          // Ensure popup doesn't go off screen horizontally
          const popupWidth = 280
          if (popupX + popupWidth > window.innerWidth + scrollX) {
            popupX = window.innerWidth + scrollX - popupWidth - 10
          }
          
          // Ensure popup doesn't go below viewport
          const popupHeight = 120
          if (popupY + popupHeight > window.innerHeight + scrollY) {
            // Show above link if not enough space below
            popupY = rect.top + scrollY - popupHeight - 4
          }
          
          setLinkActionsPosition({
            x: Math.max(10, popupX),
            y: Math.max(10, popupY)
          })
          
          setShowLinkActions(true)
        }
      }

      // Also handle mousedown to catch link clicks earlier and prevent default behavior
      const linkMouseDownHandler = (e) => {
        const linkElement = e.target.closest('a[href]')
        if (linkElement) {
          // Allow Ctrl/Cmd+click to open link normally
          if (e.ctrlKey || e.metaKey) {
            return
          }
          
          // Prevent default at mousedown level to stop link navigation
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          // Remove target attribute if it exists to prevent opening in new tab
          if (linkElement.hasAttribute('target')) {
            linkElement.removeAttribute('target')
          }
          
          // Set onclick to prevent default as a backup
          linkElement.onclick = (ev) => {
            if (!ev.ctrlKey && !ev.metaKey) {
              ev.preventDefault()
              ev.stopPropagation()
              ev.stopImmediatePropagation()
              return false
            }
          }
        }
      }

      // Set onclick handlers on all existing links to prevent default behavior
      const setLinkHandlers = () => {
        const links = dom.querySelectorAll('a[href]')
        links.forEach(link => {
          // Remove any existing onclick to avoid conflicts
          link.onclick = (e) => {
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()
              return false
            }
          }
          // Remove target attribute
          if (link.hasAttribute('target')) {
            link.removeAttribute('target')
          }
        })
      }

      // Set handlers on existing links
      setLinkHandlers()

      // Watch for new links being added to the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // Check if the added node is a link
              if (node.tagName === 'A' && node.hasAttribute('href')) {
                node.onclick = (e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    return false
                  }
                }
                if (node.hasAttribute('target')) {
                  node.removeAttribute('target')
                }
              }
              // Check for links inside the added node
              const links = node.querySelectorAll?.('a[href]')
              if (links) {
                links.forEach(link => {
                  link.onclick = (e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                      e.preventDefault()
                      e.stopPropagation()
                      e.stopImmediatePropagation()
                      return false
                    }
                  }
                  if (link.hasAttribute('target')) {
                    link.removeAttribute('target')
                  }
                })
              }
            }
          })
        })
      })

      // Observe the editor DOM for changes
      observer.observe(dom, {
        childList: true,
        subtree: true
      })

      dom.addEventListener('beforeinput', beforeInputHandler, true)
      dom.addEventListener('keydown', keydownHandler, true)
      dom.addEventListener('paste', pasteHandler, true)
      dom.addEventListener('drop', dropHandler, true)
      dom.addEventListener('mousedown', linkMouseDownHandler, true)
      dom.addEventListener('click', linkClickHandler, true)

    return () => {
        observer.disconnect()
        dom.removeEventListener('beforeinput', beforeInputHandler, true)
        dom.removeEventListener('keydown', keydownHandler, true)
        dom.removeEventListener('paste', pasteHandler, true)
        dom.removeEventListener('drop', dropHandler, true)
        dom.removeEventListener('mousedown', linkMouseDownHandler, true)
        dom.removeEventListener('click', linkClickHandler, true)
      }
    }
  }, [editor])

    // Content overflow prevention - SIMPLIFIED SOLUTION
    useEffect(() => {
      if (!editor) return

      const lockContentInBounds = () => {
        const pages = document.querySelectorAll('.ProseMirror .document-page')
        pages.forEach(page => {
          const contentArea = page.querySelector('.ProseMirror')
          if (contentArea) {
            // Lock the content area to A4 boundaries
            contentArea.style.position = 'absolute'
            contentArea.style.top = '20mm'
            contentArea.style.left = '20mm'
            contentArea.style.right = '20mm'
            contentArea.style.bottom = '20mm'
            contentArea.style.height = 'calc(297mm - 40mm)'
            contentArea.style.maxHeight = 'calc(297mm - 40mm)'
            contentArea.style.width = 'calc(210mm - 40mm)'
            contentArea.style.maxWidth = 'calc(210mm - 40mm)'
            contentArea.style.overflow = 'hidden'
            contentArea.style.contain = 'strict'
            contentArea.style.isolation = 'isolate'
            contentArea.style.clipPath = 'inset(0 0 0 0)'
            
            // Reset all child elements to stay within bounds
            const allChildren = contentArea.querySelectorAll('*')
            allChildren.forEach(el => {
              el.style.position = 'relative'
              el.style.top = '0'
              el.style.left = '0'
              el.style.transform = 'none'
              el.style.margin = '0'
              el.style.padding = '0'
              el.style.maxWidth = '100%'
              el.style.width = 'auto'
              el.style.height = 'auto'
              el.style.maxHeight = 'none'
              el.style.minHeight = '0'
              el.style.boxSizing = 'border-box'
              el.style.contain = 'layout'
              el.style.overflow = 'visible'
              el.style.display = 'block'
            })

            // Ensure first element starts at the top
            const firstChild = contentArea.querySelector('*:first-child')
            if (firstChild) {
              firstChild.style.position = 'relative'
              firstChild.style.top = '0'
              firstChild.style.left = '0'
              firstChild.style.transform = 'none'
              firstChild.style.margin = '0'
              firstChild.style.padding = '0'
              firstChild.style.maxWidth = '100%'
            }
          }
        })
      }

      // Run immediately
      lockContentInBounds()
      
      // Set up observer to monitor changes
      const observer = new MutationObserver(lockContentInBounds)
      const editorElement = document.querySelector('.ProseMirror')
      if (editorElement) {
        observer.observe(editorElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        })
      }

      return () => {
        observer.disconnect()
      }
    }, [editor])

  // Copy/Paste handling - prevent page structure duplication
  useEffect(() => {
    if (!editor) return

    // Global copy handler to prevent HTML copying
    const globalCopyHandler = (event) => {
      if (event.target.closest('.ProseMirror')) {
        event.preventDefault()
        event.stopPropagation()
        
        const selection = window.getSelection()
        if (selection.toString().trim()) {
          event.clipboardData.setData('text/plain', selection.toString())
        }
      }
    }

    // Handle Enter key and space key to prevent content shifting upward
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        // Immediate fix to prevent any shifting
        const pages = document.querySelectorAll('.ProseMirror .document-page')
        pages.forEach(page => {
          const contentArea = page.querySelector('.ProseMirror')
          if (contentArea) {
            // Lock content area to A4 boundaries
            contentArea.style.position = 'absolute'
            contentArea.style.top = '20mm'
            contentArea.style.left = '20mm'
            contentArea.style.right = '20mm'
            contentArea.style.bottom = '20mm'
            contentArea.style.height = 'calc(297mm - 40mm)'
            contentArea.style.maxHeight = 'calc(297mm - 40mm)'
            contentArea.style.width = 'calc(210mm - 40mm)'
            contentArea.style.maxWidth = 'calc(210mm - 40mm)'
            contentArea.style.overflow = 'hidden'
            contentArea.style.contain = 'strict'
            contentArea.style.isolation = 'isolate'
            contentArea.style.clipPath = 'inset(0 0 0 0)'
            
            // Reset all child elements
            const allChildren = contentArea.querySelectorAll('*')
            allChildren.forEach(el => {
              el.style.position = 'relative'
              el.style.top = '0'
              el.style.left = '0'
              el.style.transform = 'none'
              el.style.margin = '0'
              el.style.padding = '0'
              el.style.maxWidth = '100%'
              el.style.width = 'auto'
              el.style.height = 'auto'
              el.style.maxHeight = 'none'
              el.style.minHeight = '0'
              el.style.boxSizing = 'border-box'
              el.style.contain = 'layout'
              el.style.overflow = 'visible'
              el.style.display = 'block'
            })

            // Ensure first element starts at the top
            const firstChild = contentArea.querySelector('*:first-child')
            if (firstChild) {
              firstChild.style.position = 'relative'
              firstChild.style.top = '0'
              firstChild.style.left = '0'
              firstChild.style.transform = 'none'
              firstChild.style.margin = '0'
              firstChild.style.padding = '0'
              firstChild.style.maxWidth = '100%'
            }
          }
        })
        
        // Additional fix after DOM update
        setTimeout(() => {
          const pages = document.querySelectorAll('.ProseMirror .document-page')
          pages.forEach(page => {
            const contentArea = page.querySelector('.ProseMirror')
            if (contentArea) {
              // Re-apply absolute positioning
              contentArea.style.position = 'absolute'
              contentArea.style.top = '20mm'
              contentArea.style.left = '20mm'
              contentArea.style.right = '20mm'
              contentArea.style.bottom = '20mm'
              contentArea.style.height = 'calc(297mm - 40mm)'
              contentArea.style.maxHeight = 'calc(297mm - 40mm)'
              contentArea.style.width = 'calc(210mm - 40mm)'
              contentArea.style.maxWidth = 'calc(210mm - 40mm)'
              contentArea.style.overflow = 'hidden'
              contentArea.style.contain = 'strict'
              contentArea.style.isolation = 'isolate'
              contentArea.style.clipPath = 'inset(0 0 0 0)'

              // Re-apply child element locking
              const allChildren = contentArea.querySelectorAll('*')
              allChildren.forEach(el => {
                el.style.position = 'relative'
                el.style.top = '0'
                el.style.left = '0'
                el.style.transform = 'none'
                el.style.margin = '0'
                el.style.padding = '0'
                el.style.maxWidth = '100%'
                el.style.width = 'auto'
                el.style.height = 'auto'
                el.style.maxHeight = 'none'
                el.style.minHeight = '0'
                el.style.boxSizing = 'border-box'
                el.style.contain = 'layout'
                el.style.overflow = 'visible'
                el.style.display = 'block'
              })

              // Ensure first element starts at the top
              const firstChild = contentArea.querySelector('*:first-child')
              if (firstChild) {
                firstChild.style.position = 'relative'
                firstChild.style.top = '0'
                firstChild.style.left = '0'
                firstChild.style.transform = 'none'
                firstChild.style.margin = '0'
                firstChild.style.padding = '0'
                firstChild.style.maxWidth = '100%'
              }
            }
          })
        }, 50)
      }
    }

    // Add event listeners
    document.addEventListener('copy', globalCopyHandler, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('copy', globalCopyHandler, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [editor])

  // Header Functions
  const handleOpen = () => {
    fileInputRef.current?.click()
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      const title = documentTitle || 'Untitled Document';
      const defaultFileName = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50) || 'Untitled_Document';
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Save to database first (background operation)
      let savedDocumentId = documentId;
      if (documentId) {
        // Update existing document in background
        axios.put(`${apiUrl}/api/documents/${documentId}`, {
          title,
          content
        }, {
          timeout: 10000
        }).then(response => {
          savedDocumentId = response.data.document._id || response.data.document.id;
        }).catch(dbError => {
          console.warn('Database save failed:', dbError);
        });
      } else {
        // Create new document in background
        axios.post(`${apiUrl}/api/documents`, {
          title,
          content
        }, {
          timeout: 10000
        }).then(response => {
          savedDocumentId = response.data.document._id || response.data.document.id;
          setDocumentId(savedDocumentId);
        }).catch(dbError => {
          console.warn('Database save failed:', dbError);
        });
      }
      
      // Get DOCX file from backend
      const docxResponse = await axios.post(`${apiUrl}/api/export/docx`, {
        htmlContent: content,
        title: defaultFileName
      }, {
        responseType: 'blob',
        timeout: 30000
      });

      if (!docxResponse.data || docxResponse.data.size === 0) {
        throw new Error('Received empty DOCX file');
      }

      // Convert blob to File
      const docxBlob = new Blob([docxResponse.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const docxFile = new File([docxBlob], `${defaultFileName}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // Use File System Access API for modern browsers (like MS Word save dialog)
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${defaultFileName}.docx`,
            types: [{
              description: 'Word Document',
              accept: {
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
              }
            }]
          });

          // Write file to the selected location
          const writable = await fileHandle.createWritable();
          await writable.write(docxFile);
          await writable.close();

          // Show success message
          const saveIndicator = document.createElement('div');
          saveIndicator.textContent = 'Saved';
          saveIndicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
          document.body.appendChild(saveIndicator);
          setTimeout(() => {
            saveIndicator.remove();
          }, 2000);
        } catch (pickerError) {
          // User cancelled the save dialog
          if (pickerError.name === 'AbortError') {
            // User cancelled - don't show error
            return;
          }
          throw pickerError;
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        // Use download with a prompt-like behavior
        const url = window.URL.createObjectURL(docxBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${defaultFileName}.docx`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        // Show success message
        const saveIndicator = document.createElement('div');
        saveIndicator.textContent = 'Saved';
        saveIndicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
        document.body.appendChild(saveIndicator);
        setTimeout(() => {
          saveIndicator.remove();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      
      // Check if it's a connection error
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        alert('Backend server is not running!\n\nTo start the backend server:\n1. Open a terminal\n2. Navigate to the backend folder: cd backend\n3. Install dependencies: npm install\n4. Start the server: npm start\n\nOr from the root directory: npm run dev:backend');
      } else if (error.response && error.response.data) {
        // Show backend error message
        const errorMsg = error.response.data.message || error.response.data.error || 'Failed to save document';
        alert(`Error: ${errorMsg}`);
      } else if (error.name === 'AbortError') {
        // User cancelled - don't show error
        return;
      } else {
        alert(`Failed to save document: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const handleFind = () => {
    setShowFindReplace(true)
  }

  const handleSpellCheck = () => {
    setShowSpellCheck(true)
  }

  const handleExportPDF = async () => {
    if (!editor) {
      alert('Editor not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      const htmlContent = editor.getHTML();
      const title = documentTitle || 'Document';
      
      // Sanitize title for filename
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'Document';
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.post(`${apiUrl}/api/export/pdf`, {
        htmlContent,
        title
      }, {
        responseType: 'blob',
        timeout: 60000, // 60 second timeout for PDF generation
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Validate response
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty PDF file');
      }

      // Check if response is actually a PDF (check first bytes)
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sanitizedTitle}.pdf`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.textContent = 'PDF exported successfully!';
      successMsg.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000; font-size: 14px;';
      document.body.appendChild(successMsg);
      setTimeout(() => {
        successMsg.remove();
      }, 2000);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        alert('Backend server is not running!\n\nTo start the backend server:\n1. Open a terminal\n2. Navigate to the backend folder: cd backend\n3. Install dependencies: npm install\n4. Start the server: npm start\n\nOr from the root directory: npm run dev:backend');
      } else if (error.response && error.response.data) {
        // Try to show error message from backend
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            alert(`Error exporting to PDF: ${errorData.message || errorData.error || 'Unknown error'}`);
          } catch {
            alert('Error exporting to PDF. Please try again.');
          }
        };
        reader.readAsText(error.response.data);
      } else {
        alert(`Error exporting to PDF: ${error.message || 'Please make sure the backend server is running and try again.'}`);
      }
    }
  }

  const handleExportDOCX = async () => {
    if (!editor) {
      alert('Editor not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      // Get editor HTML content
      let htmlContent = editor.getHTML();
      
      // Collect all design-related style tags
      const designStyles = []
      
      // Get page color style
      const pageColorStyle = document.getElementById('design-page-color')
      if (pageColorStyle) {
        designStyles.push(`<style id="design-page-color">${pageColorStyle.textContent}</style>`)
      }
      
      // Get page borders style
      const pageBordersStyle = document.getElementById('design-page-borders')
      if (pageBordersStyle) {
        designStyles.push(`<style id="design-page-borders">${pageBordersStyle.textContent}</style>`)
      }
      
      // Get font set style
      const fontSetStyle = document.getElementById('design-font-set')
      if (fontSetStyle) {
        designStyles.push(`<style id="design-font-set">${fontSetStyle.textContent}</style>`)
      }
      
      // Get paragraph spacing style
      const paragraphSpacingStyle = document.getElementById('design-paragraph-spacing')
      if (paragraphSpacingStyle) {
        designStyles.push(`<style id="design-paragraph-spacing">${paragraphSpacingStyle.textContent}</style>`)
      }
      
      // Get color scheme style
      const colorSchemeStyle = document.getElementById('design-color-scheme')
      if (colorSchemeStyle) {
        designStyles.push(`<style id="design-color-scheme">${colorSchemeStyle.textContent}</style>`)
      }
      
      // Get theme style
      const themeStyle = document.getElementById('document-theme-styles')
      if (themeStyle) {
        designStyles.push(`<style id="document-theme-styles">${themeStyle.textContent}</style>`)
      }
      
      // Get effect style
      const effectStyle = document.getElementById('design-effect')
      if (effectStyle) {
        designStyles.push(`<style id="design-effect">${effectStyle.textContent}</style>`)
      }
      
      // Prepend design styles to HTML content
      if (designStyles.length > 0) {
        htmlContent = designStyles.join('\n') + '\n' + htmlContent
      }
      
      const title = documentTitle || 'Document';
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.post(`${apiUrl}/api/export/docx`, {
        htmlContent,
        title
      }, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        alert('Backend server is not running!\n\nTo start the backend server:\n1. Open a terminal\n2. Navigate to the backend folder: cd backend\n3. Install dependencies: npm install\n4. Start the server: npm start\n\nOr from the root directory: npm run dev:backend');
      } else {
        alert('Error exporting to DOCX. Please make sure the backend server is running and try again.');
      }
    }
  }

  // Editor Functions
  const handleEditorDoubleClick = (e) => {
    try {
      if (!editor || !editor.view) return
      const { view, state } = editor
      const { schema } = state

      // 1) Find document position closest to click
      const result = view.posAtCoords({ left: e.clientX, top: e.clientY })
      let pos = (result && typeof result.pos === 'number') ? result.pos : state.doc.content.size

      // 2) Check if we're clicking between pages
      const pageType = schema.nodes.pageBlock
      if (pageType) {
        let clickedBetweenPages = false
        let targetPage = null
        let pageCounter = -1
        
        // Find all pages and check if click is between them
        state.doc.descendants((node, nodePos) => {
          if (node.type === pageType) {
            pageCounter++
            const pageStart = nodePos + 1
            const pageEnd = nodePos + node.nodeSize - 1
            
            // Check if click is between this page and the next
            if (pos > pageEnd) {
              // Check if there's a next page
              let nextPageStart = null
              state.doc.descendants((nextNode, nextNodePos) => {
                if (nextNode.type === pageType && nextNodePos > nodePos) {
                  nextPageStart = nextNodePos + 1
                  return false // Stop searching
                }
                return true
              })
              
              if (nextPageStart && pos < nextPageStart) {
                clickedBetweenPages = true
                targetPage = node
                return false // Stop searching
              }
            }
          }
          return true
        })
        
        // If clicking between pages, don't add spaces - just position cursor at end of current page
        if (clickedBetweenPages && targetPage) {
          const targetPagePos = state.doc.resolve(state.doc.content.size).before()
          state.doc.descendants((node, nodePos) => {
            if (node === targetPage) {
              const pageEnd = nodePos + node.nodeSize - 1
              pos = pageEnd
              return false
            }
            return true
          })
        }
      }

      // 3) If clicked below content, append a paragraph so we can place caret there
      try {
        const dom = view.dom
        if (dom && dom.getBoundingClientRect) {
          const rect = dom.getBoundingClientRect()
          const yInside = e.clientY - rect.top
          const bottomThreshold = dom.scrollHeight - 8
          if (yInside > bottomThreshold) {
            const paragraph = schema.nodes.paragraph
            if (paragraph) {
              const trAppend = state.tr.insert(state.doc.content.size, paragraph.create())
              view.dispatch(trAppend)
              pos = editor.state.doc.content.size
            }
          }
        }
      } catch {}

      // 4) Ensure we are in a textblock; if not, insert a paragraph at the resolved position
      const $pos = state.doc.resolve(pos)
      if (!$pos.parent.isTextblock) {
        const paragraph = schema.nodes.paragraph
        if (paragraph) {
          const insertPos = pos
          const trIns = state.tr.insert(insertPos, paragraph.create())
          view.dispatch(trIns)
          // Move position inside the new paragraph
          pos = Math.min(editor.state.doc.content.size, insertPos + 1)
        }
      }

      // 5) Only add horizontal spacing if we're NOT between pages
      const isBetweenPages = pageType && (() => {
        let betweenPages = false
        state.doc.descendants((node, nodePos) => {
          if (node.type === pageType) {
            const pageEnd = nodePos + node.nodeSize - 1
            if (pos > pageEnd) {
              // Check if there's content after this page
              let hasContentAfter = false
              state.doc.descendants((nextNode, nextNodePos) => {
                if (nextNodePos > pageEnd) {
                  hasContentAfter = true
                  return false
                }
                return true
              })
              if (!hasContentAfter) {
                betweenPages = true
                return false
              }
            }
          }
          return true
        })
        return betweenPages
      })()

      if (!isBetweenPages) {
        // Roughly emulate horizontal placement by inserting NBSP up to clicked X
        try {
          const rect = view.dom.getBoundingClientRect()
          const offsetX = Math.max(0, e.clientX - rect.left - 16) // subtract a small left padding
          const approxCharPx = 7 // ~px per character for small prose
          const spacesCount = Math.max(0, Math.min(120, Math.round(offsetX / approxCharPx)))
          if (spacesCount > 0) {
            const nbsp = '\u00A0'.repeat(spacesCount)
            const trSpaces = editor.state.tr.insertText(nbsp, pos, pos)
            view.dispatch(trSpaces)
            pos = pos + spacesCount
          }
        } catch {}
      }

      // 6) Set selection at computed position and focus
      const Sel = editor.state.selection.constructor
      const sel = Sel.near(editor.state.doc.resolve(pos))
      const trSel = editor.state.tr.setSelection(sel)
      view.dispatch(trSel)
      view.focus()
    } catch {}
  }
  // Helper function to get button disabled state and className for viewing mode
  const getButtonProps = (baseClassName = '') => {
    const isDisabled = viewMode === 'viewing'
    return {
      disabled: isDisabled,
      className: `${baseClassName} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`.trim()
    }
  }

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run()
  }

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run()
  }

  const toggleUnderline = () => {
    editor?.chain().focus().toggleUnderline().run()
  }

  const toggleStrikethrough = () => {
    editor?.chain().focus().toggleStrike().run()
  }

  const alignLeft = () => {
    editor?.chain().focus().setTextAlign('left').alignImage('left').run()
  }

  const alignCenter = () => {
    editor?.chain().focus().setTextAlign('center').alignImage('center').run()
  }

  const alignRight = () => {
    editor?.chain().focus().setTextAlign('right').alignImage('right').run()
  }

  const alignJustify = () => {
    editor?.chain().focus().setTextAlign('justify').run()
  }

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run()
  }

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run()
  }

  const increaseIndent = () => {
    if (!editor) return
    // If in a list, increase nesting
    if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
      editor.chain().focus().sinkListItem('listItem').run()
      return
    }
    // Paragraph: bump margin-left by 18px (approx Word tab)
    const isTextStyleActive = editor.isActive('textStyle')
    const domSel = window.getSelection()
    let current = 0
    if (isTextStyleActive) {
      // Try to read existing margin-left from DOM selection container
      const node = domSel && domSel.anchorNode ? (domSel.anchorNode.nodeType === 1 ? domSel.anchorNode : domSel.anchorNode.parentElement) : null
      if (node && node.nodeType === 1) {
        const ml = window.getComputedStyle(node).marginLeft
        if (ml && ml.endsWith('px')) current = parseInt(ml, 10) || 0
      }
    }
    const next = Math.min(current + 18, 288)
    editor.chain().focus().setMark('textStyle', { marginLeft: `${next}px` }).run()
  }

  const decreaseIndent = () => {
    if (!editor) return
    if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
      editor.chain().focus().liftListItem('listItem').run()
      return
    }
    const domSel = window.getSelection()
    let current = 0
    const node = domSel && domSel.anchorNode ? (domSel.anchorNode.nodeType === 1 ? domSel.anchorNode : domSel.anchorNode.parentElement) : null
    if (node && node.nodeType === 1) {
      const ml = window.getComputedStyle(node).marginLeft
      if (ml && ml.endsWith('px')) current = parseInt(ml, 10) || 0
    }
    const next = Math.max(current - 18, 0)
    editor.chain().focus().setMark('textStyle', { marginLeft: next === 0 ? null : `${next}px` }).run()
  }

  const applyBulletStyle = (style) => {
    if (!editor) return
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run()
    }
    editor.chain().focus().updateAttributes('bulletList', { bulletStyle: style }).run()
    setShowBulletOptions(false)
  }

  const applyNumberStyle = (style) => {
    if (!editor) return
    if (!editor.isActive('orderedList')) {
      editor.chain().focus().toggleOrderedList().run()
    }
    editor.chain().focus().updateAttributes('orderedList', { numberStyle: style }).run()
    setShowNumberOptions(false)
  }

  // Paragraph Shading (MS Word-like)
  const setParagraphShading = (color) => {
    if (!editor) return
    setLastShadingColor(color)
    editor.chain().focus().command(({ state, tr }) => {
      const { selection, schema } = state
      const { from, to } = selection
      const applyShadingToBlock = (pos, node) => {
        const nodeTypeName = node.type.name
        if (nodeTypeName !== 'paragraph' && nodeTypeName !== 'heading') return
        const attrs = node.attrs || {}
        const currentStyle = attrs.style || ''
        // Remove any existing background styles
        const withoutBg = currentStyle
          .split(';')
          .map(s => s.trim())
          .filter(s => s && !s.startsWith('background:') && !s.startsWith('background-color:') && !s.startsWith('background-image:'))
          .join('; ')
        const newStyle = color === 'transparent'
          ? withoutBg
          : `${withoutBg}${withoutBg ? '; ' : ''}background-color: ${color}`
        tr.setNodeMarkup(pos, node.type, { ...attrs, style: newStyle || null })
      }
      state.doc.nodesBetween(from, to, (node, pos) => {
        // For text selections, operate on parent block
        if (node.isText) return
        if (node.isBlock) applyShadingToBlock(pos, node)
      })
      return true
    }).run()
    setShowShadingMenu(false)
  }

  const clearParagraphShading = () => setParagraphShading('transparent')

  const undo = () => {
    editor?.chain().focus().undo().run()
  }

  // Insert → Pages actions
  const insertPageBreak = () => {
    editor?.chain().focus().insertContent({ type: 'pageBreak' }).run()
  }

  const insertBlankPage = () => {
    if (!editor) return
    // Always append a full A4 page block as a new sibling at the very end
    const endPos = editor.state.doc.content.size
    editor.commands.insertContentAt(
      { from: endPos, to: endPos },
      { type: 'pageBlock', content: [{ type: 'paragraph' }] },
      { updateSelection: true }
    )
  }

  const insertCoverPage = () => {
    if (!editor) return
    
    // Create a proper cover page using the page block system
    const { state, view } = editor
    const { schema } = state
    
    // Create cover page content using proper schema nodes
    const coverContent = [
      schema.nodes.heading.create({ level: 1 }, schema.text('Document Title')),
      schema.nodes.paragraph.create(null, schema.text('Subtitle')),
      schema.nodes.paragraph.create(null, schema.text('Author Name')),
      schema.nodes.paragraph.create(null, schema.text(new Date().toLocaleDateString()))
    ]
    
    // Create a cover page block with proper styling
    const coverPageBlock = schema.nodes.pageBlock.create(
      { 
        class: 'cover-page-block',
        style: 'display: flex; flex-direction: column; justify-content: flex-start; align-items: center; text-align: center; background: #ffffff; min-height: 297mm; padding: 5mm 20mm 5mm 20mm; margin: 0; position: relative; box-sizing: border-box; width: 100%; font-family: Calibri, Arial, sans-serif;'
      },
      coverContent
    )
    
    // Insert cover page at the beginning
    editor.chain()
      .focus()
      .setTextSelection(0)
      .insertContentAt(0, coverPageBlock)
      .run()
  }

  const redo = () => {
    editor?.chain().focus().redo().run()
  }

  const insertImage = () => {
    setShowImageManager(true)
  }

  const insertLink = () => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    
    // Get current link if exists
    const linkMark = editor.getAttributes('link')
    const currentUrl = linkMark?.href || ''
    
    // Always use centered position like ImageManager
    setLinkEditorPosition({
      x: window.innerWidth / 2 - 150,
      y: window.innerHeight / 2 - 100
    })
    
    setShowLinkEditor(true)
  }

  const handleLinkApply = ({ text, url }) => {
    if (!editor || !url) return
    
    // Check if we're editing an existing link
    if (currentLinkRange.from !== null && currentLinkRange.to !== null) {
      // Editing existing link - replace the link with new text and URL
      const linkText = text || url
      editor.chain()
        .focus()
        .setTextSelection({ from: currentLinkRange.from, to: currentLinkRange.to })
        .deleteSelection()
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [{ type: 'link', attrs: { href: url } }]
        })
        .run()
      
      // Clear the link range
      setCurrentLinkRange({ from: null, to: null })
    } else {
      // New link or no stored range
      const { from, to } = editor.state.selection
      const hasSelection = from !== to
      
      if (hasSelection) {
        // If text is selected, replace it with link
        if (text) {
          editor.chain()
            .focus()
            .deleteRange({ from, to })
            .insertContent({
              type: 'text',
              text: text,
              marks: [{ type: 'link', attrs: { href: url } }]
            })
            .run()
        } else {
          // Use selected text with link
          editor.chain()
            .focus()
            .setLink({ href: url })
            .run()
        }
      } else {
        // Insert new text with link
        const linkText = text || url
        editor.chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkText,
            marks: [{ type: 'link', attrs: { href: url } }]
          })
          .run()
      }
    }
    
    setShowLinkEditor(false)
    setCurrentLinkText('')
    setCurrentLinkHref('')
  }

  const insertBookmark = () => {
    if (!editor) return
    
    const bookmarkName = window.prompt('Enter bookmark name:')
    if (bookmarkName && bookmarkName.trim()) {
      // Create a bookmark element (using a span with data attribute)
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to) || bookmarkName
      
      editor.chain()
        .focus()
        .insertContent({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: selectedText,
              marks: [{ type: 'link', attrs: { href: `#${bookmarkName}`, class: 'bookmark' } }]
            }
          ],
          attrs: { 'data-bookmark': bookmarkName }
        })
        .run()
    }
  }

  const insertCrossReference = () => {
    if (!editor) return
    
    const refType = window.prompt('Enter reference type (e.g., "Figure 1", "Table 1", "Section 1"):')
    if (refType && refType.trim()) {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to) || refType
      
      editor.chain()
        .focus()
        .insertContent({
          type: 'text',
          text: selectedText,
          marks: [{ type: 'link', attrs: { href: `#${refType.toLowerCase().replace(/\s+/g, '-')}`, class: 'cross-reference' } }]
        })
        .run()
    }
  }

  const insertTable = () => {
    setShowTableManager(true)
  }

  // Quick Tables Templates
  const quickTableTemplates = [
    // Calendar Templates
    {
      id: 'Calendar1',
      category: 'Calendar',
      name: 'Calendar 1',
      rows: 6,
      cols: 7,
      header: true,
      cellPlaceholders: [
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
      ],
      styles: {
        headerBg: '#D9E1F2',
        borderColor: '#7F7F7F',
        alternateRowShading: null,
        className: 'table-calendar1'
      }
    },
    {
      id: 'Calendar2',
      category: 'Calendar',
      name: 'Calendar 2',
      rows: 6,
      cols: 7,
      header: true,
      cellPlaceholders: [
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
      ],
      styles: {
        headerBg: '#E7E6E6',
        borderColor: '#000000',
        alternateRowShading: '#F2F2F2',
        className: 'table-calendar2'
      }
    },
    {
      id: 'Calendar3',
      category: 'Calendar',
      name: 'Calendar 3',
      rows: 6,
      cols: 7,
      header: true,
      cellPlaceholders: [
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
      ],
      styles: {
        headerBg: '#4B86C2',
        headerTextColor: '#FFFFFF',
        borderColor: '#4B86C2',
        alternateRowShading: '#E7F3FF',
        className: 'table-calendar3'
      }
    },
    {
      id: 'Calendar4',
      category: 'Calendar',
      name: 'Calendar 4',
      rows: 6,
      cols: 7,
      header: true,
      cellPlaceholders: [
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
      ],
      styles: {
        headerBg: '#F2F2F2',
        borderColor: '#D9D9D9',
        alternateRowShading: '#FAFAFA',
        className: 'table-calendar4'
      }
    },
    // Double Table Template
    {
      id: 'DoubleTable1',
      category: 'Double Table',
      name: 'Double Table',
      rows: 4,
      cols: 4,
      header: true,
      cellPlaceholders: [
        ['Column 1', 'Column 2', 'Column 3', 'Column 4'],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', '']
      ],
      styles: {
        headerBg: '#D9E1F2',
        borderColor: '#7F7F7F',
        className: 'table-doubletable1',
        splitAt: 2
      }
    },
    // Matrix Templates
    {
      id: 'Matrix1',
      category: 'Matrix',
      name: 'Matrix 1',
      rows: 4,
      cols: 4,
      header: true,
      cellPlaceholders: [
        ['', 'Header 1', 'Header 2', 'Header 3'],
        ['Row 1', '', '', ''],
        ['Row 2', '', '', ''],
        ['Row 3', '', '', '']
      ],
      styles: {
        headerBg: '#D9E1F2',
        firstColumnBg: '#D9E1F2',
        borderColor: '#7F7F7F',
        className: 'table-matrix1'
      }
    },
    {
      id: 'Matrix2',
      category: 'Matrix',
      name: 'Matrix 2',
      rows: 5,
      cols: 5,
      header: true,
      cellPlaceholders: [
        ['', 'Column 1', 'Column 2', 'Column 3', 'Column 4'],
        ['Row 1', '', '', '', ''],
        ['Row 2', '', '', '', ''],
        ['Row 3', '', '', '', ''],
        ['Row 4', '', '', '', '']
      ],
      styles: {
        headerBg: '#F2F2F2',
        firstColumnBg: '#F2F2F2',
        borderColor: '#000000',
        alternateRowShading: '#FAFAFA',
        className: 'table-matrix2'
      }
    },
    // Tabular List Templates
    {
      id: 'TabularList1',
      category: 'Tabular List',
      name: 'Tabular List 1',
      rows: 5,
      cols: 4,
      header: true,
      cellPlaceholders: [
        ['Header 1', 'Header 2', 'Header 3', 'Header 4'],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', '']
      ],
      styles: {
        headerBg: '#F2F2F2',
        borderColor: '#000000',
        bandedRows: true,
        className: 'table-tabularlist1'
      }
    },
    {
      id: 'TabularList2',
      category: 'Tabular List',
      name: 'Tabular List 2',
      rows: 6,
      cols: 3,
      header: true,
      cellPlaceholders: [
        ['Item', 'Description', 'Value'],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      styles: {
        headerBg: '#D9E1F2',
        borderColor: '#7F7F7F',
        bandedRows: true,
        className: 'table-tabularlist2'
      }
    },
    {
      id: 'TabularList3',
      category: 'Tabular List',
      name: 'Tabular List 3',
      rows: 4,
      cols: 5,
      header: true,
      cellPlaceholders: [
        ['Name', 'Type', 'Date', 'Status', 'Notes'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
      ],
      styles: {
        headerBg: '#E7E6E6',
        borderColor: '#000000',
        bandedRows: true,
        className: 'table-tabularlist3'
      }
    }
  ]

  // Helper function to get the table at cursor position or the last table
  const getTableAtCursor = () => {
    if (!editor) return null
    
    const { state } = editor
    const { selection } = state
    const { $from } = selection
    
    // Find the table node at the cursor position
    let tableNode = null
    let tablePos = null
    
    // Walk up the node tree to find the table
    let depth = $from.depth
    while (depth >= 0) {
      const node = $from.node(depth)
      if (node.type.name === 'table') {
        tableNode = node
        tablePos = $from.start(depth) - 1
        break
      }
      depth--
    }
    
    // If no table found at cursor, try to find it by searching from selection
    if (!tableNode) {
      state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
        if (node.type.name === 'table') {
          const start = pos + 1
          const end = pos + node.nodeSize - 1
          if (selection.from >= start && selection.from <= end) {
            tableNode = node
            tablePos = pos
            return false // Stop searching
          }
        }
        return true
      })
    }
    
    // Get the DOM element for this specific table
    let tableElement = null
    if (tablePos !== null && editor.view) {
      const domAtPos = editor.view.domAtPos(tablePos + 1)
      if (domAtPos) {
        // Find the table element in the DOM
        let element = domAtPos.node.nodeType === 3 ? domAtPos.node.parentElement : domAtPos.node
        while (element && element.tagName !== 'TABLE') {
          element = element.parentElement
        }
        if (element && element.tagName === 'TABLE') {
          tableElement = element
        }
      }
    }
    
    // Fallback: if we still can't find it, get the last table (most recently inserted)
    if (!tableElement) {
      const allTables = document.querySelectorAll('.ProseMirror table')
      if (allTables.length > 0) {
        tableElement = allTables[allTables.length - 1] // Get the last table
      }
    }
    
    return tableElement
  }

  const insertQuickTable = (template) => {
    if (!editor) return
    
    const { rows, cols, header, cellPlaceholders, styles } = template
    
    // Insert table using TipTap's table extension
    editor.chain().focus().insertTable({
      rows: rows,
      cols: cols,
      withHeaderRow: header
    }).run()
    
    // Wait for table to be inserted, then style it
    setTimeout(() => {
      // Get the table at cursor position (the newly inserted one)
      const tableElement = getTableAtCursor()
      
      if (tableElement) {
        // Apply template class
        tableElement.classList.add(styles.className)
        tableElement.style.borderCollapse = 'collapse'
        tableElement.style.width = '100%'
        
        // Populate header row if specified
        if (header && cellPlaceholders && cellPlaceholders.length > 0) {
          const headerRow = tableElement.querySelector('thead tr') || tableElement.querySelector('tr')
          if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th, td')
            headerCells.forEach((cell, index) => {
              if (cellPlaceholders[0] && cellPlaceholders[0][index]) {
                cell.textContent = cellPlaceholders[0][index]
              }
              // Apply header styling
              cell.style.backgroundColor = styles.headerBg || '#F2F2F2'
              cell.style.color = styles.headerTextColor || '#000000'
              cell.style.fontWeight = 'bold'
              cell.style.padding = '8px'
              cell.style.border = `1px solid ${styles.borderColor || '#000000'}`
              // Ensure it's a th element
              if (cell.tagName.toLowerCase() === 'td') {
                const th = document.createElement('th')
                th.innerHTML = cell.innerHTML
                th.style.cssText = cell.style.cssText
                th.className = cell.className
                cell.parentNode.replaceChild(th, cell)
              }
            })
          }
        }
        
        // Populate body rows
        const bodyRows = tableElement.querySelectorAll('tbody tr, tr:not(:first-child)')
        const startRow = header ? 1 : 0
        bodyRows.forEach((row, rowIndex) => {
          const actualRowIndex = header ? rowIndex : rowIndex + 1
          
          // Apply banded row styling
          if (styles.bandedRows && actualRowIndex % 2 === 1) {
            row.style.backgroundColor = styles.alternateRowShading || '#F7F7F7'
          }
          
          const cells = row.querySelectorAll('td, th')
          cells.forEach((cell, colIndex) => {
            // Populate cell content
            if (cellPlaceholders && cellPlaceholders[actualRowIndex] && cellPlaceholders[actualRowIndex][colIndex]) {
              cell.textContent = cellPlaceholders[actualRowIndex][colIndex]
            }
            
            // Apply cell styling
            cell.style.padding = '8px'
            cell.style.border = `1px solid ${styles.borderColor || '#000000'}`
            
            // Apply first column styling for matrix templates
            if (colIndex === 0 && styles.firstColumnBg && actualRowIndex > 0) {
              cell.style.backgroundColor = styles.firstColumnBg
              cell.style.fontWeight = 'bold'
              // Convert to th if needed
              if (cell.tagName.toLowerCase() === 'td') {
                const th = document.createElement('th')
                th.innerHTML = cell.innerHTML
                th.style.cssText = cell.style.cssText
                th.className = cell.className
                cell.parentNode.replaceChild(th, cell)
              }
            }
          })
        })
      }
    }, 100)
    
    // Close Quick Tables modal
    setShowQuickTables(false)
  }

  // Drawing functions
  const drawStroke = useCallback((stroke, ctx) => {
    if (!stroke || !stroke.points || stroke.points.length === 0) return

    const { tool, color, thickness, baseThickness, points, pointsWithThickness } = stroke

    ctx.save()

    // Tool-specific settings
    switch (tool) {
      case 'pen':
        ctx.globalAlpha = 1.0
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalCompositeOperation = 'source-over'
        ctx.shadowBlur = 0
        ctx.shadowColor = 'transparent'
        break
      case 'pencil':
        ctx.globalAlpha = 0.75
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalCompositeOperation = 'multiply'
        ctx.shadowBlur = 0.3
        ctx.shadowColor = color
        break
      case 'highlighter':
        ctx.globalAlpha = 0.4
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.globalCompositeOperation = 'multiply'
        ctx.shadowBlur = 0
        ctx.shadowColor = 'transparent'
        break
      case 'fountainPen':
        ctx.globalAlpha = 1.0
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalCompositeOperation = 'source-over'
        ctx.shadowBlur = 1.5
        ctx.shadowColor = color
        break
    }

    ctx.strokeStyle = color
    ctx.lineWidth = baseThickness || thickness || 2

    if (tool === 'fountainPen' && pointsWithThickness && pointsWithThickness.length > 0) {
      // Draw segment by segment with variable thickness
      for (let i = 0; i < pointsWithThickness.length - 1; i++) {
        const current = pointsWithThickness[i]
        const next = pointsWithThickness[i + 1]
        if (!current || !next || typeof current.x !== 'number' || typeof current.y !== 'number') continue

        ctx.lineWidth = current.thickness || baseThickness || thickness
        ctx.beginPath()
        ctx.moveTo(current.x, current.y)
        ctx.lineTo(next.x, next.y)
        ctx.stroke()
      }
    } else {
      // Standard drawing for other tools
      ctx.beginPath()
      const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number')
      if (validPoints.length > 0) {
        ctx.moveTo(validPoints[0].x, validPoints[0].y)
        for (let i = 1; i < validPoints.length; i++) {
          ctx.lineTo(validPoints[i].x, validPoints[i].y)
        }
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [])

  const redrawCanvas = useCallback((strokesToDraw = null) => {
    const canvas = drawCanvasRef.current
    const ctx = drawContextRef.current
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const strokes = strokesToDraw !== null ? strokesToDraw : drawStrokes
    strokes.forEach(stroke => {
      drawStroke(stroke, ctx)
    })
  }, [drawStrokes, drawStroke])

  const initializeDrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const editorElement = document.querySelector('.ProseMirror') || editor?.view.dom
    if (!editorElement) return

    const rect = editorElement.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    drawContextRef.current = ctx

    redrawCanvas()
  }, [redrawCanvas, editor])

  // Track the current page being drawn on
  const currentPageRectRef = useRef(null)

  // Find which page contains a given point
  const findPageAtPoint = useCallback((clientX, clientY) => {
    const pages = document.querySelectorAll('.ProseMirror .document-page')
    for (const page of pages) {
      const rect = page.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right && 
          clientY >= rect.top && clientY <= rect.bottom) {
        return rect
      }
    }
    return null
  }, [])

  // Clip point to page boundaries
  const clipPointToPage = useCallback((point, pageRect, canvasRect) => {
    if (!pageRect || !canvasRect) return null
    
    // Convert page rect boundaries to canvas coordinates (accounting for DPR)
    const dpr = point.dpr || window.devicePixelRatio || 1
    const pageLeft = (pageRect.left - canvasRect.left) * dpr
    const pageTop = (pageRect.top - canvasRect.top) * dpr
    const pageRight = (pageRect.right - canvasRect.left) * dpr
    const pageBottom = (pageRect.bottom - canvasRect.top) * dpr
    
    // Clip the point to page boundaries
    const clippedX = Math.max(pageLeft, Math.min(pageRight, point.x))
    const clippedY = Math.max(pageTop, Math.min(pageBottom, point.y))
    
    return { x: clippedX, y: clippedY, dpr: point.dpr, clientX: point.clientX, clientY: point.clientY }
  }, [])

  const getPointFromEvent = useCallback((e) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return null

    const canvasRect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    // Convert to canvas coordinates
    const x = (clientX - canvasRect.left) * dpr
    const y = (clientY - canvasRect.top) * dpr
    
    const point = { x, y, dpr, clientX, clientY }
    
    // If we have a current page rect, clip to it
    if (currentPageRectRef.current) {
      return clipPointToPage(point, currentPageRectRef.current, canvasRect)
    }
    
    return point
  }, [clipPointToPage])

  const startDrawing = useCallback((e) => {
    if (activeTab !== 'Draw') return

    e.preventDefault()
    e.stopPropagation()

    // Find which page we're clicking on
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    const pageRect = findPageAtPoint(clientX, clientY)
    
    // Only allow drawing if clicking within a page
    if (!pageRect) {
      return
    }
    
    // Store the page rect for this drawing session
    currentPageRectRef.current = pageRect

    const point = getPointFromEvent(e)
    if (!point) return

    setIsDrawing(true)
    document.body.style.userSelect = 'none'

    const stroke = {
      tool: drawTool,
      color: drawColor,
      thickness: drawThickness,
      baseThickness: drawThickness,
      points: [{ x: point.x / point.dpr, y: point.y / point.dpr }],
      pointsWithThickness: drawTool === 'fountainPen' ? [{ x: point.x / point.dpr, y: point.y / point.dpr, thickness: drawThickness }] : null
    }

    currentStrokeRef.current = stroke
    lastPointRef.current = { x: point.x / point.dpr, y: point.y / point.dpr }
    drawSpeedRef.current = 0

    const ctx = drawContextRef.current
    if (!ctx) return

    ctx.save()
    ctx.strokeStyle = drawColor
    ctx.lineWidth = drawThickness
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(point.x / point.dpr, point.y / point.dpr)
  }, [activeTab, drawTool, drawColor, drawThickness, getPointFromEvent, findPageAtPoint])

  const draw = useCallback((e) => {
    if (!isDrawing || !currentStrokeRef.current || activeTab !== 'Draw') return

    e.preventDefault()
    e.stopPropagation()

    // If we don't have a page rect, stop drawing
    if (!currentPageRectRef.current) {
      setIsDrawing(false)
      return
    }

    // Check if mouse is still within the page boundaries
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    const pageRect = currentPageRectRef.current
    
    // If mouse moved completely outside the page, stop drawing
    if (clientX < pageRect.left || clientX > pageRect.right ||
        clientY < pageRect.top || clientY > pageRect.bottom) {
      // Stop drawing but don't save the stroke if it's too short
      setIsDrawing(false)
      document.body.style.userSelect = ''
      currentPageRectRef.current = null
      return
    }

    const point = getPointFromEvent(e)
    if (!point) return

    const normalizedPoint = { x: point.x / point.dpr, y: point.y / point.dpr }
    const ctx = drawContextRef.current
    if (!ctx) return

    // Calculate speed for fountain pen
    if (lastPointRef.current) {
      const dx = normalizedPoint.x - lastPointRef.current.x
      const dy = normalizedPoint.y - lastPointRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const timeDelta = 16 // ~60fps
      drawSpeedRef.current = distance / timeDelta
    }

    // Apply tool-specific settings
    switch (drawTool) {
      case 'pen':
        ctx.globalAlpha = 1.0
        ctx.globalCompositeOperation = 'source-over'
        ctx.shadowBlur = 0
        break
      case 'pencil':
        ctx.globalAlpha = 0.75
        ctx.globalCompositeOperation = 'multiply'
        ctx.shadowBlur = 0.3
        ctx.shadowColor = drawColor
        break
      case 'highlighter':
        ctx.globalAlpha = 0.4
        ctx.globalCompositeOperation = 'multiply'
        ctx.lineCap = 'square'
        ctx.shadowBlur = 0
        break
      case 'fountainPen':
        ctx.globalAlpha = 1.0
        ctx.globalCompositeOperation = 'source-over'
        ctx.shadowBlur = 1.5
        ctx.shadowColor = drawColor
        // Dynamic thickness based on speed
        const dynamicThickness = Math.max(1, drawThickness - drawSpeedRef.current * 0.5)
        ctx.lineWidth = dynamicThickness
        if (currentStrokeRef.current.pointsWithThickness) {
          currentStrokeRef.current.pointsWithThickness.push({ ...normalizedPoint, thickness: dynamicThickness })
        }
        break
    }

    ctx.lineTo(normalizedPoint.x, normalizedPoint.y)
    ctx.stroke()

    currentStrokeRef.current.points.push(normalizedPoint)
    lastPointRef.current = normalizedPoint
  }, [isDrawing, drawTool, drawColor, drawThickness, activeTab, getPointFromEvent])

  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return

    e.preventDefault()
    e.stopPropagation()

    setIsDrawing(false)
    document.body.style.userSelect = ''
    
    // Clear the page rect reference
    currentPageRectRef.current = null

    // Save the stroke data
    const strokeToSave = currentStrokeRef.current
    
    // Restore context to clean up the saved state (we'll redraw everything anyway)
    const ctx = drawContextRef.current
    if (ctx) {
      ctx.restore()
    }
    
    if (strokeToSave && strokeToSave.points && strokeToSave.points.length > 0) {
      // Filter out invalid points and create a clean copy of the stroke
      const validPoints = strokeToSave.points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number')
      
      if (validPoints.length > 0) {
        // Create a proper copy of the stroke to save
        const strokeCopy = {
          tool: strokeToSave.tool,
          color: strokeToSave.color,
          thickness: strokeToSave.thickness,
          baseThickness: strokeToSave.baseThickness,
          points: [...validPoints],
          pointsWithThickness: strokeToSave.pointsWithThickness ? [...strokeToSave.pointsWithThickness] : null
        }
        
        // Save stroke and redraw immediately to ensure it persists
        setDrawStrokes(prev => {
          const newStrokes = [...prev, strokeCopy]
          // Redraw synchronously with all strokes including the new one
          // Access canvas and context directly
          const canvas = drawCanvasRef.current
          const ctx = drawContextRef.current
          if (canvas && ctx) {
            // Clear and redraw all strokes including the new one
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            // Draw all strokes
            newStrokes.forEach(stroke => {
              if (stroke && stroke.points && stroke.points.length > 0) {
                drawStroke(stroke, ctx)
              }
            })
          }
          return newStrokes
        })
        setDrawUndoStack([]) // Clear redo stack on new stroke
      }
    }

    currentStrokeRef.current = null
    lastPointRef.current = null
    drawSpeedRef.current = 0
  }, [isDrawing, drawStroke])

  const undoDraw = useCallback(() => {
    if (drawStrokes.length > 0) {
      const validStrokes = drawStrokes.filter(s => s && s.points && s.points.length > 0)
      if (validStrokes.length > 0) {
        const lastStroke = validStrokes[validStrokes.length - 1]
        setDrawStrokes(prev => prev.filter((_, idx) => idx < prev.length - 1))
        setDrawUndoStack(prev => [...prev, lastStroke])
        setDrawRedoStack([])
      }
    }
  }, [drawStrokes])

  const redoDraw = useCallback(() => {
    if (drawUndoStack.length > 0) {
      const validUndone = drawUndoStack.filter(s => s && s.points && s.points.length > 0)
      if (validUndone.length > 0) {
        const lastUndone = validUndone[validUndone.length - 1]
        setDrawStrokes(prev => [...prev, lastUndone])
        setDrawUndoStack(prev => prev.filter((_, idx) => idx < prev.length - 1))
      }
    }
  }, [drawUndoStack])

  const clearAllDrawings = useCallback(() => {
    setDrawStrokes([])
    setDrawUndoStack([])
    setDrawRedoStack([])
    const canvas = drawCanvasRef.current
    const ctx = drawContextRef.current
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  // Initialize canvas when Draw tab becomes active
  useEffect(() => {
    if (activeTab === 'Draw') {
      setTimeout(() => {
        initializeDrawCanvas()
      }, 100)
    }
  }, [activeTab, initializeDrawCanvas])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (activeTab === 'Draw') {
        initializeDrawCanvas()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab, initializeDrawCanvas])

  // Redraw canvas when strokes change
  useEffect(() => {
    if (activeTab === 'Draw') {
      const validStrokes = drawStrokes.filter(s => s && s.points && s.points.length > 0)
      if (validStrokes.length === 0) {
        const canvas = drawCanvasRef.current
        const ctx = drawContextRef.current
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      } else {
        redrawCanvas()
      }
    }
  }, [drawStrokes, activeTab, redrawCanvas])

  // Apply table style function
  const applyTableStyle = (styleName) => {
    if (!editor) return
    
    const { state } = editor
    const { from } = state.selection
    
    // Helper function to find the table that contains the cursor position
    const findTableAtPosition = (pos) => {
      let tableFound = null
      let tablePos = -1
      
      // Find table that contains this position
      state.doc.nodesBetween(0, state.doc.content.size, (node, nodePos) => {
        if (node.type.name === 'table') {
          const start = nodePos + 1
          const end = nodePos + node.nodeSize - 1
          if (pos >= start && pos <= end) {
            tableFound = node
            tablePos = nodePos
          }
        }
      })
      
      return tableFound ? { node: tableFound, pos: tablePos } : null
    }
    
    // Helper function to find the last table in document
    const findLastTable = () => {
      let lastTable = null
      let lastTablePos = -1
      
      state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
        if (node.type.name === 'table') {
          if (pos > lastTablePos) {
            lastTablePos = pos
            lastTable = node
          }
        }
      })
      
      return lastTable ? { node: lastTable, pos: lastTablePos } : null
    }
    
    // Try to find table at cursor position
    let targetTable = findTableAtPosition(from)
    
    // If not found, find the last table in document
    if (!targetTable) {
      targetTable = findLastTable()
    }
    
    // If we found a table, apply style to it
    if (targetTable) {
      // Get all tables in the document and their positions
      const tablePositions = []
      state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
        if (node.type.name === 'table') {
          tablePositions.push(pos)
        }
      })
      
      // Find the index of our target table
      const targetTableIndex = tablePositions.findIndex(pos => pos === targetTable.pos)
      
      // Get the corresponding DOM table element
      const editorElement = editor.view.dom
      const tables = editorElement.querySelectorAll('table')
      
      let targetTableElement = null
      if (targetTableIndex >= 0 && tables[targetTableIndex]) {
        // Match by index
        targetTableElement = tables[targetTableIndex]
      } else if (tables.length > 0) {
        // Check if we're looking for the last table
        const lastTableInfo = findLastTable()
        const isLastTable = lastTableInfo && targetTable.pos === lastTableInfo.pos
        if (isLastTable) {
          targetTableElement = tables[tables.length - 1]
        } else if (tables.length === 1) {
          // Only one table, use it
          targetTableElement = tables[0]
        }
      }
      
      if (targetTableElement) {
        // Remove all existing table style classes
        targetTableElement.className = targetTableElement.className.replace(/table-style-\w+-\d+/g, '').trim()
        // Add new style class
        targetTableElement.classList.add(`table-style-${styleName}`)
        
        // Apply table style options
        if (tableStyleOptions.headerRow) {
          targetTableElement.classList.add('table-header-row')
        } else {
          targetTableElement.classList.remove('table-header-row')
        }
        
        if (tableStyleOptions.bandedRows) {
          targetTableElement.classList.add('table-banded-rows')
        } else {
          targetTableElement.classList.remove('table-banded-rows')
        }
        
        if (tableStyleOptions.firstColumn) {
          targetTableElement.classList.add('table-first-column')
        } else {
          targetTableElement.classList.remove('table-first-column')
        }
        
        if (tableStyleOptions.lastColumn) {
          targetTableElement.classList.add('table-last-column')
        } else {
          targetTableElement.classList.remove('table-last-column')
        }
        
        if (tableStyleOptions.bandedColumns) {
          targetTableElement.classList.add('table-banded-columns')
        } else {
          targetTableElement.classList.remove('table-banded-columns')
        }
      }
    }
    
    setTableStyle(styleName.split('-')[0]) // Set category (plain, grid, list)
    setShowTableStylesPopup(false)
  }

  const changeFontFamily = (fontFamily) => {
    editor?.chain().focus().setFontFamily(fontFamily).run()
  }

  const changeFontSize = (fontSize) => {
    if (!editor) return
    const raw = typeof fontSize === 'string' ? fontSize : String(fontSize)
    const normalized = /^\d+$/.test(raw) ? `${raw}px` : raw
    editor.chain().focus().setFontSize(normalized).run()
  }

  const toggleSubscript = () => {
    editor?.chain().focus().toggleSubscript().run()
  }

  const toggleSuperscript = () => {
    editor?.chain().focus().toggleSuperscript().run()
  }

  const toggleSmallCaps = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      const original = editor.state.doc.textBetween(from, to)
      const map = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
        n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
      }
      const transformed = original
        .split('')
        .map(ch => {
          const lower = ch.toLowerCase()
          if (map[lower]) return map[lower]
          // digits/punct/spaces remain
          return ch
        })
        .join('')
      editor.chain().focus().deleteRange({ from, to }).insertContent(transformed).run()
    } else {
      // no selection: enable small caps style for next input
      editor.chain().focus().setMark('textStyle', { smallCaps: 'small-caps', allCaps: null }).run()
    }
  }

  const toggleAllCaps = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      const original = editor.state.doc.textBetween(from, to)
      editor.chain().focus().deleteRange({ from, to }).insertContent(original.toUpperCase()).run()
    } else {
      editor.chain().focus().setMark('textStyle', { allCaps: 'uppercase', smallCaps: null }).run()
    }
  }

  const toggleHiddenText = () => {
    if (!editor) return
    editor.chain().focus().toggleHiddenText().run()
  }

  const toggleShowHiddenText = () => {
    setShowHiddenText(!showHiddenText)
    // Apply CSS to show/hide hidden text globally
    const style = document.getElementById('hidden-text-style')
    if (style) {
      style.remove()
    } else {
      const newStyle = document.createElement('style')
      newStyle.id = 'hidden-text-style'
      if (showHiddenText) {
        // Hide hidden text
        newStyle.textContent = `
          .ProseMirror span[style*="color: transparent"] {
            color: transparent !important;
            background: transparent !important;
            font-size: 0 !important;
          }
        `
      } else {
        // Show hidden text with a different style
        newStyle.textContent = `
          .ProseMirror span[style*="color: transparent"] {
            color: #666 !important;
            background: #f0f0f0 !important;
            font-size: inherit !important;
            border: 1px dashed #ccc !important;
            padding: 1px 2px !important;
          }
        `
      }
      document.head.appendChild(newStyle)
    }
  }

  const changeTextColor = (color) => {
    setTextColor(color)
    editor?.chain().focus().setColor(color).run()
  }

  const changeHighlightColor = (color) => {
    setHighlightColor(color)
    editor?.chain().focus().setHighlight({ color }).run()
  }

  const applyStyle = (style) => {
    if (!editor) return
    const chain = editor.chain().focus()
    switch (style) {
      case 'normal':
        chain.setParagraph().unsetAllMarks().run()
        break
      case 'noSpacing':
        // No Spacing: Calibri 11pt, line-height 1.0, 0pt spacing before/after, left aligned
        chain.setParagraph()
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontFamily: 'Calibri', 
            fontSize: '11pt', 
            lineHeight: '1.0',
            marginTop: '0pt',
            marginBottom: '0pt'
          })
          .setTextAlign('left')
          .run()
        break
      case 'heading1':
        // Heading 1: Calibri Light 16pt Bold, Dark Blue, 12pt before/0pt after, left aligned
        chain.setNode('heading', { level: 1 })
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontFamily: 'Calibri Light', 
            fontSize: '16pt', 
            fontWeight: 'bold',
            lineHeight: '1.0',
            marginTop: '12pt',
            marginBottom: '0pt'
          })
          .setTextAlign('left')
          .run()
        break
      case 'heading2':
        // Heading 2: Calibri Light 13pt Bold, Medium Blue, 2pt before/0pt after, left aligned
        chain.setNode('heading', { level: 2 })
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontFamily: 'Calibri Light', 
            fontSize: '13pt', 
            fontWeight: 'bold',
            lineHeight: '1.0',
            marginTop: '2pt',
            marginBottom: '0pt'
          })
          .setTextAlign('left')
          .run()
        break
      case 'heading3':
        // Heading 3: Calibri Light 12pt Bold, Grayish Blue, 2pt before/0pt after, left aligned
        chain.setNode('heading', { level: 3 })
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontFamily: 'Calibri Light', 
            fontSize: '12pt', 
            fontWeight: 'bold',
            lineHeight: '1.0',
            marginTop: '2pt',
            marginBottom: '0pt'
          })
          .setTextAlign('left')
          .run()
        break
      case 'title':
        chain.setNode('heading', { level: 1 }).unsetAllMarks().setMark('textStyle', { fontSize: '28px', fontWeight: '700' }).setTextAlign('center').run()
        break
      case 'subtitle':
        chain.setNode('heading', { level: 2 }).unsetAllMarks().setMark('textStyle', { fontSize: '20px', fontWeight: '600', color: '#4b5563' }).setTextAlign('center').run()
        break
      default:
        break
    }
  }

  const applyQuickStyle = (style) => {
    if (!editor) return
    const chain = editor.chain().focus()
    switch (style) {
      case 'quote':
        // Quote: Italic, left indent, smaller font
        chain.setParagraph()
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontStyle: 'italic',
            fontSize: '10pt',
            marginLeft: '20px',
            marginRight: '20px',
            color: '#6b7280'
          })
          .setTextAlign('left')
          .run()
        break
      case 'caption':
        // Caption: Small font, centered, gray
        chain.setParagraph()
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontSize: '9pt',
            color: '#6b7280'
          })
          .setTextAlign('center')
          .run()
        break
      case 'intenseQuote':
        // Intense Quote: Bold, larger indent, larger font
        chain.setParagraph()
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontWeight: 'bold',
            fontSize: '12pt',
            marginLeft: '40px',
            marginRight: '40px',
            color: '#374151'
          })
          .setTextAlign('left')
          .run()
        break
      case 'listParagraph':
        // List Paragraph: Standard paragraph with slight indent
        chain.setParagraph()
          .unsetAllMarks()
          .setMark('textStyle', { 
            fontSize: '11pt',
            marginLeft: '10px'
          })
          .setTextAlign('left')
          .run()
        break
      default:
        break
    }
  }

  // Clipboard Functions
  const handleCut = async () => {
    if (editor) {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      )
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText)
          editor.chain().focus().deleteSelection().run()
        } catch (err) {
          console.error('Failed to cut text:', err)
        }
      }
    }
  }

  const handleCopy = async () => {
    if (editor) {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      )
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText)
        } catch (err) {
          console.error('Failed to copy text:', err)
        }
      } else {
        // If no text is selected, copy all text
        try {
          await navigator.clipboard.writeText(editor.getText())
        } catch (err) {
          console.error('Failed to copy text:', err)
        }
      }
    }
  }

  const handlePaste = async () => {
    if (editor) {
      try {
        const text = await navigator.clipboard.readText()
        editor.chain().focus().insertContent(text).run()
      } catch (err) {
        console.error('Failed to paste text:', err)
      }
    }
  }

  // Comment helpers
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [commentThreads, setCommentThreads] = useState([])

  // Auto-open comments panel in reviewing mode
  useEffect(() => {
    if (viewMode === 'reviewing' && !isCommentsOpen) {
      setIsCommentsOpen(true)
    } else if (viewMode !== 'reviewing' && isCommentsOpen && viewMode === 'editing') {
      // Optionally close comments when switching away from reviewing
      // setIsCommentsOpen(false)
    }
  }, [viewMode, isCommentsOpen])
  const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

  const addCommentForSelection = (name, text) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) return
    const id = generateId()
    editor.chain().focus().setMark('comment', { threadId: id, resolved: false }).run()
    setCommentThreads(prev => ([
      { id, resolved: false, authorName: name, comments: [{ id: generateId(), text, createdAt: Date.now() }] },
      ...prev,
    ]))
    setIsCommentsOpen(true)
  }

  const focusCommentThread = (threadId) => {
    if (!editor) return
    const { state } = editor
    // Find first range of this comment mark
    let foundFrom = null
    let foundTo = null
    state.doc.descendants((node, pos) => {
      if (!node.isText) return true
      const m = node.marks.find(mk => mk.type.name === 'comment' && mk.attrs.threadId === threadId)
      if (m && foundFrom == null) {
        foundFrom = pos
        foundTo = pos + node.nodeSize
        return false
      }
      return true
    })
    if (foundFrom != null && foundTo != null) {
      const tr = state.tr.setSelection(TextSelection.create(state.doc, foundFrom, foundTo))
      editor.view.dispatch(tr)
      editor.view.focus()
    }
  }

  const resolveCommentThread = (threadId) => {
    setCommentThreads(prev => prev.map(t => t.id === threadId ? { ...t, resolved: true } : t))
    if (editor?.commands?.resolveCommentMark) {
      editor.commands.resolveCommentMark(threadId)
      // Force update to ensure marks are removed
      setTimeout(() => {
        editor.view.dispatch(editor.state.tr)
      }, 10)
    }
  }

  const deleteCommentThread = (threadId) => {
    if (editor?.commands?.removeCommentMark) {
      editor.commands.removeCommentMark({ threadId })
      // Force update to ensure marks are removed
      setTimeout(() => {
        editor.view.dispatch(editor.state.tr)
      }, 10)
    }
    setCommentThreads(prev => prev.filter(t => t.id !== threadId))
  }

  const addReplyToThread = (threadId, name, text) => {
    setCommentThreads(prev => prev.map(t => t.id === threadId ? {
      ...t,
      comments: [...t.comments, { id: generateId(), authorName: name, text, createdAt: Date.now() }],
    } : t))
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Blue Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-blue-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Word-like Editor</h1>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="px-3 py-1 text-black bg-white rounded border-none text-sm"
            style={{ minWidth: '200px' }}
            disabled={viewMode === 'viewing'}
          />
          {viewMode === 'viewing' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 rounded text-sm">
              <FaEye className="w-4 h-4" />
              <span>Viewing Mode</span>
            </div>
          )}
          {viewMode === 'reviewing' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 rounded text-sm">
              <FaComments className="w-4 h-4" />
              <span>Reviewing Mode</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpen}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            <FaFolderOpen className="w-4 h-4" />
            <span>Open</span>
          </button>
          <button 
            onClick={handleImport}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            <FaFileImport className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button 
            onClick={handleFind}
            className="flex items-center space-x-1 px-3 py-1 hover:bg-blue-700 rounded text-sm"
          >
            <FaSearch className="w-4 h-4" />
            <span>Find</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 hover:bg-blue-700 rounded text-sm">
            <span>{wordCount} words</span>
          </button>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border-l border-blue-500 pl-2 ml-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-blue-700 rounded"
              title="Zoom out"
            >
              <FaSearchMinus className="w-4 h-4" />
            </button>
            <div className="relative zoom-dropdown-container">
              <button
                onClick={() => setShowZoomDropdown(!showZoomDropdown)}
                className="px-2 py-1 hover:bg-blue-700 rounded text-sm min-w-[60px]"
                title="Zoom"
              >
                {Math.round(zoomLevel)}%
              </button>
              {showZoomDropdown && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-xl py-2 min-w-[160px] z-[100] zoom-dropdown-container">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">Zoom</div>
                  <div className="py-1">
                    {[50, 75, 90, 100, 125, 150, 200].map(level => (
                      <button
                        key={level}
                        onClick={() => handleZoomChange(level)}
                        className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 transition-colors ${zoomLevel === level ? 'bg-blue-100 font-medium text-blue-700' : 'hover:text-gray-900'}`}
                      >
                        {level}%
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="py-1">
                    <button
                      onClick={handleFitToWidth}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-gray-900 transition-colors"
                    >
                      Fit to width
                    </button>
                    <button
                      onClick={handleFitToPage}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-gray-900 transition-colors"
                    >
                      Fit to page
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-blue-700 rounded"
              title="Zoom in"
            >
              <FaSearchPlus className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-1 px-3 py-1 hover:bg-blue-700 rounded text-sm"
          >
            <FaFilePdf className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button 
            onClick={handleExportDOCX}
            className="flex items-center space-x-1 px-3 py-1 hover:bg-blue-700 rounded text-sm"
          >
            <FaFileWord className="w-4 h-4" />
            <span>DOCX</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex pt-16">
        {/* Left Sidebar - Two Column Layout */}
        {showSidebar && (
          <aside className="w-96 bg-white border-r border-gray-200 shadow-sm flex fixed left-0 top-16 h-[calc(100vh-4rem)] z-10 overflow-x-hidden">
          {/* First Column - Section Names */}
          <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col">
            <nav className="flex flex-col flex-1 justify-center">
                    <button
                      onClick={() => !(viewMode === 'viewing' || viewMode === 'reviewing') && setActiveTab('Home')}
                      disabled={viewMode === 'viewing' || viewMode === 'reviewing'}
                      className={`flex flex-col items-center justify-center p-3 text-xs font-medium ${
                        activeTab === 'Home' ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' : 'hover:bg-gray-100'
                      } ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
              <button
                onClick={() => !(viewMode === 'viewing' || viewMode === 'reviewing') && setActiveTab('Insert')}
                disabled={viewMode === 'viewing' || viewMode === 'reviewing'}
                className={`flex flex-col items-center justify-center p-3 text-xs font-medium ${
                  activeTab === 'Insert' ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' : 'hover:bg-gray-100'
                } ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Insert</span>
              </button>
              <button
                onClick={() => !(viewMode === 'viewing' || viewMode === 'reviewing') && setActiveTab('Draw')}
                disabled={viewMode === 'viewing' || viewMode === 'reviewing'}
                className={`flex flex-col items-center justify-center p-3 text-xs font-medium ${
                  activeTab === 'Draw' ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' : 'hover:bg-gray-100'
                } ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Draw</span>
              </button>
              <button
                onClick={() => !(viewMode === 'viewing' || viewMode === 'reviewing') && setActiveTab('Design')}
                disabled={viewMode === 'viewing' || viewMode === 'reviewing'}
                className={`flex flex-col items-center justify-center p-3 text-xs font-medium ${
                  activeTab === 'Design' ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' : 'hover:bg-gray-100'
                } ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                <span>Design</span>
              </button>
              <button
                onClick={() => setActiveTab('View')}
                className={`flex flex-col items-center justify-center p-3 text-xs font-medium ${
                  activeTab === 'View' ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </button>
              {hasTable && (
                  <button
                  onClick={() => !(viewMode === 'viewing' || viewMode === 'reviewing') && setActiveTab('DesignTable')}
                  disabled={viewMode === 'viewing' || viewMode === 'reviewing'}
                    className={`flex flex-col items-center justify-center p-3 text-xs font-medium ${
                    activeTab === 'DesignTable' ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' : 'hover:bg-gray-100'
                    } ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FaTable className="w-5 h-5 mb-1" />
                  <span>Design Table</span>
                  </button>
              )}
            </nav>
          </div>

          {/* Second Column - Tools for Selected Section */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-full">
            {/* Home Tab Content */}
            {activeTab === 'Home' && (
              <div className={`p-4 space-y-6 ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Clipboard */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Clipboard</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={undo}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Undo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    <button 
                      onClick={redo}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Redo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10h7a8 8 0 018 8v2M13 10l-6 6m6-6l-6-6" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleCut}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Cut"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Copy"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={handlePaste}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Paste"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Font */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Font</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select 
                        onChange={(e) => changeFontFamily(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        defaultValue="Calibri"
                      >
                        <option value="Calibri">Calibri</option>
                        <option value="Arial">Arial</option>
                        <option value="Arial Black">Arial Black</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Impact">Impact</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Lucida Console">Lucida Console</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Palatino">Palatino</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Book Antiqua">Book Antiqua</option>
                        <option value="Century Gothic">Century Gothic</option>
                        <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
                        <option value="MS Sans Serif">MS Sans Serif</option>
                        <option value="MS Serif">MS Serif</option>
                        <option value="Symbol">Symbol</option>
                        <option value="Wingdings">Wingdings</option>
                        <option value="Webdings">Webdings</option>
                      </select>
                      <select 
                        onChange={(e) => changeFontSize(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        defaultValue="12"
                      >
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="20">20</option>
                        <option value="22">22</option>
                        <option value="24">24</option>
                        <option value="26">26</option>
                        <option value="28">28</option>
                        <option value="30">30</option>
                        <option value="32">32</option>
                        <option value="34">34</option>
                        <option value="36">36</option>
                        <option value="40">40</option>
                        <option value="44">44</option>
                        <option value="48">48</option>
                        <option value="54">54</option>
                        <option value="60">60</option>
                        <option value="66">66</option>
                        <option value="72">72</option>
                        <option value="80">80</option>
                        <option value="88">88</option>
                        <option value="96">96</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button 
                        onClick={toggleBold}
                        disabled={viewMode === 'viewing'}
                        className={`p-2 rounded font-bold ${viewMode === 'viewing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${editor?.isActive('bold') ? 'bg-blue-100' : ''}`}
                        title="Bold"
                      >
                        B
                      </button>
                      <button 
                        onClick={toggleItalic}
                        disabled={viewMode === 'viewing'}
                        className={`p-2 rounded italic ${viewMode === 'viewing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${editor?.isActive('italic') ? 'bg-blue-100' : ''}`}
                        title="Italic"
                      >
                        I
                      </button>
                      <button 
                        onClick={toggleUnderline}
                        disabled={viewMode === 'viewing'}
                        className={`p-2 rounded underline ${viewMode === 'viewing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${editor?.isActive('underline') ? 'bg-blue-100' : ''}`}
                        title="Underline"
                      >
                        U
                      </button>
                      <button 
                        onClick={toggleStrikethrough}
                        disabled={viewMode === 'viewing'}
                        className={`p-2 rounded line-through ${viewMode === 'viewing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${editor?.isActive('strike') ? 'bg-blue-100' : ''}`}
                        title="Strikethrough"
                      >
                        S
                      </button>
                      <button 
                        onClick={toggleSubscript}
                        className={`p-2 hover:bg-gray-100 rounded text-xs ${editor?.isActive('subscript') ? 'bg-blue-100' : ''}`}
                        title="Subscript"
                      >
                        X₁
                      </button>
                      <button 
                        onClick={toggleSuperscript}
                        className={`p-2 hover:bg-gray-100 rounded text-xs ${editor?.isActive('superscript') ? 'bg-blue-100' : ''}`}
                        title="Superscript"
                      >
                        X¹
                      </button>
                      <button 
                        onClick={toggleSmallCaps}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Small Caps"
                      >
                        Aa
                      </button>
                      <button 
                        onClick={toggleAllCaps}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="All Caps"
                      >
                        AA
                      </button>
                      <button 
                        onClick={toggleHiddenText}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Hidden Text"
                      >
                        H
                      </button>
                      <button 
                        onClick={toggleShowHiddenText}
                        className={`p-2 hover:bg-gray-100 rounded ${showHiddenText ? 'bg-blue-100' : ''}`}
                        title={showHiddenText ? 'Hide Hidden Text' : 'Show Hidden Text'}
                      >
                        {showHiddenText ? '👁️‍🗨️' : '👁️'}
                      </button>
                      <div className="relative p-2 hover:bg-gray-100 rounded inline-flex items-center justify-center w-8 h-8">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => changeTextColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Text Color"
                        />
                        <div className="flex items-center justify-center pointer-events-none select-none">
                          <span className="text-gray-800 font-semibold text-sm leading-none">A</span>
                        </div>
                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{bottom: '2px', width: '14px', height: '2px', backgroundColor: '#000'}} />
                      </div>
                      <div className="relative p-2 hover:bg-gray-100 rounded inline-flex items-center justify-center w-8 h-8">
                        <input
                          type="color"
                          value={highlightColor}
                          onChange={(e) => changeHighlightColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Highlight Color"
                        />
                        <div className="flex items-center justify-center pointer-events-none select-none">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-800">
                            <path d="M3 17l4 4 3-3 8-8-4-4-8 8-3 3zM14 4l4 4 2-2-4-4-2 2z" />
                          </svg>
                        </div>
                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{bottom: '2px', width: '14px', height: '2px', backgroundColor: highlightColor}} />
                      </div>
                    </div>
                    
                    
                  </div>
                </div>

                {/* Paragraph */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Paragraph</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-1">
                      <button 
                        onClick={alignLeft}
                        className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}`}
                        title="Align Left"
                      >
                        <FaAlignLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={alignCenter}
                        className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}`}
                        title="Align Center"
                      >
                        <FaAlignCenter className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={alignRight}
                        className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : ''}`}
                        title="Align Right"
                      >
                        <FaAlignRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={alignJustify}
                        className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive({ textAlign: 'justify' }) ? 'bg-blue-100' : ''}`}
                        title="Justify"
                      >
                        <FaAlignJustify className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      {/* Shading (Paragraph background) */}
                      <div className="relative">
                        <button
                          onClick={() => setShowShadingMenu(!showShadingMenu)}
                          className="p-2 hover:bg-gray-100 rounded flex items-center gap-1"
                          title="Shading"
                        >
                          {/* paint bucket icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                            <path fill="currentColor" d="M19 11a1 1 0 0 1 .8 1.6c-.6.8-1.8 2.4-1.8 3.4a2 2 0 1 0 4 0c0-1-1.2-2.6-1.8-3.4A1 1 0 0 1 19 11Zm-8.4-7.4 1.8 1.8-6.6 6.6-1.8-1.8a1 1 0 0 1 0-1.4l5.2-5.2a1 1 0 0 1 1.4 0ZM5.2 13.2l7.6-7.6 4.6 4.6-7.6 7.6a3 3 0 0 1-2.1.9H5a3 3 0 0 1-3-3v-2.7c0-.8.3-1.6.9-2.2Z"/>
                          </svg>
                          <div className="w-3 h-1 rounded-sm" style={{ backgroundColor: lastShadingColor }} />
                        </button>
                        {showShadingMenu && (
                          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 w-64">
                            <div className="text-xs font-semibold text-gray-600 mb-2">Shading Colors</div>
                            <div className="grid grid-cols-8 gap-1">
                              {[
                                '#000000','#555555','#808080','#aaaaaa','#d1d5db','#f3f4f6','#ffffff','#ffd700',
                                '#fde68a','#fca5a5','#f87171','#ef4444','#22c55e','#10b981','#06b6d4','#0ea5e9',
                                '#3b82f6','#8b5cf6','#a855f7','#ec4899','#f97316','#84cc16','#eab308','#94a3b8'
                              ].map(color => (
                                <button
                                  key={color}
                                  onClick={() => setParagraphShading(color)}
                                  className="w-6 h-6 rounded border border-gray-200"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={clearParagraphShading}
                                className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                                title="No Color"
                              >
                                No Color
                              </button>
                              <label className="ml-auto inline-flex items-center gap-2 text-xs px-2 py-1 border rounded hover:bg-gray-50 cursor-pointer">
                                More Colors
                                <input
                                  type="color"
                                  className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                                  onChange={(e) => setParagraphShading(e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative inline-flex items-center">
                        <button 
                          onClick={toggleBulletList}
                          className={`p-2 hover:bg-gray-100 rounded-l flex items-center ${editor?.isActive('bulletList') ? 'bg-blue-100' : ''}`}
                          title="Bullet List"
                        >
                          <FaListUl className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowBulletOptions(!showBulletOptions)}
                          className={`p-2 hover:bg-gray-100 rounded-r border-l border-gray-200 flex items-center ${editor?.isActive('bulletList') ? 'bg-blue-100' : ''}`}
                          title="Bullet Options"
                        >
                          <FaChevronDown className="w-3 h-3" />
                        </button>
                        {showBulletOptions && (
                          <div className="bullet-options absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-48">
                            <div className="p-2">
                              <div className="text-xs font-semibold text-gray-600 mb-2">Bullet Styles</div>
                              <div className="space-y-1">
                                <button 
                                  onClick={() => applyBulletStyle('disc')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">•</span> Bullet (•)
                                </button>
                                <button 
                                  onClick={() => applyBulletStyle('circle')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">○</span> Circle (○)
                                </button>
                                <button 
                                  onClick={() => applyBulletStyle('square')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">■</span> Square (■)
                                </button>
                                <button 
                                  onClick={() => applyBulletStyle('dash')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">—</span> Dash (—)
                                </button>
                                <button 
                                  onClick={() => applyBulletStyle('arrow')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">▶</span> Arrow (▶)
                                </button>
                                <button 
                                  onClick={() => applyBulletStyle('star')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">★</span> Star (★)
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative inline-flex items-center">
                        <button 
                          onClick={toggleOrderedList}
                          className={`p-2 hover:bg-gray-100 rounded-l border-r border-gray-200 flex items-center ${editor?.isActive('orderedList') ? 'bg-blue-100' : ''}`}
                          title="Numbered List"
                        >
                          <FaListOl className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowNumberOptions(!showNumberOptions)}
                          className={`p-2 hover:bg-gray-100 rounded-r flex items-center ${editor?.isActive('orderedList') ? 'bg-blue-100' : ''}`}
                          title="Number Options"
                        >
                          <FaChevronDown className="w-3 h-3" />
                        </button>
                        {showNumberOptions && (
                          <div className="number-options absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-48">
                            <div className="p-2">
                              <div className="text-xs font-semibold text-gray-600 mb-2">Number Styles</div>
                              <div className="space-y-1">
                                <button 
                                  onClick={() => applyNumberStyle('decimal')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">1.</span> Numbers (1, 2, 3)
                                </button>
                                <button 
                                  onClick={() => applyNumberStyle('lower-alpha')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">a.</span> Letters (a, b, c)
                                </button>
                                <button 
                                  onClick={() => applyNumberStyle('upper-alpha')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">A.</span> Capitals (A, B, C)
                                </button>
                                <button 
                                  onClick={() => applyNumberStyle('lower-roman')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">i.</span> Roman (i, ii, iii)
                                </button>
                                <button 
                                  onClick={() => applyNumberStyle('upper-roman')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">I.</span> Roman Capitals (I, II, III)
                                </button>
                                <button 
                                  onClick={() => applyNumberStyle('decimal-leading-zero')}
                                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center"
                                >
                                  <span className="w-4 h-4 mr-2">01.</span> Zero-padded (01, 02, 03)
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={increaseIndent}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Increase Indent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={decreaseIndent}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Decrease Indent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Styles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Styles</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => applyStyle('normal')}
                      className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive('paragraph') ? 'bg-blue-100' : ''}`}
                      title="Normal"
                    >
                      <FaClipboard className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => applyStyle('noSpacing')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="No Spacing"
                    >
                      <FaParagraph className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => applyStyle('heading1')}
                      className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}`}
                      title="Heading 1"
                    >
                      <span className="text-xs font-bold">H1</span>
                    </button>
                    <button 
                      onClick={() => applyStyle('heading2')}
                      className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}`}
                      title="Heading 2"
                    >
                      <span className="text-xs font-bold">H2</span>
                    </button>
                    <button 
                      onClick={() => applyStyle('heading3')}
                      className={`p-2 hover:bg-gray-100 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-100' : ''}`}
                      title="Heading 3"
                    >
                      <span className="text-xs font-bold">H3</span>
                    </button>
                    <button 
                      onClick={() => applyStyle('title')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Title"
                    >
                      <span className="text-xs font-bold">T</span>
                    </button>
                    <button 
                      onClick={() => applyStyle('subtitle')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Subtitle"
                    >
                      <span className="text-xs font-bold">S</span>
                    </button>
                  </div>
                </div>

                {/* Quick Styles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Styles</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => applyQuickStyle('quote')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Quote"
                    >
                      <FaQuoteLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => applyQuickStyle('caption')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Caption"
                    >
                      <FaParagraph className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => applyQuickStyle('intenseQuote')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Intense Quote"
                    >
                      <FaQuoteRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => applyQuickStyle('listParagraph')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="List Paragraph"
                    >
                      <FaIndent className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Editing */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Editing</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => setShowFindReplace(true)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Find Text"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowFindReplace(true)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Find and Replace Text"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Insert Tab Content */}
            {activeTab === 'Insert' && (
              <div className={`p-4 space-y-6 ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Pages</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={insertCoverPage}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Cover Page"
                    >
                      <RiPagesLine className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={insertBlankPage}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Blank Page"
                    >
                      <RiPageSeparator className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={insertPageBreak}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Page Break"
                    >
                      <MdOutlineInsertPageBreak className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Tables</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={insertTable}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Table"
                    >
                      <FaTable className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowQuickTables(true)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Quick Table Templates"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Illustrations</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={insertImage}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Pictures"
                    >
                      <FaImage className="w-4 h-4" />
                    </button>
                    <div>
                    <button 
                        ref={setShapesButtonRef}
                        onClick={() => setShowShapePalette(!showShapePalette)}
                        className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Shapes"
                    >
                      <FaShapes className="w-4 h-4" />
                    </button>
                      {showShapePalette && (
                        <div
                          ref={shapePaletteRef}
                          className="fixed z-50"
                          style={{ top: `${shapePalettePosition.top}px`, left: `${shapePalettePosition.left}px` }}
                        >
                          <ShapeQuickPalette editor={editor} onClose={() => setShowShapePalette(false)} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Links</h4>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={insertLink}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Insert Link"
                    >
                      <FaLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Header & Footer</h4>
                  <div className="flex flex-wrap gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded" title="Header">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded" title="Footer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6zM4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Text</h4>
                  <div className="flex flex-wrap gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded" title="Text Box">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowDateTime(true)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Comments"
                      onClick={() => {
                        if (!editor) return
                        const { from, to } = editor.state.selection
                        if (from !== to) {
                          setShowCommentDialog(true)
                        } else {
                          setIsCommentsOpen(v => !v)
                        }
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Draw Tab Content */}
            {activeTab === 'Draw' && (
              <div className={`p-4 space-y-6 ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Tools Group */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDrawTool('pen')}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawTool === 'pen' ? 'bg-blue-100' : ''
                      }`}
                      title="Pen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 6l-1 1m0-2l1 1" />
                        <circle cx="18" cy="6" r="1" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDrawTool('pencil')}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawTool === 'pencil' ? 'bg-blue-100' : ''
                      }`}
                      title="Pencil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h4l12-12a2 2 0 00-2-2L3 17v4z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setDrawTool('highlighter')}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawTool === 'highlighter' ? 'bg-blue-100' : ''
                      }`}
                      title="Highlighter"
                    >
                      <FaHighlighter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDrawTool('fountainPen')}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawTool === 'fountainPen' ? 'bg-blue-100' : ''
                      }`}
                      title="Fountain Pen"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">🪶</text>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Color and Thickness Controls */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Color & Thickness</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={drawColor}
                        onChange={(e) => setDrawColor(e.target.value)}
                        className="w-20 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Thickness: {drawThickness}pt</label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={drawThickness}
                        onChange={(e) => setDrawThickness(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Group */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={undoDraw}
                      disabled={drawStrokes.length === 0}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawStrokes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Undo Last Stroke"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={redoDraw}
                      disabled={drawUndoStack.length === 0}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawUndoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Redo Last Undone Stroke"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10h7a8 8 0 018 8v2M13 10l-6 6m6-6l-6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={clearAllDrawings}
                      disabled={drawStrokes.length === 0}
                      className={`p-2 hover:bg-gray-100 rounded ${
                        drawStrokes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Clear All Drawings"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Design Table Tab Content */}
            {activeTab === 'DesignTable' && (
              <div className={`p-4 space-y-6 overflow-hidden ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Table Styles Gallery */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Table Styles</h4>

                  {/* Quick Style Preview - Show 2-3 styles */}
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex gap-1 border border-gray-300 rounded bg-white">
                      {['plain-1', 'grid-1', 'list-1'].map((style) => (
                            <button
                              key={style}
                          onClick={() => {
                            applyTableStyle(style)
                            setTableStyle(style)
                          }}
                          className={`p-1.5 border-r border-gray-300 last:border-r-0 hover:bg-gray-50 transition-colors ${
                            tableStyle === style ? 'bg-blue-50' : ''
                          }`}
                          title={`Table Style ${style}`}
                        >
                          <div className="h-10 w-14 flex items-center justify-center">
                            <table className={`table-style-${style} w-full text-[9px] border-collapse`}>
                                  <thead>
                                    <tr>
                                  <th className="p-0.5 text-center">A</th>
                                  <th className="p-0.5 text-center">B</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                <tr><td className="p-0.5 text-center">1</td><td className="p-0.5 text-center">2</td></tr>
                                <tr><td className="p-0.5 text-center">3</td><td className="p-0.5 text-center">4</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            </button>
                          ))}
                        </div>
                    {/* Arrow button to show all styles - aligned with preview buttons */}
                          <button
                      onClick={() => setShowTableStylesPopup(!showTableStylesPopup)}
                      className="h-[52px] w-8 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center bg-white"
                            title="More Table Styles"
                          >
                      <FaChevronDown className={`w-3 h-3 transition-transform ${showTableStylesPopup ? 'rotate-180' : ''}`} />
                          </button>
                  </div>

                  {/* Popup with all table styles - scrollable */}
                  {showTableStylesPopup && (
                    <div className="border border-gray-300 rounded bg-white shadow-xl p-3 mb-4 max-h-[400px] overflow-y-auto">
                      {/* Plain Tables Section */}
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 px-1">Plain Tables</h5>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['plain-1', 'plain-2', 'plain-3', 'plain-4', 'plain-5', 'plain-6'].map((style) => (
                            <button
                              key={style}
                              onClick={() => {
                                applyTableStyle(style)
                                setTableStyle(style)
                              }}
                              className={`p-1.5 border rounded hover:border-blue-400 hover:bg-blue-50 transition-colors ${
                                tableStyle === style ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                              }`}
                              title={`Plain Table ${style.split('-')[1]}`}
                            >
                              <div className="h-10 flex items-center justify-center">
                                <table className={`table-style-${style} w-full text-[9px] border-collapse`}>
                                  <thead>
                                    <tr>
                                      <th className="p-0.5 text-center">A</th>
                                      <th className="p-0.5 text-center">B</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr><td className="p-0.5 text-center">1</td><td className="p-0.5 text-center">2</td></tr>
                                    <tr><td className="p-0.5 text-center">3</td><td className="p-0.5 text-center">4</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Grid Tables Section */}
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 px-1">Grid Tables</h5>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['grid-1', 'grid-2', 'grid-3', 'grid-4', 'grid-5', 'grid-6', 'grid-7', 'grid-8', 'grid-9', 'grid-10', 'grid-11', 'grid-12', 'grid-13', 'grid-14'].map((style) => (
                            <button
                              key={style}
                              onClick={() => {
                                applyTableStyle(style)
                                setTableStyle(style)
                              }}
                              className={`p-1.5 border rounded hover:border-blue-400 hover:bg-blue-50 transition-colors ${
                                tableStyle === style ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                              }`}
                              title={`Grid Table ${style.split('-')[1]}`}
                            >
                              <div className="h-10 flex items-center justify-center">
                                <table className={`table-style-${style} w-full text-[9px] border-collapse`}>
                                  <thead>
                                    <tr>
                                      <th className="p-0.5 text-center">A</th>
                                      <th className="p-0.5 text-center">B</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr><td className="p-0.5 text-center">1</td><td className="p-0.5 text-center">2</td></tr>
                                    <tr><td className="p-0.5 text-center">3</td><td className="p-0.5 text-center">4</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* List Tables Section */}
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 px-1">List Tables</h5>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['list-1', 'list-2', 'list-3', 'list-4', 'list-5', 'list-6', 'list-7', 'list-8', 'list-9', 'list-10', 'list-11', 'list-12'].map((style) => (
                            <button
                              key={style}
                              onClick={() => {
                                applyTableStyle(style)
                                setTableStyle(style)
                              }}
                              className={`p-1.5 border rounded hover:border-blue-400 hover:bg-blue-50 transition-colors ${
                                tableStyle === style ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                              }`}
                              title={`List Table ${style.split('-')[1]}`}
                            >
                              <div className="h-10 flex items-center justify-center">
                                <table className={`table-style-${style} w-full text-[9px] border-collapse`}>
                                  <thead>
                                    <tr>
                                      <th className="p-0.5 text-center">A</th>
                                      <th className="p-0.5 text-center">B</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr><td className="p-0.5 text-center">1</td><td className="p-0.5 text-center">2</td></tr>
                                    <tr><td className="p-0.5 text-center">3</td><td className="p-0.5 text-center">4</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Table Style Options */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Table Style Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tableStyleOptions.headerRow}
                        onChange={(e) => {
                          setTableStyleOptions({ ...tableStyleOptions, headerRow: e.target.checked })
                          // Apply immediately to table at cursor
                          const table = getTableAtCursor()
                          if (table) {
                            if (e.target.checked) {
                              table.classList.add('table-header-row')
                            } else {
                              table.classList.remove('table-header-row')
                            }
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Header Row</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tableStyleOptions.bandedRows}
                        onChange={(e) => {
                          setTableStyleOptions({ ...tableStyleOptions, bandedRows: e.target.checked })
                          const table = getTableAtCursor()
                          if (table) {
                            if (e.target.checked) {
                              table.classList.add('table-banded-rows')
                            } else {
                              table.classList.remove('table-banded-rows')
                            }
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Banded Rows</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tableStyleOptions.firstColumn}
                        onChange={(e) => {
                          setTableStyleOptions({ ...tableStyleOptions, firstColumn: e.target.checked })
                          const table = getTableAtCursor()
                          if (table) {
                            if (e.target.checked) {
                              table.classList.add('table-first-column')
                            } else {
                              table.classList.remove('table-first-column')
                            }
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">First Column</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tableStyleOptions.lastColumn}
                        onChange={(e) => {
                          setTableStyleOptions({ ...tableStyleOptions, lastColumn: e.target.checked })
                          const table = getTableAtCursor()
                          if (table) {
                            if (e.target.checked) {
                              table.classList.add('table-last-column')
                            } else {
                              table.classList.remove('table-last-column')
                            }
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Last Column</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tableStyleOptions.bandedColumns}
                        onChange={(e) => {
                          setTableStyleOptions({ ...tableStyleOptions, bandedColumns: e.target.checked })
                          const table = getTableAtCursor()
                          if (table) {
                            if (e.target.checked) {
                              table.classList.add('table-banded-columns')
                            } else {
                              table.classList.remove('table-banded-columns')
                            }
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Banded Columns</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Design Tab Content */}
            {activeTab === 'Design' && (
              <div className={`p-4 space-y-6 ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Document Formatting Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Document Formatting</h4>
                  <div className="flex flex-wrap gap-1">
                    {/* Themes */}
                    <div className="relative">
                      <button
                        data-theme-button
                        onClick={() => setShowThemePicker(!showThemePicker)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Themes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </button>
                      {showThemePicker && (
                        <div className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg p-3 w-64 design-dropdown design-dropdown-theme">
                          <div className="text-xs font-semibold mb-2">Themes</div>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {['Office', 'Apex', 'Aspect', 'Civic', 'Concourse', 'Equity', 'Flow', 'Foundry', 'Median', 'Metro', 'Module', 'Opulent', 'Oriel', 'Origin', 'Paper', 'Solstice', 'Technic', 'Trek', 'Urban', 'Verve'].map(theme => (
                              <button
                                key={theme}
                                onClick={() => {
                                  setCurrentTheme(theme);
                                  applyTheme(theme);
                                  setShowThemePicker(false);
                                }}
                                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${currentTheme === theme ? 'bg-blue-100' : ''}`}
                              >
                                {theme}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Colors */}
                    <div className="relative">
                      <button
                        data-color-button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Colors"
                      >
                        <FaPalette className="w-4 h-4" />
                      </button>
                      {showColorPicker && (
                        <div className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg p-3 w-64 design-dropdown design-dropdown-color">
                          <div className="text-xs font-semibold mb-2">Color Schemes</div>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {['Blue', 'Green', 'Orange', 'Purple', 'Red', 'Teal', 'Yellow', 'Grayscale', 'Blue Warm', 'Blue II', 'Green Yellow', 'Marquee', 'Median', 'Metro', 'Module', 'Office', 'Office 2007-2010', 'Paper', 'Solstice', 'Technic', 'Trek', 'Urban', 'Verve', 'Waveform'].map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  setCurrentColorScheme(color);
                                  applyColorScheme(color);
                                  setShowColorPicker(false);
                                }}
                                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${currentColorScheme === color ? 'bg-blue-100' : ''}`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fonts */}
                    <div className="relative">
                      <button
                        data-font-button
                        onClick={() => setShowFontSetPicker(!showFontSetPicker)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Fonts"
                      >
                        <AiOutlineFontSize className="w-4 h-4" />
                      </button>
                      {showFontSetPicker && (
                        <div className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg p-3 w-64 design-dropdown design-dropdown-font">
                          <div className="text-xs font-semibold mb-2">Font Sets</div>
                              <div className="space-y-1 max-h-60 overflow-y-auto">
                            {['Office', 'Calibri Light', 'Candara', 'Corbel', 'Franklin Gothic', 'Georgia', 'Office 2007-2010', 'Office 2', 'Office Classic', 'Office Classic 2', 'Trebuchet'].map(font => (
                              <button
                                key={font}
                                onClick={() => {
                                  setCurrentFontSet(font);
                                  applyFontSet(font);
                                  setShowFontSetPicker(false);
                                }}
                                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${currentFontSet === font ? 'bg-blue-100' : ''}`}
                              >
                                {font}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Paragraph Spacing */}
                    <div className="relative">
                      <button
                        data-spacing-button
                        onClick={() => setShowParagraphSpacing(!showParagraphSpacing)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Paragraph Spacing"
                      >
                        <MdOutlineFormatLineSpacing className="w-4 h-4" />
                      </button>
                      {showParagraphSpacing && (
                        <div className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg p-3 w-64 design-dropdown design-dropdown-spacing">
                          <div className="text-xs font-semibold mb-2">Paragraph Spacing</div>
                          <div className="space-y-1">
                            {['Default', 'No Paragraph Space', 'Compact', 'Tight', 'Relaxed', 'Double'].map(spacing => (
                              <button
                                key={spacing}
                                onClick={() => {
                                  setParagraphSpacing(spacing);
                                  setShowParagraphSpacing(false);
                                  // Apply spacing to document via CSS (like MS Word)
                                  if (editor) {
                                    const spacingMap = {
                                      'Default': { lineHeight: '1.15', marginTop: '0', marginBottom: '0' },
                                      'No Paragraph Space': { lineHeight: '1', marginTop: '0', marginBottom: '0' },
                                      'Compact': { lineHeight: '1.08', marginTop: '0', marginBottom: '0' },
                                      'Tight': { lineHeight: '1.1', marginTop: '0', marginBottom: '0' },
                                      'Relaxed': { lineHeight: '1.3', marginTop: '0', marginBottom: '0' },
                                      'Double': { lineHeight: '2', marginTop: '0', marginBottom: '0' }
                                    };
                                    const spacingValue = spacingMap[spacing];
                                    if (spacingValue) {
                                      // Apply globally via CSS
                                      const styleId = 'design-paragraph-spacing';
                                      let styleElement = document.getElementById(styleId);
                                      if (!styleElement) {
                                        styleElement = document.createElement('style');
                                        styleElement.id = styleId;
                                        document.head.appendChild(styleElement);
                                      }
                                      styleElement.textContent = `
                                        .ProseMirror p {
                                          line-height: ${spacingValue.lineHeight} !important;
                                          margin-top: ${spacingValue.marginTop} !important;
                                          margin-bottom: ${spacingValue.marginBottom} !important;
                                        }
                                        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3,
                                        .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
                                          line-height: ${spacingValue.lineHeight} !important;
                                          margin-top: ${spacingValue.marginTop} !important;
                                          margin-bottom: ${spacingValue.marginBottom} !important;
                                        }
                                        .ProseMirror li {
                                          line-height: ${spacingValue.lineHeight} !important;
                                          margin-top: ${spacingValue.marginTop} !important;
                                          margin-bottom: ${spacingValue.marginBottom} !important;
                                        }
                                        .ProseMirror td, .ProseMirror th {
                                          line-height: ${spacingValue.lineHeight} !important;
                                        }
                                      `;
                                      localStorage.setItem('word-editor-design-paragraph-spacing', spacing);
                                    }
                                  }
                                }}
                                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${paragraphSpacing === spacing ? 'bg-blue-100' : ''}`}
                              >
                                {spacing}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Effects */}
                    <div className="relative">
                      <button
                        data-effect-button
                        onClick={() => setShowEffects(!showEffects)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Effects"
                      >
                        <TfiWidget className="w-4 h-4" />
                      </button>
                      {showEffects && (
                        <div className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg p-3 w-64 design-dropdown design-dropdown-effect">
                          <div className="text-xs font-semibold mb-2">Effects</div>
                          <div className="space-y-1">
                            {['None', '3-D', 'Glow', 'Shadow', 'Reflection', 'Soft Edges', 'Bevel', 'Sketch'].map(effect => (
                              <button
                                key={effect}
                                onClick={() => {
                                  setCurrentEffect(effect);
                                  applyEffect(effect);
                                  setShowEffects(false);
                                }}
                                className="w-full text-left px-2 py-1 rounded hover:bg-blue-50"
                              >
                                {effect}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Page Background Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Page Background</h4>
                  <div className="flex flex-wrap gap-1">
                    {/* Page Color */}
                    <div className="relative">
                      <button
                        data-pagecolor-button
                        onClick={() => setShowPageColor(!showPageColor)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Page Color"
                      >
                        <div 
                          className="w-4 h-4 border border-gray-300 rounded"
                          style={{ backgroundColor: pageBackgroundColor }}
                        ></div>
                      </button>
                      {showPageColor && (
                        <div className="fixed z-[100] bg-white border border-gray-300 rounded shadow-lg p-3 w-64 design-dropdown design-dropdown-pagecolor">
                          <div className="text-xs font-semibold mb-2">Page Color</div>
                          <div className="grid grid-cols-8 gap-2 mb-3">
                            {['#FFFFFF', '#F2F2F2', '#E7E6E6', '#D0CECE', '#AFABAB', '#757575', '#3A3838', '#000000', '#C0504D', '#F79646', '#FFC000', '#9BBB59', '#4BACC6', '#1F497D', '#8064A2', '#4BACC6'].map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  setPageBackgroundColor(color);
                                  setShowPageColor(false);
                                  // Apply page color to A4 pages
                                  if (editor) {
                                    const styleId = 'design-page-color';
                                    let styleElement = document.getElementById(styleId);
                                    if (!styleElement) {
                                      styleElement = document.createElement('style');
                                      styleElement.id = styleId;
                                      document.head.appendChild(styleElement);
                                    }
                                    styleElement.textContent = `
                                      .ProseMirror .document-page {
                                        background-color: ${color} !important;
                                      }
                                    `;
                                  }
                                }}
                                className="w-8 h-8 border border-gray-300 rounded hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              ></button>
                            ))}
                          </div>
                          <input
                            type="color"
                            value={pageBackgroundColor}
                            onChange={(e) => {
                              const color = e.target.value;
                              setPageBackgroundColor(color);
                              if (editor) {
                                const styleId = 'design-page-color';
                                let styleElement = document.getElementById(styleId);
                                if (!styleElement) {
                                  styleElement = document.createElement('style');
                                  styleElement.id = styleId;
                                  document.head.appendChild(styleElement);
                                }
                                styleElement.textContent = `
                                  .ProseMirror .document-page {
                                    background-color: ${color} !important;
                                  }
                                `;
                              }
                            }}
                            className="w-full h-8 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => {
                              setPageBackgroundColor('#FFFFFF');
                              setShowPageColor(false);
                              if (editor) {
                                const styleId = 'design-page-color';
                                let styleElement = document.getElementById(styleId);
                                if (!styleElement) {
                                  styleElement = document.createElement('style');
                                  styleElement.id = styleId;
                                  document.head.appendChild(styleElement);
                                }
                                styleElement.textContent = `
                                  .ProseMirror .document-page {
                                    background-color: #FFFFFF !important;
                                  }
                                `;
                              }
                            }}
                            className="w-full mt-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            No Color
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Page Borders */}
                    <div className="relative">
                      <button
                        onClick={() => setShowPageBorders(!showPageBorders)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Page Borders"
                      >
                        <AiOutlineBorder className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Page Borders Dialog */}
                {showPageBorders && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 borders-dialog">
                      <h3 className="text-lg font-semibold mb-4">Borders and Shading</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Setting</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['None', 'Box', 'Shadow', '3-D'].map(setting => (
                              <button
                                key={setting}
                                onClick={(e) => {
                                  e.target.closest('.borders-dialog').querySelectorAll('.border-setting-active').forEach(btn => btn.classList.remove('border-setting-active'));
                                  e.target.classList.add('border-setting-active');
                                }}
                                className={`px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm ${pageBorderStyle === setting ? 'border-setting-active bg-blue-100' : ''}`}
                              >
                                {setting}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Color</label>
                          <input
                            type="color"
                            defaultValue="#000000"
                            className="w-full h-10 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Width</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded">
                            <option>1/2 pt</option>
                            <option>1 pt</option>
                            <option>1 1/2 pt</option>
                            <option>2 1/4 pt</option>
                            <option>3 pt</option>
                            <option>4 1/2 pt</option>
                            <option>6 pt</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowPageBorders(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              const setting = e.target.closest('.borders-dialog').querySelector('button.border-setting-active')?.textContent || 'Box';
                              const color = e.target.closest('.borders-dialog').querySelector('input[type="color"]').value;
                              const width = e.target.closest('.borders-dialog').querySelector('select').value;
                              applyPageBorders(setting, color, width, 'solid');
                              setPageBorderStyle(setting);
                              setShowPageBorders(false);
                            }}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View Tab Content */}
            {activeTab === 'View' && (
              <div className="p-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Views</h4>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setViewMode('editing')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'editing'
                          ? 'bg-blue-100'
                          : 'hover:bg-gray-100'
                      }`}
                      title="Editing"
                    >
                      <FaEdit className={`w-4 h-4 ${viewMode === 'editing' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => setViewMode('reviewing')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'reviewing'
                          ? 'bg-blue-100'
                          : 'hover:bg-gray-100'
                      }`}
                      title="Reviewing"
                    >
                      <FaComments className={`w-4 h-4 ${viewMode === 'reviewing' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => setViewMode('viewing')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'viewing'
                          ? 'bg-blue-100'
                          : 'hover:bg-gray-100'
                      }`}
                      title="Viewing"
                    >
                      <FaEye className={`w-4 h-4 ${viewMode === 'viewing' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Show</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showRuler}
                        onChange={(e) => setShowRuler(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Ruler</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Document Statistics</h4>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setShowWordCountPopup(true)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Word Count"
                    >
                      <FaFileWord className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Read Aloud</h4>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setShowReadAloud(true)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Read Aloud"
                    >
                      <FaVolumeUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content can be added here */}
            {activeTab !== 'Home' && activeTab !== 'Insert' && activeTab !== 'Draw' && activeTab !== 'Design' && activeTab !== 'DesignTable' && activeTab !== 'View' && (
              <div className={`p-4 ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="text-center text-gray-500 py-8">
                  <p>{activeTab} tools coming soon...</p>
                </div>
              </div>
            )}
            
            {/* Viewing/Reviewing Mode Overlay Message */}
            {(viewMode === 'viewing' || viewMode === 'reviewing') && activeTab !== 'View' && (
              <div className="p-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  {viewMode === 'viewing' ? (
                    <>
                      <FaEye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-700 font-medium">Viewing Mode Active</p>
                      <p className="text-xs text-blue-600 mt-1">All editing features are disabled. Switch to Editing mode to make changes.</p>
                    </>
                  ) : (
                    <>
                      <FaComments className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-700 font-medium">Reviewing Mode Active</p>
                      <p className="text-xs text-blue-600 mt-1">All editing features are disabled. Comments are available for review.</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
        )}

        {/* Main Editor Area - A4 Size Page */}
        <div className={`flex-1 bg-gray-100 p-8 flex justify-center overflow-y-auto ${showSidebar ? 'ml-96' : 'ml-0'}`}>
          <div className="flex items-start justify-center w-full">
            {/* Vertical Ruler on the left with corner space */}
            {showRuler && (
              <div className="flex flex-col">
                {/* Corner space matching horizontal ruler height and style */}
                <div 
                  className="rounded-sm" 
                  style={{ 
                    height: '32px', 
                    width: '32px', 
                    flexShrink: 0,
                    background: 'linear-gradient(#f8fafc, #eef2f7)',
                    borderRight: '1px solid rgba(209, 213, 219, 0.8)',
                    borderBottom: '1px solid rgba(209, 213, 219, 0.8)'
                  }} 
                />
                {/* Vertical Ruler */}
                <div 
                  className="flex-shrink-0 mr-2" 
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transformOrigin: 'top left',
                    zIndex: 10
                  }}
                >
                  <VerticalRuler editor={editor} />
                </div>
              </div>
            )}
            <div 
              className="w-full max-w-[210mm] relative transition-transform duration-200 origin-top" 
              style={{ 
                contain: 'layout',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            >
              {/* Horizontal Ruler above the page content */}
              {showRuler && (
                <div className="mb-2">
                  <Ruler editor={editor} />
                </div>
              )}
              <div onDoubleClick={handleEditorDoubleClick} className="w-full relative" style={{ contain: 'layout' }}>
                 <div className={(viewMode === 'viewing' || viewMode === 'reviewing') ? 'relative' : ''}>
                    {viewMode === 'viewing' && (
                      <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-3 py-1 rounded text-xs flex items-center gap-2">
                        <FaEye className="w-3 h-3" />
                        <span>Read-only</span>
                      </div>
                    )}
                    {viewMode === 'reviewing' && (
                      <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded text-xs flex items-center gap-2">
                        <FaComments className="w-3 h-3" />
                        <span>Reviewing</span>
                      </div>
                    )}
                    <EditorContent
                      editor={editor}
                     className={`w-full max-w-none focus:outline-none ${(viewMode === 'viewing' || viewMode === 'reviewing') ? 'cursor-default' : ''}`}
                      style={{ 
                        position: 'relative', 
                        top: 0, 
                        left: 0,
                        contain: 'layout',
                        overflow: 'hidden',
                       cursor: activeTab === 'Draw' ? 'crosshair' : ((viewMode === 'viewing' || viewMode === 'reviewing') ? 'default' : 'text')
                      }}
                    />
                </div>
                {/* Image resize overlay/handles and image wrap toolbar */}
                <ImageResize editor={editor} />
                <ImageWrapToolbar 
                  editor={editor} 
                  isOpen={showImageWrapToolbar}
                  onClose={() => setShowImageWrapToolbar(false)}
                  position={imageWrapPosition}
                />
                {/* Drawing Canvas Layer */}
                <canvas
                  ref={drawCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    startDrawing(e)
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault()
                    draw(e)
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    stopDrawing(e)
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: activeTab === 'Draw' ? 'auto' : 'none',
                    zIndex: 10,
                    touchAction: 'none',
                    cursor: activeTab === 'Draw' ? 'crosshair' : 'default'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Component Modals */}
      <FindReplace 
        editor={editor} 
        isOpen={showFindReplace} 
        onClose={() => setShowFindReplace(false)} 
      />
      
      <Shapes 
        editor={editor} 
        isOpen={showShapes} 
        onClose={() => setShowShapes(false)} 
      />
      
      <DateTime 
        editor={editor} 
        isOpen={showDateTime} 
        onClose={() => setShowDateTime(false)} 
      />
      
      <SpellCheck 
        editor={editor} 
        isOpen={showSpellCheck} 
        onClose={() => setShowSpellCheck(false)} 
      />
      
      <ImageManager 
        editor={editor} 
        isOpen={showImageManager} 
        onClose={() => setShowImageManager(false)} 
      />
      
      <TableManager 
        editor={editor} 
        isOpen={showTableManager} 
        onClose={() => setShowTableManager(false)} 
      />

      <TableContextMenu
        editor={editor}
        isOpen={showTableContextMenu}
        onClose={() => setShowTableContextMenu(false)}
        position={tableContextPosition}
      />

      <LinkEditor
        isOpen={showLinkEditor}
        position={linkEditorPosition}
        initialText={currentLinkText || (() => {
          if (!editor) return ''
          const { from, to } = editor.state.selection
          return editor.state.doc.textBetween(from, to)
        })()}
        initialUrl={currentLinkHref || (() => {
          if (!editor) return ''
          const linkMark = editor.getAttributes('link')
          return linkMark?.href || ''
        })()}
        onApply={handleLinkApply}
        onClose={() => {
          setShowLinkEditor(false)
          setCurrentLinkText('')
          setCurrentLinkHref('')
          setCurrentLinkRange({ from: null, to: null })
        }}
      />

      <LinkActions
        isOpen={showLinkActions}
        position={linkActionsPosition}
        href={currentLinkHref}
        onCopy={() => {
          if (currentLinkHref) {
            navigator.clipboard.writeText(currentLinkHref)
          setShowLinkActions(false)
          }
        }}
        onEdit={() => {
          // Select the link in the editor before opening editor
          if (editor && currentLinkHref) {
            // If we have stored link range, select it
            if (currentLinkRange.from !== null && currentLinkRange.to !== null) {
              editor.chain()
                .focus()
                .setTextSelection({ from: currentLinkRange.from, to: currentLinkRange.to })
                .run()
            } else {
              // Try to find and select the link
              const linkMark = editor.getAttributes('link')
              if (linkMark?.href === currentLinkHref) {
                // Link is already selected, keep selection
              } else {
                // Search for link in document
                const { state } = editor
                let found = false
                state.doc.descendants((node, pos) => {
                  if (!found && node.isText && node.marks) {
                    const linkMark = node.marks.find(mark => mark.type.name === 'link')
                    if (linkMark && linkMark.attrs.href === currentLinkHref) {
                      editor.chain()
                        .focus()
                        .setTextSelection({ from: pos, to: pos + node.text.length })
                        .run()
                      found = true
                      return false
                    }
                  }
                })
              }
            }
            
            // Position editor centered
            setLinkEditorPosition({
              x: window.innerWidth / 2 - 150,
              y: window.innerHeight / 2 - 100
            })
          setShowLinkEditor(true)
            setShowLinkActions(false)
          }
        }}
        onRemove={() => {
          if (editor) {
            // If we have stored link range, select it first
            if (currentLinkRange.from !== null && currentLinkRange.to !== null) {
              editor.chain()
                .focus()
                .setTextSelection({ from: currentLinkRange.from, to: currentLinkRange.to })
                .unsetLink()
                .run()
            } else {
              // Try to find the link and remove it
              const linkMark = editor.getAttributes('link')
              if (linkMark?.href) {
                // Link is selected, just remove the link
              editor.chain().focus().unsetLink().run()
              } else {
                // Search for link in document
                const { state } = editor
                state.doc.descendants((node, pos) => {
                  if (node.isText && node.marks) {
                    const linkMark = node.marks.find(mark => mark.type.name === 'link')
                    if (linkMark && linkMark.attrs.href === currentLinkHref) {
                      editor.chain()
                        .focus()
                        .setTextSelection({ from: pos, to: pos + node.text.length })
                        .unsetLink()
                        .run()
                      return false
                    }
                  }
                })
              }
            }
          }
          setShowLinkActions(false)
          setCurrentLinkRange({ from: null, to: null })
        }}
        onClose={() => setShowLinkActions(false)}
      />

      {/* Quick Tables Modal */}
      {showQuickTables && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQuickTables(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quick Tables</h3>
              <button
                onClick={() => setShowQuickTables(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Calendar Templates */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Calendar</h4>
                <div className="grid grid-cols-4 gap-3">
                  {quickTableTemplates.filter(t => t.category === 'Calendar').map((template) => (
                    <button
                      key={template.id}
                      onClick={() => insertQuickTable(template)}
                      className="p-3 border-2 border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      title={template.name}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-full mb-2">
                          <table className={`${template.styles.className} w-full text-[8px] border-collapse`} style={{ fontSize: '8px' }}>
                            <thead>
                              <tr>
                                {template.cellPlaceholders[0].slice(0, 7).map((day, idx) => (
                                  <th key={idx} style={{ 
                                    backgroundColor: template.styles.headerBg, 
                                    color: template.styles.headerTextColor || '#000',
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    textAlign: 'center'
                                  }}>{day.substring(0, 1)}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {Array(7).fill(0).map((_, idx) => (
                                  <td key={idx} style={{ 
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    height: '12px'
                                  }}></td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <span className="text-xs text-gray-600">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Double Table Template */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Double Table</h4>
                <div className="grid grid-cols-4 gap-3">
                  {quickTableTemplates.filter(t => t.category === 'Double Table').map((template) => (
                    <button
                      key={template.id}
                      onClick={() => insertQuickTable(template)}
                      className="p-3 border-2 border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      title={template.name}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-full mb-2">
                          <table className={`${template.styles.className} w-full text-[8px] border-collapse`} style={{ fontSize: '8px' }}>
                            <thead>
                              <tr>
                                {template.cellPlaceholders[0].slice(0, 4).map((header, idx) => (
                                  <th key={idx} style={{ 
                                    backgroundColor: template.styles.headerBg, 
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    textAlign: 'center'
                                  }}>C{idx+1}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {Array(4).fill(0).map((_, idx) => (
                                  <td key={idx} style={{ 
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    height: '12px'
                                  }}></td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <span className="text-xs text-gray-600">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Matrix Templates */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Matrix</h4>
                <div className="grid grid-cols-4 gap-3">
                  {quickTableTemplates.filter(t => t.category === 'Matrix').map((template) => (
                    <button
                      key={template.id}
                      onClick={() => insertQuickTable(template)}
                      className="p-3 border-2 border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      title={template.name}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-full mb-2">
                          <table className={`${template.styles.className} w-full text-[8px] border-collapse`} style={{ fontSize: '8px' }}>
                            <thead>
                              <tr>
                                {template.cellPlaceholders[0].slice(0, template.cols).map((header, idx) => (
                                  <th key={idx} style={{ 
                                    backgroundColor: template.styles.headerBg, 
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    textAlign: 'center'
                                  }}>{idx === 0 ? '' : 'H'}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {Array(template.cols).fill(0).map((_, idx) => (
                                  <td key={idx} style={{ 
                                    backgroundColor: idx === 0 ? template.styles.firstColumnBg : '',
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    height: '12px'
                                  }}></td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <span className="text-xs text-gray-600">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabular List Templates */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tabular List</h4>
                <div className="grid grid-cols-4 gap-3">
                  {quickTableTemplates.filter(t => t.category === 'Tabular List').map((template) => (
                    <button
                      key={template.id}
                      onClick={() => insertQuickTable(template)}
                      className="p-3 border-2 border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      title={template.name}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-full mb-2">
                          <table className={`${template.styles.className} w-full text-[8px] border-collapse`} style={{ fontSize: '8px' }}>
                            <thead>
                              <tr>
                                {template.cellPlaceholders[0].slice(0, template.cols).map((header, idx) => (
                                  <th key={idx} style={{ 
                                    backgroundColor: template.styles.headerBg, 
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    textAlign: 'center'
                                  }}>H{idx+1}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ backgroundColor: template.styles.bandedRows ? template.styles.alternateRowShading : '' }}>
                                {Array(template.cols).fill(0).map((_, idx) => (
                                  <td key={idx} style={{ 
                                    border: `1px solid ${template.styles.borderColor}`,
                                    padding: '2px',
                                    height: '12px'
                                  }}></td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <span className="text-xs text-gray-600">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.txt,.docx"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const content = event.target?.result
              if (typeof content === 'string') {
                editor?.commands.setContent(content)
              }
            }
            reader.readAsText(file)
          }
        }}
      />
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={addCommentForSelection}
      />
      <CommentsPanel
        threads={commentThreads}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onAddReply={addReplyToThread}
        onResolve={resolveCommentThread}
        onFocus={focusCommentThread}
        onDelete={deleteCommentThread}
        onAddComment={() => setShowCommentDialog(true)}
        editor={editor}
      />
      
      {/* Read Aloud */}
      <ReadAloud
        editor={editor}
        isOpen={showReadAloud}
        onClose={() => setShowReadAloud(false)}
      />
      
      {/* Word Count Popup */}
      {showWordCountPopup && (
        <WordCount 
          editor={editor} 
          showPopup={showWordCountPopup}
          onClose={() => setShowWordCountPopup(false)}
        />
      )}
    </div>
  )
}



