import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// Comment mark to annotate ranges with a threadId. Uses decorations for visual styling.
export const CommentMark = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: element => element.getAttribute('data-thread-id'),
        renderHTML: attributes => ({ 'data-thread-id': attributes.threadId }),
      },
      resolved: {
        default: false,
        parseHTML: element => element.getAttribute('data-resolved') === 'true',
        renderHTML: attributes => ({ 'data-resolved': String(attributes.resolved) }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-thread-id]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      addCommentMark:
        attrs => ({ commands }) => {
          if (!attrs?.threadId) return false;
          return commands.setMark(this.name, attrs)
        },
      removeCommentMark:
        attrs => ({ state, tr, dispatch }) => {
          if (!attrs?.threadId) return false
          const markType = state.schema.marks.comment
          if (!markType) return false
          
          // Find all text nodes with this comment mark and collect their positions
          const positions = []
          state.doc.descendants((node, pos) => {
            if (node.isText && node.marks) {
              const commentMark = node.marks.find(mk => mk.type.name === 'comment' && mk.attrs.threadId === attrs.threadId)
              if (commentMark) {
                positions.push({ from: pos, to: pos + node.nodeSize })
              }
            }
          })
          
          // Remove marks from all found positions
          positions.forEach(({ from, to }) => {
            tr.removeMark(from, to, markType)
          })
          
          if (dispatch) dispatch(tr)
          return true
        },
      resolveCommentMark:
        threadId => ({ state, tr, dispatch }) => {
          const markType = state.schema.marks.comment
          if (!markType) return false
          
          // Find all text nodes with this comment mark and remove the mark (no highlight when resolved)
          const positions = []
          state.doc.descendants((node, pos) => {
            if (node.isText && node.marks) {
              const commentMark = node.marks.find(mk => mk.type.name === 'comment' && mk.attrs.threadId === threadId)
              if (commentMark) {
                positions.push({ from: pos, to: pos + node.nodeSize })
              }
            }
          })
          
          // Remove marks from all found positions
          positions.forEach(({ from, to }) => {
            tr.removeMark(from, to, markType)
          })
          
          if (dispatch) dispatch(tr)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            const decorations = []
            const { doc } = state
            doc.descendants((node, pos) => {
              if (!node.isText) return true
              node.marks.forEach(mark => {
                if (mark.type.name === 'comment' && mark.attrs.threadId) {
                  const resolved = !!mark.attrs.resolved
                  const className = resolved ? 'tiptap-comment--resolved' : 'tiptap-comment--active'
                  decorations.push(
                    Decoration.inline(pos, pos + node.nodeSize, { class: className, 'data-thread-id': mark.attrs.threadId })
                  )
                }
              })
              return true
            })
            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

export default CommentMark
