import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const CursorBoundaryPluginKey = new PluginKey('cursorBoundary')

export const CursorBoundaryExtension = Extension.create({
  name: 'cursorBoundary',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: CursorBoundaryPluginKey,
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const { state } = view
              const { doc } = state
              
              // Check if click is actually within a page DOM element
              const target = event.target
              const clickedPageElement = target.closest?.('.document-page')
              
              // If click is not within a page element (e.g., on ruler, between pages, etc.)
              if (!clickedPageElement) {
                // Find the nearest page element
                const allPages = Array.from(document.querySelectorAll('.document-page'))
                if (allPages.length === 0) return false
                
                // Get click coordinates
                const clickX = event.clientX
                const clickY = event.clientY
                
                // Find the nearest page to the click
                let nearestPage = null
                let minDistance = Infinity
                
                allPages.forEach((pageEl) => {
                  const rect = pageEl.getBoundingClientRect()
                  const pageCenterX = rect.left + rect.width / 2
                  const pageCenterY = rect.top + rect.height / 2
                  
                  // Calculate distance from click to page center
                  const distance = Math.sqrt(
                    Math.pow(clickX - pageCenterX, 2) + Math.pow(clickY - pageCenterY, 2)
                  )
                  
                  // Also check if click is vertically within page bounds (above or below)
                  const isVerticallyAligned = clickY >= rect.top && clickY <= rect.bottom
                  
                  if (distance < minDistance || (isVerticallyAligned && clickY >= rect.top && clickY <= rect.bottom)) {
                    minDistance = distance
                    nearestPage = pageEl
                  }
                })
                
                if (nearestPage) {
                  // Find the corresponding page node in the document
                  const pages = []
                  doc.descendants((node, nodePos) => {
                    if (node.type.name === 'pageBlock') {
                      const start = nodePos + 1
                      const end = nodePos + node.nodeSize - 1
                      pages.push({ start, end, node })
                    }
                  })
                  
                  // Find which page index this element corresponds to
                  const pageIndex = allPages.indexOf(nearestPage)
                  if (pageIndex >= 0 && pageIndex < pages.length) {
                    const targetPage = pages[pageIndex]
                    
                    // Calculate position within the page based on click Y coordinate
                    const pageRect = nearestPage.getBoundingClientRect()
                    const relativeY = clickY - pageRect.top
                    const pageHeight = pageRect.height
                    
                    // Try to position cursor at a reasonable position within the page
                    let targetPos = targetPage.start
                    
                    // If click is in the upper half, move to start, otherwise move towards end
                    if (relativeY > pageHeight / 2 && relativeY < pageHeight * 0.9) {
                      // Try to find a position near the end of the page
                      targetPos = Math.min(targetPage.end - 1, targetPage.start + 10)
                    }
                    
                    event.preventDefault()
                    event.stopPropagation()
                    
                    const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(targetPos)))
                    view.dispatch(tr)
                    return true
                  }
                }
                
                return false
              }
              
              // If click is within a page, check if position is valid
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (!pos) return false
              
              // Find all page blocks and their positions
              const pages = []
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock') {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  pages.push({ start, end, node })
                }
              })
              
              // Check if click is between pages
              let isBetweenPages = false
              let targetPage = null
              
              for (let i = 0; i < pages.length; i++) {
                const page = pages[i]
                
                // If click is within this page
                if (pos.pos >= page.start && pos.pos <= page.end) {
                  targetPage = page
                  break
                }
                
                // If click is between this page and the next page
                if (i < pages.length - 1) {
                  const nextPage = pages[i + 1]
                  if (pos.pos > page.end && pos.pos < nextPage.start) {
                    isBetweenPages = true
                    targetPage = pos.pos - page.end < nextPage.start - pos.pos ? page : nextPage
                    break
                  }
                }
              }
              
              // If clicking before first page
              if (pages.length > 0 && pos.pos < pages[0].start) {
                isBetweenPages = true
                targetPage = pages[0]
              }
              
              // If clicking after last page
              if (pages.length > 0 && pos.pos > pages[pages.length - 1].end) {
                isBetweenPages = true
                targetPage = pages[pages.length - 1]
              }
              
              // If clicking between pages, prevent default and move cursor to page
              if (isBetweenPages && targetPage) {
                event.preventDefault()
                event.stopPropagation()
                
                // Move cursor to the start of the target page
                const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(targetPage.start)))
                view.dispatch(tr)
                return true
              }
              
              // Ensure position is within page boundaries
              if (targetPage) {
                if (pos.pos < targetPage.start || pos.pos > targetPage.end) {
                  event.preventDefault()
                  event.stopPropagation()
                  
                  // Clamp position to page boundaries
                  const clampedPos = Math.max(targetPage.start, Math.min(targetPage.end, pos.pos))
                  const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(clampedPos)))
                  view.dispatch(tr)
                  return true
                }
              }
              
              return false
            }
          },
          
          handleClick: (view, pos, event) => {
            const { state } = view
            const { doc } = state
            
            // Find all page blocks and their positions
            const pages = []
            doc.descendants((node, nodePos) => {
              if (node.type.name === 'pageBlock') {
                const start = nodePos + 1
                const end = nodePos + node.nodeSize - 1
                pages.push({ start, end, node })
              }
            })
            
            if (pages.length === 0) {
              // If no pages exist, create one
              const tr = state.tr
              const pageType = state.schema.nodes.pageBlock
              const paragraphType = state.schema.nodes.paragraph
              
              if (pageType && paragraphType) {
                const newPage = pageType.create({}, paragraphType.create())
                tr.insert(0, newPage)
                view.dispatch(tr)
                return true
              }
              return false
            }
            
            // Check if click is between pages or outside pages
            let isBetweenPages = false
            let targetPage = null
            
            for (let i = 0; i < pages.length; i++) {
              const page = pages[i]
              
              // If click is within this page
              if (pos >= page.start && pos < page.end) {
                targetPage = page
                break
              }
              
              // If click is between this page and the next page
              if (i < pages.length - 1) {
                const nextPage = pages[i + 1]
                if (pos >= page.end && pos < nextPage.start) {
                  isBetweenPages = true
                  // Move to the nearest page
                  targetPage = pos - page.end < nextPage.start - pos ? page : nextPage
                  break
                }
              }
            }
            
            // If clicking before first page
            if (pos < pages[0].start) {
              isBetweenPages = true
              targetPage = pages[0]
            }
            
            // If clicking after last page
            if (pos >= pages[pages.length - 1].end) {
              isBetweenPages = true
              targetPage = pages[pages.length - 1]
            }
            
            // If clicking between pages or outside pages, move cursor to target page
            if (isBetweenPages || !targetPage) {
              if (targetPage) {
                // Move cursor to the start of the target page
                const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(targetPage.start)))
                view.dispatch(tr)
                return true
              }
            }
            
            // Ensure cursor is within page boundaries
            if (targetPage) {
              if (pos < targetPage.start) {
                const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(targetPage.start)))
                view.dispatch(tr)
                return true
              }
              if (pos >= targetPage.end) {
                const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(Math.max(targetPage.start, targetPage.end - 1))))
                view.dispatch(tr)
                return true
              }
            }
            
            return false
          },
          
          handleKeyDown: (view, event) => {
            const { state } = view
            const { selection } = state
            const { from, to } = selection
            
            // Helper functions to check page boundaries
            const isAtPageStart = (state, pos) => {
              const { doc } = state
              let pageStart = 0
              
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock') {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  
                  if (pos >= start && pos <= end) {
                    pageStart = start
                  }
                }
              })
              
              return pos <= pageStart + 1 // Allow some tolerance
            }
            
            const isAtPageEnd = (state, pos) => {
              const { doc } = state
              let pageEnd = 0
              
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock') {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  
                  if (pos >= start && pos <= end) {
                    pageEnd = end
                  }
                }
              })
              
              return pos >= pageEnd - 1 // Allow some tolerance
            }
            
            // Helper functions for navigation
            const moveToPreviousPage = (view, state) => {
              const { doc } = state
              const { selection } = state
              const currentPos = selection.from
              
              let previousPageEnd = 0
              let found = false
              
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock' && !found) {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  
                  if (currentPos > end) {
                    previousPageEnd = end
                  } else if (currentPos >= start && currentPos <= end) {
                    found = true
                  }
                }
              })
              
              if (previousPageEnd > 0) {
                const tr = state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(previousPageEnd)))
                view.dispatch(tr)
              }
            }
            
            const moveToNextPage = (view, state) => {
              const { doc } = state
              const { selection } = state
              const currentPos = selection.from
              
              let nextPageStart = 0
              let found = false
              
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock' && !found) {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  
                  if (currentPos < start && nextPageStart === 0) {
                    nextPageStart = start
                  } else if (currentPos >= start && currentPos <= end) {
                    found = true
                  }
                }
              })
              
              if (nextPageStart > 0) {
                const tr = state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(nextPageStart)))
                view.dispatch(tr)
              }
            }
            
            const moveToPageStart = (view, state) => {
              const { doc } = state
              const { selection } = state
              const currentPos = selection.from
              
              let pageStart = 0
              
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock') {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  
                  if (currentPos >= start && currentPos <= end) {
                    pageStart = start
                  }
                }
              })
              
              if (pageStart > 0) {
                const tr = state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(pageStart)))
                view.dispatch(tr)
              }
            }
            
            const moveToPageEnd = (view, state) => {
              const { doc } = state
              const { selection } = state
              const currentPos = selection.from
              
              let pageEnd = 0
              
              doc.descendants((node, nodePos) => {
                if (node.type.name === 'pageBlock') {
                  const start = nodePos + 1
                  const end = nodePos + node.nodeSize - 1
                  
                  if (currentPos >= start && currentPos <= end) {
                    pageEnd = end
                  }
                }
              })
              
              if (pageEnd > 0) {
                const tr = state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(pageEnd)))
                view.dispatch(tr)
              }
            }
            
            // Check if cursor is at page boundaries
            const atPageStart = isAtPageStart(state, from)
            const atPageEnd = isAtPageEnd(state, to)
            
            // Prevent cursor from moving outside page boundaries
            if (event.key === 'ArrowUp' && atPageStart) {
              event.preventDefault()
              moveToPreviousPage(view, state)
              return true
            }
            
            if (event.key === 'ArrowDown' && atPageEnd) {
              event.preventDefault()
              moveToNextPage(view, state)
              return true
            }
            
            if (event.key === 'Home' && atPageStart) {
              event.preventDefault()
              moveToPageStart(view, state)
              return true
            }
            
            if (event.key === 'End' && atPageEnd) {
              event.preventDefault()
              moveToPageEnd(view, state)
              return true
            }
            
            return false
          }
        },
        
        // Add a selection handler to prevent selection between pages
        appendTransaction: (transactions, oldState, newState) => {
          // Guard against undefined newState
          if (!newState || !newState.doc || !newState.selection) {
            return null
          }
          
          const { selection } = newState
          const { from, to } = selection
          
          // Find all page blocks
          const pages = []
          newState.doc.descendants((node, nodePos) => {
            if (node.type.name === 'pageBlock') {
              const start = nodePos + 1
              const end = nodePos + node.nodeSize - 1
              pages.push({ start, end })
            }
          })
          
          if (pages.length === 0) return null
          
          // Check if selection is between pages or outside pages
          let needsCorrection = false
          let targetPage = null
          
          // Check if selection is completely outside all pages
          if (from < pages[0].start || to > pages[pages.length - 1].end) {
            needsCorrection = true
            // If before first page, target first page
            if (from < pages[0].start) {
              targetPage = pages[0]
            } else {
              // If after last page, target last page
              targetPage = pages[pages.length - 1]
            }
          } else {
            // Find which page contains the selection
            for (let i = 0; i < pages.length; i++) {
              const page = pages[i]
              
              // If selection is within this page
              if (from >= page.start && to <= page.end) {
                targetPage = page
                break
              }
              
              // If selection spans across pages or is between pages
              if (from < page.start || to > page.end) {
                needsCorrection = true
                // Find the page that contains most of the selection
                if (from >= page.start && from <= page.end) {
                  targetPage = page
                  break
                } else if (to >= page.start && to <= page.end) {
                  targetPage = page
                  break
                } else if (i > 0 && from > pages[i-1].end && to < page.start) {
                  // Selection is between pages - choose the nearest page
                  const distToPrev = from - pages[i-1].end
                  const distToNext = page.start - to
                  targetPage = distToPrev < distToNext ? pages[i-1] : page
                  break
                }
              }
            }
          }
          
          // If selection needs correction, move it to a valid page
          if (needsCorrection && targetPage) {
            const tr = newState.tr
            // Clamp selection to page boundaries
            const newFrom = Math.max(targetPage.start, Math.min(from, targetPage.end - 1))
            const newTo = Math.min(targetPage.end - 1, Math.max(to, targetPage.start))
            
            // Ensure from <= to
            const finalFrom = Math.min(newFrom, newTo)
            const finalTo = Math.max(newFrom, newTo)
            
            if (finalFrom !== from || finalTo !== to) {
              try {
                // Use TextSelection to create a new selection
                const resolvedPos = newState.doc.resolve(finalFrom)
                // Ensure the position is valid
                if (resolvedPos && resolvedPos.pos >= 0 && resolvedPos.pos <= newState.doc.content.size) {
                  // If it's a range selection, try to preserve it
                  if (finalFrom !== finalTo) {
                    const resolvedTo = newState.doc.resolve(Math.min(finalTo, newState.doc.content.size))
                    if (resolvedTo.pos > resolvedPos.pos) {
                      tr.setSelection(TextSelection.create(newState.doc, resolvedPos.pos, resolvedTo.pos))
                    } else {
                      tr.setSelection(TextSelection.near(resolvedPos))
                    }
                  } else {
                    tr.setSelection(TextSelection.near(resolvedPos))
                  }
                  return tr
                }
              } catch (error) {
                // If there's an error creating the selection, return null
                console.warn('Error setting selection in cursorBoundaryExtension:', error)
                return null
              }
            }
          }
          
          // Also ensure cursor position is always within a page
          const currentPos = selection.$anchor.pos
          let posInPage = false
          for (const page of pages) {
            if (currentPos >= page.start && currentPos < page.end) {
              posInPage = true
              break
            }
          }
          
          if (!posInPage && pages.length > 0) {
            // Move cursor to the nearest page
            let nearestPage = pages[0]
            let minDist = Math.abs(currentPos - pages[0].start)
            
            for (const page of pages) {
              const distToStart = Math.abs(currentPos - page.start)
              const distToEnd = Math.abs(currentPos - page.end)
              const minPageDist = Math.min(distToStart, distToEnd)
              
              if (minPageDist < minDist) {
                minDist = minPageDist
                nearestPage = page
              }
            }
            
            const tr = newState.tr
            const targetPos = currentPos < nearestPage.start ? nearestPage.start : Math.min(nearestPage.end - 1, nearestPage.start + 10)
            try {
              const resolvedPos = newState.doc.resolve(targetPos)
              if (resolvedPos && resolvedPos.pos >= 0 && resolvedPos.pos <= newState.doc.content.size) {
                tr.setSelection(TextSelection.near(resolvedPos))
                return tr
              }
            } catch (error) {
              console.warn('Error correcting cursor position:', error)
            }
          }
          
          return null
        }
      })
    ]
  }
})
