import { Extension } from '@tiptap/core'

// Provides small caps and all caps via TextStyle mark attributes
export const FontCase = Extension.create({
  name: 'fontCase',

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
          smallCaps: {
            default: null,
            parseHTML: element => {
              const v = element.style?.fontVariant || ''
              return v.includes('small-caps') ? 'small-caps' : null
            },
            renderHTML: attributes => {
              if (!attributes.smallCaps) return {}
              return { style: 'font-variant: small-caps;' }
            },
          },
          allCaps: {
            default: null,
            parseHTML: element => {
              const t = element.style?.textTransform || ''
              return t === 'uppercase' ? 'uppercase' : null
            },
            renderHTML: attributes => {
              if (!attributes.allCaps) return {}
              return { style: 'text-transform: uppercase;' }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setSmallCaps:
        () => ({ chain }) =>
          chain().setMark('textStyle', { smallCaps: 'small-caps', allCaps: null }).run(),

      unsetSmallCaps:
        () => ({ chain }) =>
          chain().setMark('textStyle', { smallCaps: null }).removeEmptyTextStyle().run(),

      toggleSmallCaps:
        () => ({ editor, chain }) => {
          const isActive = editor.isActive('textStyle', { smallCaps: 'small-caps' })
          return isActive
            ? chain().setMark('textStyle', { smallCaps: null }).removeEmptyTextStyle().run()
            : chain().setMark('textStyle', { smallCaps: 'small-caps', allCaps: null }).run()
        },

      setAllCaps:
        () => ({ chain }) =>
          chain().setMark('textStyle', { allCaps: 'uppercase', smallCaps: null }).run(),

      unsetAllCaps:
        () => ({ chain }) =>
          chain().setMark('textStyle', { allCaps: null }).removeEmptyTextStyle().run(),

      toggleAllCaps:
        () => ({ editor, chain }) => {
          const isActive = editor.isActive('textStyle', { allCaps: 'uppercase' })
          return isActive
            ? chain().setMark('textStyle', { allCaps: null }).removeEmptyTextStyle().run()
            : chain().setMark('textStyle', { allCaps: 'uppercase', smallCaps: null }).run()
        },
    }
  },
})

export default FontCase










































