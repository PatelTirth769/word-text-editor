import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'

const AutoPagePluginKey = new PluginKey('autoPage')

export const AutoPageExtension = Extension.create({
  name: 'autoPage',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // After Enter, check if we need to create a new page
        setTimeout(() => {
          const { state } = editor.view
          const { doc, schema, selection } = state
          const pageType = schema.nodes.pageBlock
          if (!pageType) return false

          // Find all pages
          const pages = []
          doc.descendants((node, pos) => {
            if (node.type === pageType) {
              pages.push({ node, pos, start: pos + 1, end: pos + node.nodeSize - 1 })
            }
          })

          if (pages.length === 0) return false

          // Check if cursor is in the last page
          const lastPage = pages[pages.length - 1]
          const cursorPos = selection.$to.pos
          const isInLastPage = cursorPos >= lastPage.start && cursorPos <= lastPage.end

          if (!isInLastPage) return false

          // Check DOM overflow
          const lastPageElement = document.querySelector('.ProseMirror .document-page:last-child')
          if (!lastPageElement) return false

          const pageHeight = lastPageElement.clientHeight
          const contentHeight = lastPageElement.scrollHeight
          const overflowPx = contentHeight - pageHeight
          
          // Only create new page if actually overflowing with meaningful content
          const hasActualContent = lastPage.node.textContent.trim().length > 0
          
          if (overflowPx > 2 && hasActualContent) {
            const tr = state.tr
            // Use createAndFill to ensure same structure as manually inserted pages
            const newPage = pageType.createAndFill()
            if (!newPage) return false
            
            const insertPos = doc.content.size
            tr.insert(insertPos, newPage)
            const newPageStart = insertPos + 1
            tr.setSelection(TextSelection.create(tr.doc, newPageStart))
            editor.view.dispatch(tr)
            return true
          }
        }, 50)
        return false // Let Enter proceed normally
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: AutoPagePluginKey,
        appendTransaction: (transactions, oldState, newState) => {
          // Only process if document content actually changed (not just selection)
          if (!transactions.some(tr => tr.docChanged)) {
            return null
          }

          const { doc, schema, selection } = newState
          const pageType = schema.nodes.pageBlock
          if (!pageType) return null

          // Find all pages
          const pages = []
          doc.descendants((node, pos) => {
            if (node.type === pageType) {
              pages.push({ node, pos, start: pos + 1, end: pos + node.nodeSize - 1 })
            }
          })

          if (pages.length === 0) return null

          // Check if cursor is in the last page
          const lastPage = pages[pages.length - 1]
          const cursorPos = selection.$to.pos

          // Check if cursor is in the last page
          const isInLastPage = cursorPos >= lastPage.start && cursorPos <= lastPage.end

          if (!isInLastPage) return null

          // Use DOM to check if page is overflowing (only create page if actually overflowing)
          const lastPageElement = document.querySelector('.ProseMirror .document-page:last-child')
          if (!lastPageElement) return null

          // Check if page is full using DOM measurements
          const pageHeight = lastPageElement.clientHeight
          const contentHeight = lastPageElement.scrollHeight
          const overflowPx = contentHeight - pageHeight
          
          // Only create new page if actually overflowing with meaningful content
          // Check that there's actual text content (not just empty space)
          const hasActualContent = lastPage.node.textContent.trim().length > 0
          
          // Only create page if:
          // 1. There's actual overflow (more than 2px threshold)
          // 2. There's actual content in the page (not just empty paragraphs)
          if (overflowPx > 2 && hasActualContent) {
            const tr = newState.tr

            // Use createAndFill to ensure same structure as manually inserted pages
            const newPage = pageType.createAndFill()
            if (!newPage) return null

            // Insert new page at the end
            const insertPos = doc.content.size
            tr.insert(insertPos, newPage)

            // Calculate position at start of new page (after opening tag)
            const newPageStart = insertPos + 1
            tr.setSelection(TextSelection.create(tr.doc, newPageStart))

            return tr
          }

          return null
        },

      }),
    ]
  },
})

