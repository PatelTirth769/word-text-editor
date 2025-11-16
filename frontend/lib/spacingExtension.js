import { Extension } from '@tiptap/core'

// Adds basic spacing-related attributes to textStyle mark rendering
export const Spacing = Extension.create({
  name: 'spacing',

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
          lineHeight: {
            default: null,
            renderHTML: attrs => attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight};` } : {},
          },
          marginTop: {
            default: null,
            renderHTML: attrs => attrs.marginTop ? { style: `margin-top: ${attrs.marginTop};` } : {},
          },
          marginBottom: {
            default: null,
            renderHTML: attrs => attrs.marginBottom ? { style: `margin-bottom: ${attrs.marginBottom};` } : {},
          },
          marginLeft: {
            default: null,
            renderHTML: attrs => attrs.marginLeft ? { style: `margin-left: ${attrs.marginLeft};` } : {},
          },
        },
      },
    ]
  },
})

export default Spacing


