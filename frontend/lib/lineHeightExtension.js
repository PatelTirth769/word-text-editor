import { Extension } from '@tiptap/core';

// Adds line-height styling to block nodes like paragraph and heading
const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      default: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.default,
            parseHTML: element => {
              const lh = element.style.lineHeight;
              return lh || null;
            },
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        value => ({ commands }) => {
          const styleValue = typeof value === 'number' ? String(value) : value;
          return this.options.types.every(type =>
            commands.updateAttributes(type, { lineHeight: styleValue })
          );
        },
      unsetLineHeight:
        () => ({ commands }) => {
          return this.options.types.every(type =>
            commands.updateAttributes(type, { lineHeight: null })
          );
        },
    };
  },
});

export default LineHeight;






















































