import { Extension } from '@tiptap/core'

// Hidden text via TextStyle mark attribute (no raw span insertion)
export const HiddenText = Extension.create({
  name: 'hiddenText',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          hiddenText: {
            default: null,
            parseHTML: element => {
              const data = element.getAttribute?.('data-hidden-text')
              return data === 'true' ? true : null
            },
            renderHTML: attributes => {
              if (!attributes.hiddenText) return {}
              return {
                'data-hidden-text': 'true',
                style: 'color: transparent; background: transparent; font-size: 0;'
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setHiddenText: () => ({ chain }) => chain().setMark('textStyle', { hiddenText: true }).run(),
      unsetHiddenText: () => ({ chain }) => chain().setMark('textStyle', { hiddenText: null }).removeEmptyTextStyle().run(),
      toggleHiddenText: () => ({ editor, chain }) => {
        const isActive = editor.isActive('textStyle', { hiddenText: true })
        return isActive
          ? chain().setMark('textStyle', { hiddenText: null }).removeEmptyTextStyle().run()
          : chain().setMark('textStyle', { hiddenText: true }).run()
      },
    }
  },
})

export default HiddenText










































