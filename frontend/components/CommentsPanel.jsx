import { useState } from 'react'
import ReplyDialog from './ReplyDialog'

const CommentsPanel = ({
  threads,
  onAddReply,
  onResolve,
  onFocus,
  onDelete,
  isOpen,
  onClose,
  onAddComment,
  editor,
}) => {
  if (!isOpen) return null

  const handleAddComment = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      // Text is selected, trigger add comment
      if (onAddComment) {
        onAddComment()
      }
    } else {
      // No selection, show message
      alert('Please select text to add a comment.')
    }
  }

  return (
    <div className="fixed right-2 top-16 bottom-2 w-80 bg-white border border-gray-300 rounded shadow-lg z-50 flex flex-col">
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div className="font-semibold">Comments</div>
        <div className="flex items-center gap-2">
          {onAddComment && (
            <button
              onClick={handleAddComment}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              title="Add Comment"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
          <button className="text-sm text-gray-600 hover:text-gray-900" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {threads.length === 0 && (
          <div className="text-sm text-gray-500">No comments yet. Select text and click "Add" to add a comment.</div>
        )}
        {threads.map(thread => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            onAddReply={onAddReply}
            onResolve={onResolve}
            onFocus={onFocus}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

const ThreadItem = ({ thread, onAddReply, onResolve, onFocus, onDelete }) => {
  const [showReplyDialog, setShowReplyDialog] = useState(false)

  const handleAddReply = (name, text) => {
    onAddReply(thread.id, name, text)
  }

  return (
    <>
      <div className={`border rounded p-2 ${thread.resolved ? 'opacity-70' : ''}`}>
        <div className="flex items-center justify-between">
          <button className="text-left font-medium hover:underline" onClick={() => onFocus(thread.id)}>
            Thread #{thread.id.slice(0, 6)}
          </button>
          <div className="flex items-center gap-2">
            {!thread.resolved && (
              <button className="text-xs px-2 py-1 bg-green-600 text-white rounded" onClick={() => onResolve(thread.id)}>Resolve</button>
            )}
            <button className="text-xs px-2 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(thread.id)}>Delete</button>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {thread.comments.map((c, idx) => (
            <div key={c.id} className="text-sm">
              <span className="font-semibold">{idx === 0 ? (thread.authorName || 'Author') : (c.authorName || 'Reply')}</span>: {c.text}
            </div>
          ))}
        </div>
        {!thread.resolved && (
          <div className="mt-2">
            <button
              className="w-full text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowReplyDialog(true)}
            >
              Add Reply
            </button>
          </div>
        )}
      </div>
      <ReplyDialog
        isOpen={showReplyDialog}
        onClose={() => setShowReplyDialog(false)}
        onSubmit={handleAddReply}
      />
    </>
  )
}

export default CommentsPanel
