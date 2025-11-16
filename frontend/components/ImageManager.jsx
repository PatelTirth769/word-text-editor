'use client';

import { useState, useRef } from 'react';
import { FaImage, FaUpload, FaLink, FaTimes, FaDownload, FaImages } from 'react-icons/fa';
import ImageGallery from './ImageGallery';

const ImageManager = ({ editor, isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const insertImageFromUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      onClose();
    }
  };

  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result;
          // Store the uploaded image
          const imageId = Date.now() + Math.random();
          setUploadedImages(prev => [...prev, { id: imageId, src: imageData, name: file.name }]);
          
          // Insert the image into the editor
          editor.chain().focus().setImage({ src: imageData }).run();
        };
        reader.readAsDataURL(file);
      }
    });
    onClose();
  };

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
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const insertStoredImage = (imageSrc) => {
    editor.chain().focus().setImage({ src: imageSrc }).run();
    onClose();
  };

  const removeStoredImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const downloadImage = (imageSrc, imageName) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageName || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGallerySelect = (imageUrl) => {
    editor.chain().focus().setImage({ src: imageUrl }).run();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Image Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload from URL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insert from URL</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={insertImageFromUrl}
                    disabled={!imageUrl.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaLink />
                    Insert
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload from Computer */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload from Computer</h3>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop images here, or click to select
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Choose Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* File Input Alternative */}
            <div className="text-center space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2 mx-auto"
              >
                <FaUpload />
                Browse Files
              </button>
              <button
                onClick={() => setShowGallery(true)}
                className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 flex items-center gap-2 mx-auto"
              >
                <FaImages />
                Image Gallery
              </button>
            </div>
          </div>
        </div>

        {/* Stored Images Gallery */}
        {uploadedImages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recently Uploaded Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => insertStoredImage(image.src)}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      <button
                        onClick={() => insertStoredImage(image.src)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                        title="Insert Image"
                      >
                        <FaImage />
                      </button>
                      <button
                        onClick={() => downloadImage(image.src, image.name)}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                        title="Download Image"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => removeStoredImage(image.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        title="Remove Image"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Image Options - Only Random Image */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Quick Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map((i) => (
              <button
                key={i}
                onClick={() => {
                  setImageUrl(`https://picsum.photos/seed/${Date.now()+i}/600/400`);
                  insertImageFromUrl();
                }}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 border">
                  <img src={`https://picsum.photos/seed/preview${i}/112/112`} alt="random" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Random Image #{i}</p>
                  <p className="text-xs text-gray-500">Picsum placeholder</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGallery 
        isOpen={showGallery} 
        onClose={() => setShowGallery(false)}
        onSelectImage={handleGallerySelect}
      />
    </div>
  );
};

export default ImageManager;
