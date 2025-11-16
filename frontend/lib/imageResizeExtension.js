import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const ImageResize = Extension.create({
  name: 'imageResize',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          width: {
            default: null,
            parseHTML: element => element.getAttribute('width'),
            renderHTML: attributes => {
              if (!attributes.width) {
                return {};
              }
              return { width: attributes.width };
            },
          },
          height: {
            default: null,
            parseHTML: element => element.getAttribute('height'),
            renderHTML: attributes => {
              if (!attributes.height) {
                return {};
              }
              return { height: attributes.height };
            },
          },
          rotate: {
            default: 0,
            parseHTML: element => {
              const val = element.getAttribute('data-rotate');
              return val ? parseFloat(val) : 0;
            },
            renderHTML: attributes => {
              const angle = Number(attributes.rotate) || 0;
              if (!angle) return {};
              return { 'data-rotate': String(angle) };
            },
          },
          x: {
            default: null,
            parseHTML: element => element.getAttribute('data-x'),
            renderHTML: attributes => {
              if (attributes.x == null) return {};
              return { 'data-x': String(attributes.x) };
            },
          },
          y: {
            default: null,
            parseHTML: element => element.getAttribute('data-y'),
            renderHTML: attributes => {
              if (attributes.y == null) return {};
              return { 'data-y': String(attributes.y) };
            },
          },
          floating: {
            default: false,
            parseHTML: element => element.classList.contains('floating-image'),
            renderHTML: attributes => {
              return attributes.floating ? { class: 'floating-image' } : {};
            },
          },
          wrap: {
            // inline | wrap-left | wrap-right | break
            default: 'inline',
            parseHTML: element => element.getAttribute('data-image-wrap') || 'inline',
            renderHTML: attributes => {
              const val = attributes.wrap || 'inline';
              return { 'data-image-wrap': val };
            },
          },
          layer: {
            // normal | front | behind
            default: 'normal',
            parseHTML: element => element.getAttribute('data-image-layer') || 'normal',
            renderHTML: attributes => {
              const val = attributes.layer || 'normal';
              return { 'data-image-layer': val };
            },
          },
          wrapMargin: {
            // pixels distance between text and image
            default: 12,
            parseHTML: element => {
              const v = element.getAttribute('data-wrap-margin');
              return v != null ? Number(v) : 12;
            },
            renderHTML: attributes => {
              const v = Number(attributes.wrapMargin);
              return { 'data-wrap-margin': isNaN(v) ? '12' : String(v) };
            },
          },
          positioning: {
            // move | fix
            default: 'move',
            parseHTML: el => el.getAttribute('data-image-positioning') || 'move',
            renderHTML: attributes => {
              const v = attributes.positioning || 'move';
              return { 'data-image-positioning': v };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          decorations: (state) => {
            const decorations = [];
            const { doc } = state;

            doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                const classes = ['resizable-image'];
                if (node.attrs && node.attrs.floating) classes.push('floating-image');
                const attrs = {
                  class: classes.join(' '),
                  'data-resizable': 'true',
                };
                // Apply inline style for rotate/x/y if floating
                const rotate = Number(node.attrs.rotate) || 0;
                const x = node.attrs.x;
                const y = node.attrs.y;
                if (node.attrs.floating && (x != null || y != null || rotate)) {
                  const parts = [];
                  if (x != null || y != null) {
                    const left = x != null ? `${x}px` : '0px';
                    const top = y != null ? `${y}px` : '0px';
                    parts.push(`position: absolute`);
                    parts.push(`left: ${left}`);
                    parts.push(`top: ${top}`);
                  }
                  if (rotate) {
                    parts.push(`transform: rotate(${rotate}deg)`);
                    parts.push(`transform-origin: center center`);
                  }
                  attrs.style = parts.join('; ');
                }
                // Propagate wrap/layer/margin/positioning as data- attributes on decoration
                if (node.attrs && node.attrs.wrap) attrs['data-image-wrap'] = node.attrs.wrap;
                if (node.attrs && node.attrs.layer) attrs['data-image-layer'] = node.attrs.layer;
                if (node.attrs && node.attrs.wrapMargin != null) attrs['data-wrap-margin'] = String(node.attrs.wrapMargin);
                if (node.attrs && node.attrs.positioning) attrs['data-image-positioning'] = node.attrs.positioning;

                // Compose styles for wrap margins and absolute positioning when applicable
                const styles = [];
                if (attrs.style) styles.push(attrs.style);
                const margin = Number(node.attrs.wrapMargin) || 12;
                const wrap = node.attrs.wrap;
                if (wrap === 'wrap-left') styles.push(`margin:${margin}px ${margin}px ${margin}px 0`);
                if (wrap === 'wrap-right') styles.push(`margin:${margin}px 0 ${margin}px ${margin}px`);
                if (wrap === 'break') styles.push(`margin:${Math.max(8, margin)}px 0`);
                // Absolute positioning already handled above when floating with x/y
                if (styles.length) attrs.style = styles.join('; ');
                const decoration = Decoration.node(pos, pos + node.nodeSize, attrs);
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
