import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const UniversalAlignment = Extension.create({
  name: 'universalAlignment',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'image', 'blockquote', 'codeBlock', 'bulletList', 'orderedList'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: element => element.style.textAlign || this.options.defaultAlignment,
            renderHTML: attributes => {
              if (!attributes.textAlign || attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setAlignment: (alignment) => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;

        if (dispatch) {
          tr.setMeta('universalAlignment', true);
          
          // Apply alignment to all selected nodes
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, null, {
                ...node.attrs,
                textAlign: alignment,
              });
            }
          });

          // If no nodes are selected, apply to the current block
          if (selection.empty) {
            const $from = selection.$from;
            const node = $from.parent;
            
            if (this.options.types.includes(node.type.name)) {
              const pos = $from.before();
              tr.setNodeMarkup(pos, null, {
                ...node.attrs,
                textAlign: alignment,
              });
            }
          }
        }

        return true;
      },

      unsetAlignment: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;

        if (dispatch) {
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const { textAlign, ...attrs } = node.attrs;
              tr.setNodeMarkup(pos, null, attrs);
            }
          });
        }

        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => this.editor.commands.setAlignment('left'),
      'Mod-Shift-e': () => this.editor.commands.setAlignment('center'),
      'Mod-Shift-r': () => this.editor.commands.setAlignment('right'),
      'Mod-Shift-j': () => this.editor.commands.setAlignment('justify'),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('universalAlignment'),
        props: {
          decorations: (state) => {
            const decorations = [];
            const { doc, selection } = state;

            doc.descendants((node, pos) => {
              if (this.options.types.includes(node.type.name) && node.attrs.textAlign) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: `alignment-${node.attrs.textAlign}`,
                  style: `text-align: ${node.attrs.textAlign}`,
                });
                decorations.push(decoration);
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
