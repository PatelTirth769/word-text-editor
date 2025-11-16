import { useEditor, EditorContent } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { BulletListStyled, OrderedListStyled } from './listStyleExtensions';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import FontFamily from '@tiptap/extension-font-family';
import LineHeight from './lineHeightExtension';
import FontSize from './fontSizeExtension';
import { EnhancedAlignment } from './enhancedAlignmentExtension';
import { ImageResize } from './imageResizeExtension';
import { PageBlock } from './pageBlockExtension';
import { ParagraphWithStyle, HeadingWithStyle } from './indentBlockExtension';
import { TableCellWithAttrs } from './tableCellWithAttrs';

export const useWordEditor = (content = '') => {
  return useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      EnhancedAlignment.configure({
        types: ['paragraph', 'heading', 'image', 'blockquote', 'codeBlock', 'bulletList', 'orderedList'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Color.configure({ types: ['textStyle'] }),
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Underline,
      Strike,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCellWithAttrs,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      ImageResize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
          target: null, // Explicitly prevent target="_blank"
        },
      }),
      ParagraphWithStyle,
      HeadingWithStyle,
      BulletListStyled,
      OrderedListStyled,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
        LineHeight.configure({
          types: ['paragraph', 'heading'],
        }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      PageBlock,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
      handleDOMEvents: {
        dblclick: (view, event) => {
          try {
            const target = event.target;
            if (!(view.dom instanceof Element) || !view.dom.contains(target)) return false;
            const { state } = view;
            let result = view.posAtCoords({ left: event.clientX, top: event.clientY });
            let pos = result && typeof result.pos === 'number' ? result.pos : state.doc.content.size;

            // If clicked inside a page but past its last child, create a blank paragraph
            const pageType = state.schema.nodes.pageBlock;
            if (pageType) {
              // Determine which page DOM was clicked using bounding rects
              const pagesEls = Array.from(document.querySelectorAll('.ProseMirror .document-page'));
              let clickedPageIndex = -1;
              for (let i = 0; i < pagesEls.length; i++) {
                const r = pagesEls[i].getBoundingClientRect();
                if (event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom) {
                  clickedPageIndex = i; break;
                }
              }
              let pagePos = null;
              let pageNode = null;
              let pageCounter = -1;
              state.doc.descendants((node, p) => {
                if (node.type === pageType && p <= pos && pos <= p + node.nodeSize) {
                  pagePos = p;
                  pageNode = node;
                  return false;
                }
                if (node.type === pageType && pagePos == null && clickedPageIndex >= 0) {
                  pageCounter += 1;
                  if (pageCounter === clickedPageIndex) {
                    pagePos = p; pageNode = node; return false;
                  }
                }
                return true;
              });
            if (pageNode) {
                const pageStart = pagePos + 1;
                const pageEnd = pagePos + pageNode.nodeSize - 1;
                const paragraph = state.schema.nodes.paragraph;
                // Heuristic: if clicked lower half of page, use end; else use start
                let preferEnd = false;
                if (clickedPageIndex >= 0) {
                  const r = pagesEls[clickedPageIndex].getBoundingClientRect();
                  preferEnd = event.clientY > (r.top + r.height / 2);
                }
                // If click is beyond current content, append a paragraph at end or insert at start
                if ((pos >= pageEnd - 1 || preferEnd) && paragraph) {
                  const trIns = state.tr.insert(pageEnd, paragraph.create());
                  view.dispatch(trIns);
                  pos = Math.min(view.state.doc.content.size, pageEnd + 1);
                } else {
                  // If click lands on a non-text container, try inserting at that position inside page
                  const $pos = state.doc.resolve(pos);
                  if (!$pos.parent.isTextblock && paragraph) {
                    // Insert at the resolved position if inside the page, otherwise at end of page
                    const insertPos = (pos > pageStart && pos < pageEnd) ? pos : pageStart;
                    const trIns2 = view.state.tr.insert(insertPos, paragraph.create());
                    view.dispatch(trIns2);
                    pos = Math.min(view.state.doc.content.size, insertPos + 1);
                  }
                }

              // Horizontal placement approximation: insert non-breaking spaces to match click x
              // Compute x offset within page content (page has 1in padding ≈ 96px)
              try {
                const r = pagesEls[clickedPageIndex >= 0 ? clickedPageIndex : 0].getBoundingClientRect();
                const contentLeft = r.left + 96; // 1in page padding
                const offsetX = Math.max(0, event.clientX - contentLeft);
                // Approximate char width for 11pt Calibri ~ 6.5px; clamp to 0..120 spaces
                const spacesCount = Math.max(0, Math.min(120, Math.round(offsetX / 6.5)));
                if (spacesCount > 0) {
                  const nbsp = '\u00A0'.repeat(spacesCount);
                  // Insert spaces right after the paragraph we just ensured exists
                  const trTxt = view.state.tr.insertText(nbsp, pos, pos);
                  view.dispatch(trTxt);
                  pos = pos + spacesCount;
                }
              } catch {}
              }
            }

            const sel = view.state.selection.constructor.near(view.state.doc.resolve(pos));
            const tr = view.state.tr.setSelection(sel);
            view.dispatch(tr);
            // Keep focus in editor so caret becomes visible
            view.focus();
            return true;
          } catch {
            return false;
          }
        },
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter') {
          try { window.__suppressPaginationOnce = true; } catch {}
          
          // Check if Enter is pressed at the end of the last page
          try {
            const { state } = editor;
            const { selection } = state;
            const pageType = state.schema.nodes.pageBlock;
            
            if (pageType) {
              // Check if cursor is at the end of the document
              const atEndOfDoc = selection.$to.pos === state.doc.content.size;
              
              if (atEndOfDoc) {
                // Find the last page and check if cursor is at its end
                let lastPagePos = null;
                let lastPageNode = null;
                state.doc.descendants((node, pos) => {
                  if (node.type === pageType) {
                    lastPagePos = pos;
                    lastPageNode = node;
                  }
                });
                
                if (lastPageNode && lastPagePos !== null) {
                  const pageEnd = lastPagePos + lastPageNode.nodeSize - 1;
                  const cursorAtPageEnd = selection.$to.pos >= pageEnd - 1; // Allow for small margin
                  
                  if (cursorAtPageEnd) {
                    // Create a new page when Enter is pressed at the end of the last page
                    const tr = state.tr;
                    const newPage = pageType.createAndFill();
                    if (newPage) {
                      tr.insert(state.doc.content.size, newPage);
                      editor.view.dispatch(tr);
                      
                      // Move cursor to the new page
                      const newState = editor.view.state;
                      const newTr = newState.tr;
                      newTr.setSelection(TextSelection.create(newState.doc, newState.doc.content.size - 1));
                      editor.view.dispatch(newTr);
                      
                      event.preventDefault();
                      return true;
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('Enter key handler error:', error);
          }
        }
        
        // Handle Ctrl+A to select only text content within current page
        if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
          try {
            const { state } = editor;
            const pageType = state.schema.nodes.pageBlock;
            if (!pageType) return false;
            
            // Find the current page block
            let currentPagePos = null;
            let currentPageNode = null;
            state.doc.descendants((node, pos) => {
              if (node.type === pageType) {
                const selectionStart = state.selection.from;
                const selectionEnd = state.selection.to;
                if (pos <= selectionStart && selectionStart <= pos + node.nodeSize) {
                  currentPagePos = pos;
                  currentPageNode = node;
                }
              }
            });
            
            if (currentPageNode && currentPagePos !== null) {
              // Select only the content within the current page
              const pageStart = currentPagePos + 1;
              const pageEnd = currentPagePos + currentPageNode.nodeSize - 1;
              
              const tr = state.tr.setSelection(
                state.selection.constructor.near(state.doc.resolve(pageStart))
              );
              tr.setSelection(
                state.selection.constructor.between(
                  state.doc.resolve(pageStart),
                  state.doc.resolve(pageEnd)
                )
              );
              
              editor.view.dispatch(tr);
              event.preventDefault();
              return true;
            }
          } catch {}
        }
        
        // Handle Ctrl+C to copy only text content
        if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
          try {
            const { state } = editor;
            const { from, to } = state.selection;
            
            if (from !== to) {
              // Get only text content, no HTML structure
              const textContent = state.doc.textBetween(from, to);
              
              // Override clipboard with plain text only
              navigator.clipboard.writeText(textContent).then(() => {
                console.log('Text copied to clipboard');
              }).catch(err => {
                console.error('Failed to copy text: ', err);
              });
              
              event.preventDefault();
              return true;
            }
          } catch (error) {
            console.error('Copy error:', error);
          }
        }
        
        // Handle Ctrl+V to paste only plain text
        if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
          try {
            // Get clipboard text
            navigator.clipboard.readText().then(text => {
              if (text && text.trim()) {
                // Insert only plain text, no HTML structure
                editor.commands.insertContent(text);
              }
            }).catch(err => {
              console.error('Failed to read clipboard: ', err);
            });
            
            event.preventDefault();
            return true;
          } catch (error) {
            console.error('Paste error:', error);
          }
        }
        
        // Prevent backspace from deleting the last page
        if (event.key === 'Backspace') {
          try {
            const { state } = editor;
            const pageType = state.schema.nodes.pageBlock;
            if (!pageType) return false;
            
            let pageCount = 0;
            state.doc.descendants((node) => {
              if (node.type === pageType) pageCount += 1;
            });
            
            // If this is the only page and it's empty, prevent deletion
            if (pageCount === 1) {
              const isEmpty = state.doc.textContent.trim().length === 0;
              if (isEmpty) {
                event.preventDefault();
                return true; // prevent default behavior
              }
            }
          } catch {}
        }
        
        return false; // allow default behavior
      },
    },
    onCreate({ editor }) {
      try {
        const json = editor.getJSON();
        const hasPageBlock = Array.isArray(json?.content) && json.content.some(n => n.type === 'pageBlock');
        if (!hasPageBlock) {
          const inner = json?.content && json.content.length > 0 ? json.content : [{ type: 'paragraph' }];
          editor.commands.setContent({ type: 'doc', content: [{ type: 'pageBlock', content: inner }] });
        }
      } catch {}
      
      // Add custom clipboard handling after editor is fully created
      if (editor.view && editor.view.dom) {
        // Add custom copy handling
        editor.view.dom.addEventListener('copy', (event) => {
          try {
            const { state } = editor;
            const { from, to } = state.selection;
            
            if (from === to) return; // No selection
            
            // Extract only text content, no page structure
            const textContent = state.doc.textBetween(from, to);
            
            // Create clean HTML without page structure
            let htmlContent = '';
            const selectedContent = state.doc.slice(from, to);
            
            // Process each node in the selection
            selectedContent.content.forEach((node) => {
              if (node.type.name === 'pageBlock') {
                // If it's a pageBlock, extract only its content
                node.content.forEach((childNode) => {
                  if (childNode.type.name === 'paragraph' && childNode.textContent.trim()) {
                    htmlContent += `<p>${childNode.textContent}</p>`;
                  } else if (childNode.type.name === 'heading') {
                    const level = childNode.attrs.level || 1;
                    htmlContent += `<h${level}>${childNode.textContent}</h${level}>`;
                  } else if (childNode.type.name === 'bulletList' || childNode.type.name === 'orderedList') {
                    const listTag = childNode.type.name === 'bulletList' ? 'ul' : 'ol';
                    htmlContent += `<${listTag}>`;
                    childNode.content.forEach((listItem) => {
                      if (listItem.type.name === 'listItem') {
                        htmlContent += `<li>${listItem.textContent}</li>`;
                      }
                    });
                    htmlContent += `</${listTag}>`;
                  }
                });
              } else {
                // Direct content nodes
                if (node.type.name === 'paragraph' && node.textContent.trim()) {
                  htmlContent += `<p>${node.textContent}</p>`;
                } else if (node.type.name === 'heading') {
                  const level = node.attrs.level || 1;
                  htmlContent += `<h${level}>${node.textContent}</h${level}>`;
                }
              }
            });
            
            // Set the clipboard data to only include text content
            event.clipboardData.setData('text/html', htmlContent);
            event.clipboardData.setData('text/plain', textContent);
            event.preventDefault();
          } catch (error) {
            console.error('Copy handler error:', error);
          }
        });
        
        // Add custom paste handling to prevent page structure duplication
        editor.view.dom.addEventListener('paste', (event) => {
          try {
            const { state } = editor;
            const { from, to } = state.selection;
            
            // Get pasted content
            const htmlData = event.clipboardData.getData('text/html');
            const textData = event.clipboardData.getData('text/plain');
            
            if (htmlData) {
              // Clean HTML content to remove any page structure and unwanted elements
              let cleanHtml = htmlData
                // Remove page structure elements
                .replace(/<div[^>]*class="[^"]*document-page[^"]*"[^>]*>/gi, '')
                .replace(/<div[^>]*class="[^"]*ProseMirror[^"]*"[^>]*>/gi, '')
                // Remove any remaining divs that might be page containers
                .replace(/<div[^>]*>/gi, '')
                .replace(/<\/div>/gi, '')
                // Clean up any empty paragraphs
                .replace(/<p><\/p>/gi, '')
                .replace(/<p>\s*<\/p>/gi, '')
                // Remove any page numbering or footer elements
                .replace(/<div[^>]*class="[^"]*page-number[^"]*"[^>]*>.*?<\/div>/gi, '')
                // Ensure proper paragraph structure
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/\n\s*\n/g, '\n');
              
              // If no meaningful content, use plain text
              if (!cleanHtml.trim() || cleanHtml === '<p></p>') {
                cleanHtml = textData;
              }
              
              // Insert the cleaned content as plain text to avoid structure issues
              if (cleanHtml && cleanHtml.trim()) {
                // Convert HTML to plain text for safe insertion
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleanHtml;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                
                if (plainText.trim()) {
                  editor.commands.insertContent(plainText);
                }
              }
              event.preventDefault();
            } else if (textData) {
              // Insert plain text directly
              editor.commands.insertContent(textData);
              event.preventDefault();
            }
          } catch (error) {
            console.error('Paste handler error:', error);
          }
        });
      }
    },
    onUpdate({ editor }) {
      // Defer to let DOM update
      window.requestAnimationFrame(() => {
        // Skip one pagination cycle immediately after Enter
        try {
          if (window.__suppressPaginationOnce) {
            window.__suppressPaginationOnce = false;
            return;
          }
        } catch {}
        try {
          const pages = Array.from(document.querySelectorAll('.ProseMirror .document-page'));
          if (!pages.length) return;
          const lastPageEl = pages[pages.length - 1];
          // Only paginate when the last page clearly overflows (guard small caret changes)
          const overflowPx = lastPageEl.scrollHeight - lastPageEl.clientHeight;
          if (overflowPx <= 2) return; // require 2px overflow threshold to account for rounding errors

          // Only when caret is in the last page AND at end of the document
          const { state } = editor;
          const selectionAtEnd = state.selection.$to.pos === state.doc.content.size;
          if (!selectionAtEnd) return;

          // Ensure selection is inside the last pageBlock
          const pageType = state.schema.nodes.pageBlock;
          if (!pageType) return;
          let selectionInLastPage = false;
          let lastPageIndex = -1;
          let lastPageNode = null;
          let idx = -1;
          state.doc.descendants((node, pos) => {
            if (node.type === pageType) {
              idx += 1;
              if (pos <= state.selection.$to.pos && state.selection.$to.pos <= pos + node.nodeSize) {
                selectionInLastPage = true;
                lastPageIndex = idx; // temp store current
              }
              // Track the last page node we encounter
              lastPageNode = node;
            }
          });
          // Recalculate true last page index
          let totalPages = 0;
          state.doc.descendants((node) => { if (node.type === pageType) totalPages += 1; });
          if (!selectionInLastPage || lastPageIndex !== totalPages - 1) return;
          
          // Check if last page has actual content (not just empty space)
          if (lastPageNode && lastPageNode.textContent.trim().length === 0) return;

          editor.chain().focus().command(({ state, tr, dispatch }) => {
            const { doc, schema } = state;
            const pageType = schema.nodes.pageBlock;
            if (!pageType) return false;

            // Find the last pageBlock and its position
            let lastPagePos = null;
            let lastPageNode = null;
            doc.descendants((node, pos) => {
              if (node.type === pageType) {
                lastPagePos = pos;
                lastPageNode = node;
              }
            });
            if (!lastPageNode || lastPageNode.childCount === 0) return false;

            // Avoid creating a page for an Enter that only created an empty paragraph
            if (lastPageNode.childCount > 0) {
              const tail = lastPageNode.child(lastPageNode.childCount - 1);
              const tailIsEmptyPara = tail.type.name === 'paragraph' && tail.textContent.trim().length === 0;
              if (tailIsEmptyPara) return false;
            }

            // Move the last block from the overflowing page to a new page
            const lastChildIndex = lastPageNode.childCount - 1;
            const lastChild = lastPageNode.child(lastChildIndex);

            const newPage = pageType.createAndFill();
            if (!newPage) return false;

            const endPos = doc.content.size;
            tr.insert(endPos, newPage);
            // Recalculate new doc to get new page position
            const newDoc = tr.doc;
            let newPagePos = null;
            newDoc.descendants((node, pos) => {
              if (node.type === pageType) newPagePos = pos;
            });
            if (newPagePos == null) return false;

            // Delete the last child from old page and append it into new page
            const $pageStart = state.doc.resolve(lastPagePos + 1);
            const cutFrom = $pageStart.posAtIndex(lastChildIndex, lastPageNode);
            const cutTo = $pageStart.posAtIndex(lastChildIndex + 1, lastPageNode);
            // Fallback: if posAtIndex not available, skip
            if (cutFrom == null || cutTo == null) return false;

            const slice = state.doc.slice(cutFrom, cutTo);
            tr.delete(cutFrom, cutTo);
            tr.insert(newPagePos + 1, slice.content);

            if (dispatch) dispatch(tr);
            return true;
          }).run();
        } catch {}
      });
    },
    onSelectionUpdate({ editor }) {
      // Ensure at least one page always exists
      try {
        const { state } = editor;
        const pageType = state.schema.nodes.pageBlock;
        if (!pageType) return;
        
        let pageCount = 0;
        state.doc.descendants((node) => {
          if (node.type === pageType) pageCount += 1;
        });
        
        // If no pages exist, create one
        if (pageCount === 0) {
          editor.commands.setContent({ type: 'doc', content: [{ type: 'pageBlock', content: [{ type: 'paragraph' }] }] });
        }
      } catch {}
    },
  });
};
