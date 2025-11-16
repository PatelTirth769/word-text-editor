import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const EnhancedAlignment = Extension.create({
  name: 'enhancedAlignment',

  addOptions() {
    return {
      alignments: ['left', 'center', 'right'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          imageAlign: {
            default: null,
            parseHTML: element => element.getAttribute('data-image-align') || null,
            renderHTML: attributes => {
              const align = attributes.imageAlign;
              if (!align) return {};
              const styles = [];
              if (align === 'center') styles.push('display:block', 'margin-left:auto', 'margin-right:auto');
              if (align === 'left') styles.push('display:block', 'margin-left:0', 'margin-right:auto');
              if (align === 'right') styles.push('display:block', 'margin-left:auto', 'margin-right:0');
              return { 'data-image-align': align, style: styles.join('; ') };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      // Image alignment command only (text alignment should use TipTap's TextAlign)
      alignImage: (alignment) => ({ tr, state, dispatch }) => {
        const { selection } = state;
        if (!dispatch) return true;
        let changed = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (node.type.name === 'image') {
            const next = { ...node.attrs, imageAlign: alignment };
            // If image was floating, convert to inline for alignment
            if (node.attrs.floating) {
              delete next.x; delete next.y;
              next.floating = false;
            }
            tr.setNodeMarkup(pos, null, next);
            changed = true;
          }
        });
        if (changed) dispatch(tr);
        return changed;
      },
    };
  },

  addKeyboardShortcuts() {
    return {};
  },

  addProseMirrorPlugins() {
    return [];
  },
});

















