'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTrash, FaEye, FaUpload } from 'react-icons/fa';
import axios from 'axios';

const ImageGallery = ({ isOpen, onClose, onSelectImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    onSelectImage(imageUrl);
    onClose();
  };

  const handleImageDelete = async (imageId) => {
    try {
      await axios.delete(`http://localhost:5000/api/images/${imageId}`);
      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageDownload = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Image Gallery</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8">
            <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">No images uploaded yet</p>
            <p className="text-sm text-gray-500 mt-2">Upload some images to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleImageSelect(image.url)}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    <button
                      onClick={() => handleImageSelect(image.url)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                      title="Select Image"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleImageDownload(image.url, image.name)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                      title="Download Image"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => handleImageDelete(image.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      title="Delete Image"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                  {image.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(image.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;





















































