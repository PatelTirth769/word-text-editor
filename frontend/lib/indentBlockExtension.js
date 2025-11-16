import Paragraph from '@tiptap/extension-paragraph'
import Heading from '@tiptap/extension-heading'

export const ParagraphWithStyle = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style') || null,
        renderHTML: attributes => attributes.style ? { style: attributes.style } : {},
      },
    }
  },
})

export const HeadingWithStyle = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style') || null,
        renderHTML: attributes => attributes.style ? { style: attributes.style } : {},
      },
    }
  },
})
















