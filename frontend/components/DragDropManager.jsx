'use client';

import { useState, useEffect } from 'react';
import { FaImage, FaPlus, FaTable } from 'react-icons/fa';

const DragDropManager = ({ editor, isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            editor.chain().focus().setImage({ src: event.target.result }).run();
          };
          reader.readAsDataURL(file);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('dragenter', handleDrag);
      document.addEventListener('dragover', handleDrag);
      document.addEventListener('dragleave', handleDrag);
      document.addEventListener('drop', handleDrop);
    }

    return () => {
      document.removeEventListener('dragenter', handleDrag);
      document.removeEventListener('dragover', handleDrag);
      document.removeEventListener('dragleave', handleDrag);
      document.removeEventListener('drop', handleDrop);
    };
  }, [isOpen, editor]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-40 ${dragActive ? 'bg-blue-100 bg-opacity-50' : 'bg-transparent'}`}>
      <div className="flex items-center justify-center h-full">
        <div className="bg-white border-2 border-dashed border-blue-400 rounded-lg p-8 text-center">
          <div className="text-4xl text-blue-400 mb-4">
            <FaPlus />
          </div>
          <p className="text-lg text-gray-600">Drop files here to insert</p>
        </div>
      </div>
    </div>
  );
};

export default DragDropManager;







