import { Node } from '@tiptap/core'

// Simple page break node that forces following content to begin on a new page when printing
const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [
      { tag: 'hr[data-page-break]' },
      { tag: 'div[data-page-break]' },
    ]
  },

  renderHTML() {
    return ['hr', { 'data-page-break': 'true', class: 'page-break' }]
  },

  addCommands() {
    return {
      insertPageBreak:
        () => ({ chain }) =>
          chain().insertContent({ type: this.name }).run(),
    }
  },
})

export default PageBreak










































