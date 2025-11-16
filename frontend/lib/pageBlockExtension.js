import { Node } from '@tiptap/core'

export const PageBlock = Node.create({
  name: 'pageBlock',

  group: 'block',
  content: 'block+',
  draggable: true,
  selectable: true,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div.document-page',
      },
    ]
  },

  renderHTML() {
    return ['div', { class: 'document-page' }, 0]
  },

  addCommands() {
    return {
      setPageBlock:
        () => ({ commands }) => {
          return commands.setNode(this.name)
        },
    }
  },
})



