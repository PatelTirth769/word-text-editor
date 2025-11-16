'use client'

import { useState } from 'react'

const CommentDialog = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && comment.trim()) {
      onSubmit(name.trim(), comment.trim())
      setName('')
      setComment('')
      onClose()
    }
  }

  const handleCancel = () => {
    setName('')
    setComment('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              id="comment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment-text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your comment"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !comment.trim()}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommentDialog

