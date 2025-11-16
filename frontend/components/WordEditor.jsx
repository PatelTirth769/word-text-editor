'use client';

import { useWordEditor } from '../lib/editor';
import { EditorContent } from '@tiptap/react';
import RibbonToolbar from './RibbonToolbar';
import FindReplace from './FindReplace';
import WordCount from './WordCount';
import SpellCheck from './SpellCheck';
import TableContextMenu from './TableContextMenu';
import ElementSelector from './ElementSelector';
import DragDropManager from './DragDropManager';
import ImageResize from './ImageResize';
import { useState, useEffect, useRef } from 'react';
import { FaSave, FaFilePdf, FaFileWord, FaFolderOpen, FaSearch, FaSpellCheck, FaFileImport } from 'react-icons/fa';
import axios from 'axios';

const WordEditor = () => {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [showDocumentList, setShowDocumentList] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [showTableContextMenu, setShowTableContextMenu] = useState(false);
  const [tableContextPosition, setTableContextPosition] = useState({ x: 0, y: 0 });
  const [showElementSelector, setShowElementSelector] = useState(false);
  const [elementSelectorPosition, setElementSelectorPosition] = useState({ x: 0, y: 0 });
  const [showDragDrop, setShowDragDrop] = useState(false);

  const editor = useWordEditor('<p>Start typing your document here...</p>');
  const fileInputRef = useRef(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle table context menu
  useEffect(() => {
    if (!editor) return;

    const handleTableClick = (event) => {
      if (event.target.closest('table')) {
        event.preventDefault();
        setTableContextPosition({ x: event.clientX, y: event.clientY });
        setShowTableContextMenu(true);
      }
    };

    const handleTableRightClick = (event) => {
      if (event.target.closest('table')) {
        event.preventDefault();
        setTableContextPosition({ x: event.clientX, y: event.clientY });
        setShowTableContextMenu(true);
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleTableClick);
    editorElement.addEventListener('contextmenu', handleTableRightClick);

    return () => {
      editorElement.removeEventListener('click', handleTableClick);
      editorElement.removeEventListener('contextmenu', handleTableRightClick);
    };
  }, [editor]);

  const loadDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const saveDocument = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const content = editor.getText();
      const htmlContent = editor.getHTML();
      
      const documentData = {
        title: documentTitle,
        content,
        htmlContent
      };

      let response;
      if (documentId) {
        // Update existing document
        response = await axios.put(`http://localhost:5000/api/documents/${documentId}`, documentData);
      } else {
        // Create new document
        response = await axios.post('http://localhost:5000/api/documents', documentData);
        setDocumentId(response.data._id);
      }
      
      console.log('Document saved successfully');
      await loadDocuments(); // Refresh document list
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadDocument = async (docId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documents/${docId}`);
      const doc = response.data;
      
      setDocumentTitle(doc.title);
      setDocumentId(doc._id);
      editor.commands.setContent(doc.htmlContent);
      setShowDocumentList(false);
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Error loading document. Please try again.');
    }
  };

  const exportToPDF = async () => {
    if (!editor) return;
    
    try {
      const htmlContent = editor.getHTML();
      const response = await axios.post('http://localhost:5000/api/export/pdf', {
        htmlContent,
        title: documentTitle
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF. Please try again.');
    }
  };

  const exportToDOCX = async () => {
    if (!editor) return;
    
    try {
      const content = editor.getText();
      const response = await axios.post('http://localhost:5000/api/export/docx', {
        content,
        title: documentTitle
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentTitle}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      alert('Error exporting to DOCX. Please try again.');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!editor) return;

    const isDocx = file.name.toLowerCase().endsWith('.docx');
    if (!isDocx) {
      alert('Please select a .docx file');
      return;
    }

    try {
      const mammoth = await import('mammoth');
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result;
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          editor.commands.setContent(html || '<p></p>');
        } catch (err) {
          console.error('Error converting DOCX:', err);
          alert('Failed to import the DOCX file.');
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Could not read the selected file.');
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Ensure the file is a valid .docx.');
    }
  };

  const createNewDocument = () => {
    setDocumentTitle('Untitled Document');
    setDocumentId(null);
    editor.commands.setContent('<p>Start typing your document here...</p>');
    setShowDocumentList(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full" style={{ paddingTop: '64px' }}>
      {/* Document Header */}
      <div className="document-header w-full">
        <div className="flex items-center gap-4">
          <h1 className="document-title">Word-like Editor</h1>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="px-3 py-1 text-black bg-white rounded border-none"
            style={{ minWidth: '200px' }}
          />
        </div>
        
        <div className="document-actions">
          {/* Hidden file input for importing DOCX */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelected}
            style={{ display: 'none' }}
          />

          <button
            className="toolbar-button bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => setShowDocumentList(!showDocumentList)}
            title="Open Document"
          >
            <FaFolderOpen className="mr-1" />
            Open
          </button>

          <button
            className="toolbar-button bg-white text-indigo-600 hover:bg-gray-100"
            onClick={handleImportClick}
            title="Import DOCX"
          >
            <FaFileImport className="mr-1" />
            Import
          </button>
          
          <button
            className="toolbar-button bg-white text-green-600 hover:bg-gray-100"
            onClick={saveDocument}
            disabled={isSaving}
            title="Save Document"
          >
            <FaSave className="mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button
            className="toolbar-button bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => setShowFindReplace(!showFindReplace)}
            title="Find and Replace"
          >
            <FaSearch className="mr-1" />
            Find
          </button>
          
          <button
            className="toolbar-button bg-white text-orange-600 hover:bg-gray-100"
            onClick={() => setShowSpellCheck(!showSpellCheck)}
            title="Spell Check"
          >
            <FaSpellCheck className="mr-1" />
            Spell
          </button>
          
          <WordCount editor={editor} />
          
          <button
            className="toolbar-button bg-white text-red-600 hover:bg-gray-100"
            onClick={exportToPDF}
            title="Export to PDF"
          >
            <FaFilePdf className="mr-1" />
            PDF
          </button>
          
          <button
            className="toolbar-button bg-white text-blue-600 hover:bg-gray-100"
            onClick={exportToDOCX}
            title="Export to Word"
          >
            <FaFileWord className="mr-1" />
            DOCX
          </button>
        </div>
      </div>

      {/* Workspace: Sidebar (tabs + tools) on the left, page on the right */}
      <div className="workspace-side">
        <RibbonToolbar editor={editor} onOpenReadAloud={() => {}} />

      {/* Document List Modal */}
      {showDocumentList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Open Document</h2>
              <div className="flex gap-2">
                <button
                  className="toolbar-button bg-blue-500 text-white"
                  onClick={createNewDocument}
                >
                  New Document
                </button>
                <button
                  className="toolbar-button bg-gray-500 text-white"
                  onClick={() => setShowDocumentList(false)}
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="p-3 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadDocument(doc._id)}
                >
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-gray-600">
                    Last modified: {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No documents found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Find and Replace */}
      <FindReplace 
        editor={editor} 
        isOpen={showFindReplace} 
        onClose={() => setShowFindReplace(false)} 
      />

      {/* Inline spell check now via context/right-click; panel removed */}

      {/* Table Context Menu */}
      <TableContextMenu 
        editor={editor} 
        isOpen={showTableContextMenu} 
        onClose={() => setShowTableContextMenu(false)}
        position={tableContextPosition}
      />

      {/* Element Selector */}
      <ElementSelector 
        editor={editor} 
        isOpen={showElementSelector} 
        onClose={() => setShowElementSelector(false)}
        position={elementSelectorPosition}
      />

      {/* Drag Drop Manager */}
      <DragDropManager 
        editor={editor} 
        isOpen={showDragDrop} 
        onClose={() => setShowDragDrop(false)}
      />

      {/* Image Resize Handler */}
      <ImageResize editor={editor} />

        <div className="document-container">
          <EditorContent 
            editor={editor} 
            className="focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default WordEditor;
