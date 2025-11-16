import TableCell from '@tiptap/extension-table-cell'

export const TableCellWithAttrs = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => {
          const bg = element.style?.backgroundColor || element.getAttribute('data-bg')
          return bg || null
        },
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {}
          return {
            style: `background-color: ${attributes.backgroundColor};`,
            'data-bg': attributes.backgroundColor,
          }
        },
      },
      borderColor: {
        default: null,
        parseHTML: element => {
          const bc = element.style?.borderColor || element.getAttribute('data-border-color')
          return bc || null
        },
        renderHTML: attributes => {
          if (!attributes.borderColor) return {}
          return {
            style: `border-color: ${attributes.borderColor};`,
            'data-border-color': attributes.borderColor,
          }
        },
      },
    }
  },
})
















