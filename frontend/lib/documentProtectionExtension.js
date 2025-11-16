import { Extension } from '@tiptap/core'
import { Plugin, TextSelection } from '@tiptap/pm/state'

export const DocumentProtection = Extension.create({
  name: 'documentProtection',

  addKeyboardShortcuts() {
    return {
      'Mod-a': () => {
        // Override Ctrl+A to select all text but preserve document structure
        const { state, view } = this.editor
        const { tr } = state
        
        // Select all content using the correct ProseMirror API
        const newSelection = TextSelection.create(state.doc, 0, state.doc.content.size)
        
        view.dispatch(tr.setSelection(newSelection))
        return true
      },
      
      'Backspace': () => {
        const { state, view } = this.editor
        const { selection } = state
        
        // Check if entire document is selected
        if (selection.from === 0 && selection.to === state.doc.content.size) {
          // Prevent deletion of document structure - always preserve at least one page with a paragraph
          const tr = state.tr
          const { doc, schema } = state
          const pageType = schema.nodes.pageBlock
          const paragraphType = schema.nodes.paragraph

          if (pageType) {
            // Collect all page content ranges and replace each with a single empty paragraph
            const pageRanges = []
            doc.descendants((node, pos) => {
              if (node.type === pageType) {
                const from = pos + 1
                const to = pos + node.nodeSize - 1
                pageRanges.push({ from, to })
              }
            })
            // Replace ranges in reverse order to keep positions valid
            for (let i = pageRanges.length - 1; i >= 0; i -= 1) {
              const { from, to } = pageRanges[i]
              tr.replaceWith(from, to, paragraphType ? paragraphType.create() : null)
            }
            // If there were no pages for some reason, ensure at least one paragraph at root
            if (pageRanges.length === 0 && paragraphType) {
              tr.replaceWith(0, doc.content.size, paragraphType.create())
            }
          } else if (paragraphType) {
            // Fallback: replace entire doc with a single empty paragraph
            tr.replaceWith(0, doc.content.size, paragraphType.create())
          }

          view.dispatch(tr)
          const newState = view.state
          const newTr = newState.tr
          // Place cursor at the start of the document (position 1 is generally safe inside first node)
          newTr.setSelection(TextSelection.create(newState.doc, Math.min(1, newState.doc.content.size)))
          view.dispatch(newTr)
          return true
        }
        
        return false
      },
      
      'Delete': () => {
        const { state, view } = this.editor
        const { selection } = state
        
        // Check if entire document is selected
        if (selection.from === 0 && selection.to === state.doc.content.size) {
          // Prevent deletion of document structure - always preserve at least one page with a paragraph
          const tr = state.tr
          const { doc, schema } = state
          const pageType = schema.nodes.pageBlock
          const paragraphType = schema.nodes.paragraph

          if (pageType) {
            // Collect all page content ranges and replace each with a single empty paragraph
            const pageRanges = []
            doc.descendants((node, pos) => {
              if (node.type === pageType) {
                const from = pos + 1
                const to = pos + node.nodeSize - 1
                pageRanges.push({ from, to })
              }
            })
            // Replace ranges in reverse order to keep positions valid
            for (let i = pageRanges.length - 1; i >= 0; i -= 1) {
              const { from, to } = pageRanges[i]
              tr.replaceWith(from, to, paragraphType ? paragraphType.create() : null)
            }
            // If there were no pages for some reason, ensure at least one paragraph at root
            if (pageRanges.length === 0 && paragraphType) {
              tr.replaceWith(0, doc.content.size, paragraphType.create())
            }
          } else if (paragraphType) {
            // Fallback: replace entire doc with a single empty paragraph
            tr.replaceWith(0, doc.content.size, paragraphType.create())
          }

          view.dispatch(tr)
          const newState = view.state
          const newTr = newState.tr
          newTr.setSelection(TextSelection.create(newState.doc, Math.min(1, newState.doc.content.size)))
          view.dispatch(newTr)
          return true
        }
        
        return false
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: 'documentProtection',
        props: {
          handleKeyDown: (view, event) => {
            // Handle Ctrl+A + Backspace/Delete combination
            if ((event.key === 'Backspace' || event.key === 'Delete') && (event.ctrlKey || event.metaKey)) {
              const { state } = view
              const { selection } = state
              
              if (selection.from === 0 && selection.to === state.doc.content.size) {
                event.preventDefault()
                
                const tr = state.tr
                const doc = state.doc
                
                // Clear text content but preserve structure
                doc.descendants((node, pos) => {
                  if (node.isText && node.textContent.trim()) {
                    tr.delete(pos, pos + node.nodeSize)
                  }
                })
                
                // Ensure we have at least one paragraph
                if (doc.childCount === 0 || (doc.childCount === 1 && doc.firstChild?.type.name === 'doc')) {
                  tr.insert(0, state.schema.nodes.paragraph.create())
                }
                
                // Apply the transaction first, then set selection on the new document
                view.dispatch(tr)
                
                // Set cursor to the beginning after the transaction is applied
                const newState = view.state
                const newTr = newState.tr
                newTr.setSelection(TextSelection.create(newState.doc, 0))
                view.dispatch(newTr)
                return true
              }
            }
            
            return false
          }
        }
      })
    ]
  },

  onCreate() {
    // Ensure document structure is always maintained
    const { editor } = this
    
    // Add a command to ensure document structure
    editor.commands.setDocumentProtection = () => {
      const { state } = editor
      const { doc } = state
      
      // Check if document has proper structure
      let needsStructure = false
      if (doc.childCount === 0) {
        needsStructure = true
      } else {
        // Check if we have at least one paragraph or page block
        let hasContent = false
        doc.descendants((node) => {
          if (node.type.name === 'paragraph' || node.type.name === 'pageBlock' || node.type.name === 'document-page') {
            hasContent = true
          }
        })
        if (!hasContent) {
          needsStructure = true
        }
      }
      
      if (needsStructure) {
        // Create a basic document structure
        const tr = state.tr
        tr.insert(0, state.schema.nodes.paragraph.create())
        editor.view.dispatch(tr)
        
        // Set cursor to the beginning after the transaction is applied
        const newState = editor.view.state
        const newTr = newState.tr
        newTr.setSelection(TextSelection.create(newState.doc, 0))
        editor.view.dispatch(newTr)
      }
    }
  }
})
