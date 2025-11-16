import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'

export const BulletListStyled = BulletList.extend({
  addAttributes() {
    return {
      listStyleType: {
        default: 'disc',
        parseHTML: element => element.style?.listStyleType || null,
        renderHTML: attributes => {
          if (!attributes.listStyleType) return {}
          return { style: `list-style-type: ${attributes.listStyleType}` }
        },
      },
    }
  },
  addCommands() {
    return {
      setBulletListStyleType:
        type => ({ state, tr, dispatch }) => {
          const { schema, selection } = state
          const pageFrom = selection.from
          const pageTo = selection.to
          let updated = false
          state.doc.nodesBetween(pageFrom, pageTo, (node, pos) => {
            if (node.type === schema.nodes.bulletList) {
              const attrs = { ...node.attrs, listStyleType: type }
              tr.setNodeMarkup(pos, node.type, attrs, node.marks)
              updated = true
            }
          })
          if (updated && dispatch) dispatch(tr)
          return updated
        },
    }
  },
})

export const OrderedListStyled = OrderedList.extend({
  addAttributes() {
    return {
      listStyleType: {
        default: 'decimal',
        parseHTML: element => element.style?.listStyleType || null,
        renderHTML: attributes => {
          if (!attributes.listStyleType) return {}
          return { style: `list-style-type: ${attributes.listStyleType}` }
        },
      },
    }
  },
  addCommands() {
    return {
      setOrderedListStyleType:
        type => ({ state, tr, dispatch }) => {
          const { schema, selection } = state
          const pageFrom = selection.from
          const pageTo = selection.to
          let updated = false
          state.doc.nodesBetween(pageFrom, pageTo, (node, pos) => {
            if (node.type === schema.nodes.orderedList) {
              const attrs = { ...node.attrs, listStyleType: type }
              tr.setNodeMarkup(pos, node.type, attrs, node.marks)
              updated = true
            }
          })
          if (updated && dispatch) dispatch(tr)
          return updated
        },
    }
  },
})


