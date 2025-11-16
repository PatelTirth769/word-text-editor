const puppeteer = require('puppeteer');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, PageBreak, ExternalHyperlink, InternalHyperlink, ImageRun, Media, NumberFormat, LevelFormat, convertInchesToTwip } = require('docx');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Export to PDF
const exportToPDF = async (req, res) => {
  let browser = null;
  try {
    const { htmlContent, title = 'Document' } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Sanitize title for filename
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'Document';

    // Launch browser with better options
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1
    });

    // Clean HTML content - remove problematic elements
    let cleanHtml = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove inline styles (we'll add our own)
      .replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers

    // Create a complete HTML document with styles
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${sanitizedTitle}</title>
          <style>
            @page {
              margin: 1in;
              size: letter;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', 'Times', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000000;
              margin: 0;
              padding: 20px;
              background: #ffffff;
            }
            p {
              margin: 0 0 12pt 0;
              text-align: left;
            }
            h1 {
              font-size: 24pt;
              font-weight: bold;
              margin: 18pt 0 12pt 0;
            }
            h2 {
              font-size: 20pt;
              font-weight: bold;
              margin: 16pt 0 10pt 0;
            }
            h3 {
              font-size: 16pt;
              font-weight: bold;
              margin: 14pt 0 8pt 0;
            }
            h4, h5, h6 {
              font-size: 14pt;
              font-weight: bold;
              margin: 12pt 0 6pt 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 12pt 0;
              page-break-inside: avoid;
            }
            table td, table th {
              border: 1px solid #000000;
              padding: 8pt;
              text-align: left;
            }
            table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            img {
              max-width: 100%;
              height: auto;
              page-break-inside: avoid;
            }
            ul, ol {
              margin: 12pt 0;
              padding-left: 36pt;
            }
            li {
              margin: 6pt 0;
            }
            a {
              color: #0000EE;
              text-decoration: underline;
            }
            strong, b {
              font-weight: bold;
            }
            em, i {
              font-style: italic;
            }
            u {
              text-decoration: underline;
            }
            s, strike {
              text-decoration: line-through;
            }
            blockquote {
              margin: 12pt 0;
              padding-left: 24pt;
              border-left: 4px solid #ccc;
            }
            code {
              font-family: 'Courier New', monospace;
              background-color: #f5f5f5;
              padding: 2pt 4pt;
            }
            pre {
              font-family: 'Courier New', monospace;
              background-color: #f5f5f5;
              padding: 12pt;
              overflow-x: auto;
              page-break-inside: avoid;
            }
            hr {
              border: none;
              border-top: 1px solid #000;
              margin: 12pt 0;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${cleanHtml}
        </body>
      </html>
    `;

    // Set content with timeout
    await page.setContent(fullHTML, { 
      waitUntil: ['load', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait a bit for any dynamic content (using setTimeout instead of waitForTimeout)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate PDF with better options
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });

    // Normalize and validate PDF buffer
    const finalBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

    if (!finalBuffer || finalBuffer.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Validate it's a valid PDF (starts with %PDF)
    if (finalBuffer.slice(0, 4).toString('ascii') !== '%PDF') {
      throw new Error('Generated file is not a valid PDF');
    }

    // Close browser
    await browser.close();
    browser = null;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
    res.setHeader('Content-Length', finalBuffer.length.toString());
    res.setHeader('Cache-Control', 'no-cache');

    // Send PDF buffer
    res.send(finalBuffer);
    logger.info(`PDF exported successfully: ${sanitizedTitle}`);
  } catch (error) {
    // Make sure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
    
    logger.error('Error exporting to PDF:', error);
    res.status(500).json({ 
      error: 'Failed to export PDF', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper function to parse color from style attribute
const parseColor = (styleStr) => {
  if (!styleStr) return null;
  // Match color: #hex or color: rgb() or color: name
  const colorMatch = styleStr.match(/color\s*:\s*([^;]+)/i);
  if (colorMatch) {
    let color = colorMatch[1].trim();
    // Convert rgb() to hex if needed
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      color = r + g + b;
    } else if (color.startsWith('#')) {
      color = color.substring(1);
    }
    return color.toUpperCase();
  }
  return null;
};

// Helper function to convert hex/rgb color to DOCX highlight color name
const hexToDocxHighlight = (color) => {
  if (!color) return null;
  
  // Normalize color to hex
  let hex = color;
  
  // Handle rgb/rgba (including rgba with alpha like rgba(255, 255, 0, 0.7))
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    hex = r + g + b;
  } else if (color.startsWith('#')) {
    hex = color.substring(1);
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
  } else if (color === 'transparent' || color === 'none') {
    return null;
  } else {
    // Try to use as-is if it's already a color name
    const validColors = ['yellow', 'green', 'cyan', 'magenta', 'blue', 'red', 
                         'darkBlue', 'darkCyan', 'darkGreen', 'darkMagenta', 
                         'darkRed', 'darkYellow', 'darkGray', 'lightGray', 'black', 'none'];
    if (validColors.includes(color.toLowerCase())) {
      return color;
    }
    return null;
  }
  
  // Ensure hex is 6 characters
  if (hex.length !== 6) {
    return 'yellow'; // Default fallback
  }
  
  // Convert hex to DOCX highlight color name
  hex = hex.toUpperCase();
  
  // Common color mappings
  const colorMap = {
    'FFFF00': 'yellow',      // Yellow
    '00FF00': 'green',       // Green
    '00FFFF': 'cyan',        // Cyan
    'FF00FF': 'magenta',     // Magenta
    '0000FF': 'blue',        // Blue
    'FF0000': 'red',         // Red
    '000080': 'darkBlue',    // Dark Blue
    '008080': 'darkCyan',    // Dark Cyan
    '008000': 'darkGreen',   // Dark Green
    '800080': 'darkMagenta', // Dark Magenta
    '800000': 'darkRed',     // Dark Red
    '808000': 'darkYellow',  // Dark Yellow
    '808080': 'darkGray',    // Dark Gray
    'C0C0C0': 'lightGray',   // Light Gray
    '000000': 'black',       // Black
  };
  
  // Exact match
  if (colorMap[hex]) {
    return colorMap[hex];
  }
  
  // Find closest match by RGB distance
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  let minDist = Infinity;
  let closestColor = 'yellow'; // Default to yellow
  
  for (const [hexColor, colorName] of Object.entries(colorMap)) {
    const cr = parseInt(hexColor.substring(0, 2), 16);
    const cg = parseInt(hexColor.substring(2, 4), 16);
    const cb = parseInt(hexColor.substring(4, 6), 16);
    
    const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closestColor = colorName;
    }
  }
  
  return closestColor;
};

// Helper function to convert any color format to hex (for DOCX)
const colorToHex = (colorStr) => {
  if (!colorStr) return null;
  
  let color = colorStr.trim();
  
  // Handle rgb() or rgba() - convert to hex
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return (r + g + b).toUpperCase();
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    color = color.substring(1);
    if (color.length === 3) {
      // Expand 3-digit hex to 6-digit
      color = color.split('').map(c => c + c).join('');
    }
    if (/^[0-9A-F]{6}$/i.test(color)) {
      return color.toUpperCase();
    }
  }
  
  // Handle named colors
  if (color === 'transparent' || color === 'none') {
    return null;
  }
  
  const colorMap = {
    'white': 'FFFFFF',
    'black': '000000',
    'red': 'FF0000',
    'green': '008000',
    'blue': '0000FF',
    'yellow': 'FFFF00',
    'cyan': '00FFFF',
    'magenta': 'FF00FF',
    'gray': '808080',
    'grey': '808080',
    'silver': 'C0C0C0',
    'maroon': '800000',
    'olive': '808000',
    'lime': '00FF00',
    'aqua': '00FFFF',
    'teal': '008080',
    'navy': '000080',
    'fuchsia': 'FF00FF',
    'purple': '800080'
  };
  
  const lowerColor = color.toLowerCase();
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }
  
  // If it's already a 6-digit hex, return it
  if (/^[0-9A-F]{6}$/i.test(color)) {
    return color.toUpperCase();
  }
  
  return null;
};

// Helper function to parse background color (shading) - returns hex for paragraph/cell shading
const parseBackgroundColor = (styleStr) => {
  if (!styleStr) return null;
  const bgMatch = styleStr.match(/background(?:-color)?\s*:\s*([^;]+)/i);
  if (bgMatch) {
    return colorToHex(bgMatch[1].trim());
  }
  return null;
};

// Helper function to parse font size from style
const parseFontSize = (styleStr) => {
  if (!styleStr) return null;
  const sizeMatch = styleStr.match(/font-size\s*:\s*([^;]+)/i);
  if (sizeMatch) {
    const size = sizeMatch[1].trim();
    // Convert pt, px, em to half-points (docx uses half-points)
    const numMatch = size.match(/([\d.]+)/);
    if (numMatch) {
      let value = parseFloat(numMatch[1]);
      if (size.includes('pt')) {
        return Math.round(value * 2); // Convert pt to half-points
      } else if (size.includes('px')) {
        return Math.round(value * 1.5); // Approximate px to half-points
      } else if (size.includes('em')) {
        return Math.round(value * 12 * 2); // Approximate em to half-points
      }
      return Math.round(value * 2); // Default assume points
    }
  }
  return null;
};

// Helper function to parse text alignment
const parseAlignment = (styleStr, alignAttr) => {
  if (alignAttr) {
    if (alignAttr === 'left') return AlignmentType.LEFT;
    if (alignAttr === 'center') return AlignmentType.CENTER;
    if (alignAttr === 'right') return AlignmentType.RIGHT;
    if (alignAttr === 'justify') return AlignmentType.JUSTIFIED;
  }
  if (styleStr) {
    const alignMatch = styleStr.match(/text-align\s*:\s*([^;]+)/i);
    if (alignMatch) {
      const align = alignMatch[1].trim();
      if (align === 'left') return AlignmentType.LEFT;
      if (align === 'center') return AlignmentType.CENTER;
      if (align === 'right') return AlignmentType.RIGHT;
      if (align === 'justify') return AlignmentType.JUSTIFIED;
    }
  }
  return AlignmentType.LEFT;
};

// Helper function to build TextRun options from element
const buildTextRunOptions = (element, $) => {
  const $el = $(element);
  const tagName = element.name ? element.name.toLowerCase() : '';
  const style = $el.attr('style') || '';
  const options = {};

  // Check if this is a highlight mark tag first
  const isHighlightMark = tagName === 'mark' || $el.attr('data-type') === 'highlight';
  
  // Parse color - but skip text color for highlight marks to preserve original text color
  if (!isHighlightMark) {
    const color = parseColor(style) || parseColor($el.attr('color'));
    if (color) {
      options.color = color;
    }
  }
  // For highlight marks, we intentionally skip text color parsing
  // to preserve the original text color from parent elements

  // Parse font size
  const fontSize = parseFontSize(style) || parseFontSize($el.attr('data-font-size'));
  if (fontSize) {
    options.size = fontSize;
  }

  // Parse font family
  const fontFamilyMatch = style.match(/font-family\s*:\s*([^;]+)/i);
  if (fontFamilyMatch) {
    const fontFamily = fontFamilyMatch[1].trim().replace(/['"]/g, '').split(',')[0].trim();
    options.font = fontFamily;
  }

  // Parse formatting
  if (tagName === 'strong' || tagName === 'b' || style.includes('font-weight: bold') || style.includes('font-weight:700') || style.includes('font-weight: 700')) {
    options.bold = true;
  }
  if (tagName === 'em' || tagName === 'i' || style.includes('font-style: italic')) {
    options.italics = true;
  }
  if (tagName === 'u' || style.includes('text-decoration: underline')) {
    options.underline = {};
  }
  if (tagName === 's' || tagName === 'strike' || style.includes('text-decoration: line-through')) {
    options.strike = true;
  }
  if (tagName === 'sub' || style.includes('vertical-align: sub')) {
    options.subScript = true;
  }
  if (tagName === 'sup' || style.includes('vertical-align: super')) {
    options.superScript = true;
  }

  // Parse highlight/background color for text highlighting (mark tags)
  if (isHighlightMark) {
    // Get color from various sources:
    // 1. data-color attribute (TipTap Highlight extension)
    // 2. style background-color
    // 3. Check for rgba colors in style (common for highlights)
    let highlightColor = $el.attr('data-color');
    
    if (!highlightColor) {
      // Extract from style attribute
      const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
      if (bgMatch) {
        highlightColor = bgMatch[1].trim();
      }
    }
    
    // Handle rgba colors (common in highlights like rgba(255, 255, 0, 0.7))
    if (highlightColor) {
      const docxHighlight = hexToDocxHighlight(highlightColor);
      if (docxHighlight && docxHighlight !== 'none') {
        // Only set highlight if we have a valid color (not 'none')
        options.highlight = docxHighlight;
      } else {
        // Default to yellow if color can't be determined
        options.highlight = 'yellow';
      }
    } else {
      // Default to yellow if no color specified
      options.highlight = 'yellow';
    }
  } else {
    // For other elements, check background color but don't use as highlight
    // (paragraph/cell shading is handled separately)
  }

  return options;
};

// Helper function to extract text and formatting from element recursively
const extractTextRunsFromElement = (element, $, inheritedOptions = {}, defaultFonts = null, isHeading = false) => {
  const runs = [];
  
  if (!element || !element.children) {
    return runs;
  }

  // Determine default font to use if no font is specified
  const targetDefaultFont = defaultFonts && (isHeading ? defaultFonts.heading : defaultFonts.body);
  
  // If no font in inherited options and we have a default font, add it
  if (targetDefaultFont && !inheritedOptions.font) {
    inheritedOptions = { ...inheritedOptions, font: targetDefaultFont };
  }

  element.children.forEach(child => {
    if (child.type === 'text') {
      const text = child.data || '';
      if (text.trim() || text === ' ') {
        runs.push(new TextRun({ ...inheritedOptions, text }));
      }
    } else if (child.type === 'tag') {
      const $child = $(child);
      const tagName = child.name.toLowerCase();
      
      // Handle links
      if (tagName === 'a') {
        // Get href from various possible attributes
        const href = $child.attr('href') || $child.attr('data-href') || $child.attr('data-url') || '';
        
        if (href && href.trim()) {
          // Extract text runs from link children to preserve formatting (bold, italic, etc.)
          // But skip nested links to avoid creating nested hyperlinks
          const linkOptions = { ...inheritedOptions, ...buildTextRunOptions(child, $) };
          
          // Extract text runs from link children to preserve formatting (bold, italic, etc.)
          // Use a helper to extract runs while preventing nested hyperlinks
          const extractLinkContent = (element, $, options, defaultFonts, isHeading) => {
            const runs = [];
            if (!element || !element.children) return runs;
            
            // Apply default font to link options if not specified
            const targetDefaultFont = defaultFonts && (isHeading ? defaultFonts.heading : defaultFonts.body);
            if (targetDefaultFont && !options.font) {
              options = { ...options, font: targetDefaultFont };
            }
            
            element.children.forEach(grandchild => {
              if (grandchild.type === 'text') {
                const text = grandchild.data || '';
                if (text.trim() || text === ' ') {
                  runs.push(new TextRun({ ...options, text }));
                }
              } else if (grandchild.type === 'tag') {
                const $grandchild = $(grandchild);
                const grandchildTag = grandchild.name ? grandchild.name.toLowerCase() : '';
                
                // If nested element is another link, extract just its text (don't create nested hyperlink)
                if (grandchildTag === 'a') {
                  const nestedLinkText = $grandchild.text() || $grandchild.attr('href') || '';
                  if (nestedLinkText.trim()) {
                    runs.push(new TextRun({ ...options, text: nestedLinkText.trim() }));
                  }
                } else {
                  // For other nested elements (strong, em, span, etc.), recursively extract their text runs
                  const grandchildRuns = extractTextRunsFromElement(grandchild, $, options, defaultFonts, isHeading);
                  runs.push(...grandchildRuns);
                }
              }
            });
            
            return runs;
          };
          
          // Apply default font to link options if not specified
          if (targetDefaultFont && !linkOptions.font) {
            linkOptions.font = targetDefaultFont;
          }
          const nestedRuns = extractLinkContent(child, $, linkOptions, defaultFonts, isHeading);
          
          // Get link text as fallback
          const linkText = $child.text() || href;
          
          // If we have nested runs (with formatting), use them
          if (nestedRuns.length > 0) {
            try {
              // Create hyperlink with formatted text runs
              runs.push(new ExternalHyperlink({
                children: nestedRuns,
                link: href.trim()
              }));
            } catch (e) {
              // Fallback: if hyperlink creation fails, try with single TextRun
              logger.warn(`Failed to create hyperlink with nested runs: ${e.message}, falling back to simple text`);
              if (linkText.trim()) {
                try {
                  runs.push(new ExternalHyperlink({
                    children: [new TextRun({ ...linkOptions, text: linkText.trim() })],
                    link: href.trim()
                  }));
                } catch (e2) {
                  // Last resort: add as regular text runs
                  runs.push(...nestedRuns);
                }
              } else {
                // Use href as text
                runs.push(new ExternalHyperlink({
                  children: [new TextRun({ ...linkOptions, text: href.trim() })],
                  link: href.trim()
                }));
              }
            }
          } else {
            // No nested content, use link text or href
            const displayText = linkText.trim() || href.trim();
            try {
              runs.push(new ExternalHyperlink({
                children: [new TextRun({ ...linkOptions, text: displayText })],
                link: href.trim()
              }));
            } catch (e) {
              // Fallback: add as regular text (shouldn't happen, but just in case)
              logger.warn(`Failed to create hyperlink: ${e.message}, adding as text`);
              runs.push(new TextRun({ ...linkOptions, text: displayText }));
            }
          }
        } else {
          // No href, treat as regular text (shouldn't happen for proper links)
          const nestedRuns = extractTextRunsFromElement(child, $, { ...inheritedOptions, ...buildTextRunOptions(child, $) }, defaultFonts, isHeading);
          runs.push(...nestedRuns);
        }
      }
      // Handle spans and inline elements
      else if (tagName === 'span' || tagName === 'strong' || tagName === 'b' || tagName === 'em' || 
               tagName === 'i' || tagName === 'u' || tagName === 's' || tagName === 'strike' ||
               tagName === 'sub' || tagName === 'sup' || tagName === 'mark') {
        const elementOptions = buildTextRunOptions(child, $);
        // Apply default font if no font is specified
        if (targetDefaultFont && !elementOptions.font) {
          elementOptions.font = targetDefaultFont;
        }
        const combinedOptions = { ...inheritedOptions, ...elementOptions };
        const nestedRuns = extractTextRunsFromElement(child, $, combinedOptions, defaultFonts, isHeading);
        runs.push(...nestedRuns);
      }
      // Handle other inline elements
      else {
        const elementOptions = buildTextRunOptions(child, $);
        // Apply default font if no font is specified
        if (targetDefaultFont && !elementOptions.font) {
          elementOptions.font = targetDefaultFont;
        }
        const combinedOptions = { ...inheritedOptions, ...elementOptions };
        const nestedRuns = extractTextRunsFromElement(child, $, combinedOptions, defaultFonts, isHeading);
        runs.push(...nestedRuns);
      }
    }
  });

  return runs;
};

// Helper function to convert paragraph/heading to DOCX Paragraph
const elementToParagraph = (element, $, defaultFonts = null, paragraphSpacing = null) => {
  const tagName = element.name.toLowerCase();
  const style = $(element).attr('style') || '';
  const alignAttr = $(element).attr('align');
  
  const paragraphOptions = {
    children: []
  };

  // Handle page breaks
  if ($(element).hasClass('page-break') || $(element).attr('data-page-break') === 'true' || 
      $(element).find('.page-break').length > 0 || style.includes('page-break-after: always')) {
    paragraphOptions.children.push(new PageBreak());
  }

  // Parse text alignment
  const alignment = parseAlignment(style, alignAttr);
  paragraphOptions.alignment = alignment;

  // Parse paragraph shading (background-color)
  const shading = parseBackgroundColor(style);
  if (shading && /^[0-9A-F]{6}$/i.test(shading)) {
    paragraphOptions.shading = {
      fill: shading.toUpperCase(),
      type: 'SOLID'
    };
  }

  // Parse spacing - use design settings if available, otherwise parse from style
  paragraphOptions.spacing = {};
  if (paragraphSpacing) {
    // Apply design paragraph spacing
    if (paragraphSpacing.marginTop) {
      const top = parseFloat(paragraphSpacing.marginTop) || 0;
      paragraphOptions.spacing.before = Math.round(top * 20); // Convert to twips
    }
    if (paragraphSpacing.marginBottom) {
      const bottom = parseFloat(paragraphSpacing.marginBottom) || 0;
      paragraphOptions.spacing.after = Math.round(bottom * 20);
    }
  } else {
    // Fallback to parsing from style
    const marginTopMatch = style.match(/margin-top\s*:\s*([^;]+)/i);
    const marginBottomMatch = style.match(/margin-bottom\s*:\s*([^;]+)/i);
    if (marginTopMatch) {
      const top = parseFloat(marginTopMatch[1]) || 0;
      paragraphOptions.spacing.before = Math.round(top * 20);
    }
    if (marginBottomMatch) {
      const bottom = parseFloat(marginBottomMatch[1]) || 0;
      paragraphOptions.spacing.after = Math.round(bottom * 20);
    }
  }
  
  // Remove spacing object if empty
  if (Object.keys(paragraphOptions.spacing).length === 0) {
    delete paragraphOptions.spacing;
  }

  // Handle headings
  if (tagName === 'h1') {
    paragraphOptions.heading = HeadingLevel.HEADING_1;
  } else if (tagName === 'h2') {
    paragraphOptions.heading = HeadingLevel.HEADING_2;
  } else if (tagName === 'h3') {
    paragraphOptions.heading = HeadingLevel.HEADING_3;
  } else if (tagName === 'h4') {
    paragraphOptions.heading = HeadingLevel.HEADING_4;
  } else if (tagName === 'h5') {
    paragraphOptions.heading = HeadingLevel.HEADING_5;
  } else if (tagName === 'h6') {
    paragraphOptions.heading = HeadingLevel.HEADING_6;
  }

  // Determine default font based on element type
  const isHeading = tagName.startsWith('h');
  const targetDefaultFont = defaultFonts && (isHeading ? defaultFonts.heading : defaultFonts.body);

  // Process child nodes to build TextRuns with formatting
  const textRuns = extractTextRunsFromElement(element, $, defaultFonts, isHeading);
  paragraphOptions.children.push(...textRuns);

  // If no children, add empty text
  if (paragraphOptions.children.length === 0) {
    paragraphOptions.children.push(new TextRun({ text: ' ' }));
  }

  return new Paragraph(paragraphOptions);
};

// Helper to extract TextRuns from nested elements (for tables and lists)
const extractTextRuns = (element, $) => {
  return extractTextRunsFromElement(element, $);
};

// Helper function to parse border color from style or data attribute
const parseBorderColor = (styleStr, dataAttr) => {
  // Check data attribute first (from TableCellWithAttrs)
  if (dataAttr) {
    const color = parseColor(dataAttr) || parseColor(`color: ${dataAttr}`);
    if (color) return color;
  }
  
  // Check style for border-color
  if (styleStr) {
    const borderColorMatch = styleStr.match(/border(?:-color)?\s*:\s*([^;]+)/i);
    if (borderColorMatch) {
      const color = parseColor(`color: ${borderColorMatch[1].trim()}`);
      if (color) return color;
    }
  }
  return null;
};

// Helper function to parse border width
const parseBorderWidth = (styleStr) => {
  if (!styleStr) return null;
  const borderWidthMatch = styleStr.match(/border(?:-width)?\s*:\s*([^;]+)/i);
  if (borderWidthMatch) {
    const width = borderWidthMatch[1].trim();
    // Convert px to twips (1px ≈ 15 twips, 1pt = 20 twips)
    const pxMatch = width.match(/([\d.]+)\s*px/i);
    if (pxMatch) {
      return Math.round(parseFloat(pxMatch[1]) * 15); // 1px = 15 twips
    }
    // Handle pt
    const ptMatch = width.match(/([\d.]+)\s*pt/i);
    if (ptMatch) {
      return Math.round(parseFloat(ptMatch[1]) * 20); // 1pt = 20 twips
    }
    // Handle thin, medium, thick
    if (width.toLowerCase() === 'thin') return 15; // ~1px
    if (width.toLowerCase() === 'medium') return 60; // ~3px
    if (width.toLowerCase() === 'thick') return 120; // ~6px
  }
  return null;
};

// Helper function to parse individual border side (top, bottom, left, right)
const parseBorderSide = (styleStr, side, dataAttr) => {
  // First check for specific side border (e.g., border-top, border-left)
  const sideMatch = styleStr.match(new RegExp(`border-${side}\\s*:\\s*([^;]+)`, 'i'));
  
  if (sideMatch) {
    const borderValue = sideMatch[1].trim();
    if (borderValue === 'none' || borderValue === 'hidden' || borderValue === '0') {
      return null; // No border on this side
    }
    
    // Parse width, style, color from shorthand (e.g., "1px solid #cbd5e1")
    const parts = borderValue.split(/\s+/);
    let borderWidth = 15; // Default 1px
    let borderStyle = 'single';
    let borderColor = null;
    
    for (const part of parts) {
      const width = parseBorderWidth(part);
      if (width !== null) {
        borderWidth = width;
      } else if (['solid', 'dashed', 'dotted', 'double'].includes(part.toLowerCase())) {
        borderStyle = part.toLowerCase();
      } else {
        const color = parseColor(`color: ${part}`);
        if (color) {
          borderColor = color;
        }
      }
    }
    
    // If no color found in side-specific border, try general border-color or data attribute
    if (!borderColor) {
      borderColor = parseBorderColor(styleStr, dataAttr);
    }
    
    if (!borderColor) {
      return null; // No border color means no border
    }
    
    return {
      color: borderColor,
      size: borderWidth,
      style: borderStyle
    };
  }
  
  // If no side-specific border, check general border property
  const generalBorderMatch = styleStr.match(/border\s*:\s*([^;]+)/i);
  if (generalBorderMatch) {
    const borderValue = generalBorderMatch[1].trim();
    if (borderValue === 'none' || borderValue === 'hidden' || borderValue === '0') {
      return null;
    }
    
    // Parse general border shorthand
    const parts = borderValue.split(/\s+/);
    let borderWidth = 15;
    let borderStyle = 'single';
    let borderColor = null;
    
    for (const part of parts) {
      const width = parseBorderWidth(part);
      if (width !== null) {
        borderWidth = width;
      } else if (['solid', 'dashed', 'dotted', 'double'].includes(part.toLowerCase())) {
        borderStyle = part.toLowerCase();
      } else {
        const color = parseColor(`color: ${part}`);
        if (color) {
          borderColor = color;
        }
      }
    }
    
    if (!borderColor) {
      borderColor = parseBorderColor(styleStr, dataAttr);
    }
    
    if (!borderColor) {
      return null;
    }
    
    return {
      color: borderColor,
      size: borderWidth,
      style: borderStyle
    };
  }
  
  // No border specified for this side
  return null;
};

// Helper function to parse vertical alignment
const parseVerticalAlignment = (styleStr, tagName) => {
  if (styleStr) {
    const vAlignMatch = styleStr.match(/vertical-align\s*:\s*([^;]+)/i);
    if (vAlignMatch) {
      const align = vAlignMatch[1].trim().toLowerCase();
      if (align === 'top') return 'top';
      if (align === 'middle' || align === 'center') return 'center';
      if (align === 'bottom') return 'bottom';
    }
  }
  // Default based on tag
  return tagName === 'th' ? 'center' : 'top';
};

// Helper function to convert table to DOCX Table
const tableToDocxTable = (table, $, defaultFonts = null) => {
  const rows = [];
  const $table = $(table);
  
  // Parse table-level border (default: 1px solid #cbd5e1)
  const tableStyle = $table.attr('style') || '';
  const tableBorderColor = parseBorderColor(tableStyle, $table.attr('data-border-color')) || 'CBD5E1';
  const tableBorderWidth = parseBorderWidth(tableStyle) || 15; // Default 1px = 15 twips
  
  $(table).find('tr').each((i, tr) => {
    const cells = [];
    let cellIndex = 0;
    
    $(tr).find('td, th').each((j, td) => {
      const $td = $(td);
      const tagName = td.name ? td.name.toLowerCase() : '';
      const cellOptions = {
        children: []
      };

      const cellStyle = $td.attr('style') || '';
      
      // Parse merged cells (colspan and rowspan)
      const colspan = parseInt($td.attr('colspan') || '1', 10);
      const rowspan = parseInt($td.attr('rowspan') || '1', 10);
      
      if (colspan > 1) {
        cellOptions.columnSpan = colspan;
      }
      if (rowspan > 1) {
        cellOptions.rowSpan = rowspan;
      }

      // Parse cell background color (from style or data-bg attribute)
      let bgColor = $td.attr('data-bg');
      if (bgColor) {
        // Convert any color format to hex using the helper function
        bgColor = colorToHex(bgColor);
      } else {
        // Parse from style attribute
        bgColor = parseBackgroundColor(cellStyle);
      }
      
      // Only set shading if we have a valid hex color
      if (bgColor && /^[0-9A-F]{6}$/i.test(bgColor)) {
        cellOptions.shading = {
          fill: bgColor.toUpperCase(),
          type: 'SOLID'
        };
      } else if (tagName === 'th') {
        // Default header background if not specified
        cellOptions.shading = {
          fill: 'F1F5F9',
          type: 'SOLID'
        };
      }

      // Parse individual border sides for the cell
      const dataBorderColor = $td.attr('data-border-color');
      const topBorder = parseBorderSide(cellStyle, 'top', dataBorderColor);
      const bottomBorder = parseBorderSide(cellStyle, 'bottom', dataBorderColor);
      const leftBorder = parseBorderSide(cellStyle, 'left', dataBorderColor);
      const rightBorder = parseBorderSide(cellStyle, 'right', dataBorderColor);
      
      // Default borders if not specified (use table defaults or cell defaults)
      const defaultBorderColor = parseBorderColor(cellStyle, dataBorderColor) || tableBorderColor || 'CBD5E1';
      const defaultBorderWidth = parseBorderWidth(cellStyle) || tableBorderWidth || 15;
      
      // Set borders for the cell - use parsed borders or defaults
      // Ensure all border colors are valid hex (no #, uppercase)
      const normalizeBorderColor = (color) => {
        if (!color) return 'CBD5E1'; // Default
        let hex = color;
        if (hex.startsWith('#')) hex = hex.substring(1);
        // Ensure it's valid hex
        if (!/^[0-9A-F]{6}$/i.test(hex)) return 'CBD5E1';
        return hex.toUpperCase();
      };

      const safeBorder = (border, defaultColor, defaultWidth) => {
        if (border && border.color && border.size) {
          return {
            color: normalizeBorderColor(border.color),
            size: Math.max(1, Math.min(1000, border.size || defaultWidth)), // Clamp size
            style: border.style || 'single'
          };
        }
        return {
          color: normalizeBorderColor(defaultColor),
          size: Math.max(1, Math.min(1000, defaultWidth)),
          style: 'single'
        };
      };

      cellOptions.borders = {
        top: safeBorder(topBorder, defaultBorderColor, defaultBorderWidth),
        bottom: safeBorder(bottomBorder, defaultBorderColor, defaultBorderWidth),
        left: safeBorder(leftBorder, defaultBorderColor, defaultBorderWidth),
        right: safeBorder(rightBorder, defaultBorderColor, defaultBorderWidth)
      };

      // Parse text alignment (horizontal)
      const cellAlign = parseAlignment(cellStyle, $td.attr('align'));
      
      // Parse vertical alignment
      const verticalAlign = parseVerticalAlignment(cellStyle, tagName);
      cellOptions.verticalAlign = verticalAlign;

      // Process cell content
      // For header cells, ensure bold formatting is applied by adding it to inherited options
      const inheritedOptions = tagName === 'th' ? { bold: true } : {};
      // Table cells use body font (not heading font)
      const cellRuns = extractTextRunsFromElement(td, $, inheritedOptions, defaultFonts, false);
      
      if (cellRuns.length > 0) {
        cellOptions.children.push(new Paragraph({
          children: cellRuns,
          alignment: cellAlign
        }));
      } else {
        cellOptions.children.push(new Paragraph({ text: ' ' }));
      }

      cells.push(new TableCell(cellOptions));
      cellIndex++;
    });
    
    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  if (rows.length > 0) {
    // Normalize border color (ensure hex without #, uppercase)
    const normalizeColor = (color) => {
      if (!color) return 'CBD5E1';
      let hex = color;
      if (hex.startsWith('#')) hex = hex.substring(1);
      if (!/^[0-9A-F]{6}$/i.test(hex)) return 'CBD5E1';
      return hex.toUpperCase();
    };

    const normalizedColor = normalizeColor(tableBorderColor);
    const normalizedWidth = Math.max(1, Math.min(1000, tableBorderWidth || 15));

    // Set table borders - use same width for all borders to match editor (1px solid)
    const tableBorders = {
      top: {
        color: normalizedColor,
        size: normalizedWidth,
        style: 'single'
      },
      bottom: {
        color: normalizedColor,
        size: normalizedWidth,
        style: 'single'
      },
      left: {
        color: normalizedColor,
        size: normalizedWidth,
        style: 'single'
      },
      right: {
        color: normalizedColor,
        size: normalizedWidth,
        style: 'single'
      },
      insideHorizontal: {
        color: normalizedColor,
        size: normalizedWidth, // Same width as outer borders
        style: 'single'
      },
      insideVertical: {
        color: normalizedColor,
        size: normalizedWidth, // Same width as outer borders
        style: 'single'
      }
    };

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders
    });
  }
  return null;
};

// Helper to process a single element and add to elements array
const processElement = (el, $, elements, defaultFonts = null, paragraphSpacing = null) => {
  if (!el || !el.name) return;
  
  const tagName = el.name.toLowerCase();
  const $el = $(el);
  
  // Handle page breaks
  if ($el.hasClass('page-break') || $el.attr('data-type') === 'pageBreak' || 
      $el.attr('data-page-break') === 'true') {
    elements.push(new Paragraph({ children: [new PageBreak()] }));
    return;
  }

  // Handle tables
  if (tagName === 'table') {
    const table = tableToDocxTable(el, $, defaultFonts);
    if (table) {
      elements.push(table);
    }
    return;
  }
  
  // Handle lists
  if (tagName === 'ul' || tagName === 'ol') {
    $el.find('> li').each((k, li) => {
      // List items use body font (not heading font)
      const listRuns = extractTextRunsFromElement(li, $, {}, defaultFonts, false);
      if (listRuns.length > 0) {
        const listParaOptions = {
          children: listRuns
        };
        if (tagName === 'ul') {
          listParaOptions.bullet = { level: 0 };
        } else {
          // Use the numbering reference we defined in the document
          listParaOptions.numbering = {
            reference: "default-numbering",
            level: 0
          };
        }
        // Apply paragraph spacing if available
        if (paragraphSpacing) {
          listParaOptions.spacing = {};
          if (paragraphSpacing.marginTop) {
            const top = parseFloat(paragraphSpacing.marginTop) || 0;
            listParaOptions.spacing.before = Math.round(top * 20);
          }
          if (paragraphSpacing.marginBottom) {
            const bottom = parseFloat(paragraphSpacing.marginBottom) || 0;
            listParaOptions.spacing.after = Math.round(bottom * 20);
          }
        }
        elements.push(new Paragraph(listParaOptions));
      }
    });
    return;
  }
  
  // Handle horizontal rules
  if (tagName === 'hr') {
    elements.push(new Paragraph({ children: [new TextRun({ text: '─'.repeat(50) })] }));
    return;
  }
  
  // Handle paragraphs, headings, and divs
  if (tagName === 'p' || tagName.startsWith('h') || tagName === 'div') {
    // Check if div contains block elements - if so, process them
    if (tagName === 'div' && $el.children().length > 0) {
      // Process children recursively
      $el.children().each((i, child) => {
        processElement(child, $, elements, defaultFonts, paragraphSpacing);
      });
      return;
    }
    
    // Process as paragraph/heading
    const para = elementToParagraph(el, $, defaultFonts, paragraphSpacing);
    if (para) {
      elements.push(para);
    }
    return;
  }
  
  // Handle blockquote
  if (tagName === 'blockquote') {
    const para = elementToParagraph(el, $, defaultFonts, paragraphSpacing);
    if (para) {
      // Add left border styling via spacing
      para.shading = para.shading || {};
      elements.push(para);
    }
    return;
  }
  
  // Handle pre/code
  if (tagName === 'pre' || tagName === 'code') {
    const para = elementToParagraph(el, $, defaultFonts, paragraphSpacing);
    if (para) {
      elements.push(para);
    }
    return;
  }
};

// Main function to convert HTML to DOCX elements
const htmlToDocxElements = (html, designSettings = {}) => {
  const elements = [];
  const $ = cheerio.load(html);
  const processedElements = new WeakSet(); // Track processed DOM elements to avoid duplicates
  
  // Store design settings for use in element processing
  const defaultFonts = designSettings.fontSet || { heading: 'Calibri Light', body: 'Calibri' };
  const paragraphSpacing = designSettings.paragraphSpacing || null;

  // Process document pages (pageBlock elements)
  const pages = $('.document-page, .cover-page-block, [data-type="pageBlock"]');
  
  if (pages.length > 0) {
    pages.each((i, page) => {
      const $page = $(page);
      
      // Get all top-level block elements in document order
      // Process only direct children to avoid duplicates
      const children = $page.children();
      
      if (children.length > 0) {
        // Process direct children
        children.each((j, child) => {
          if (!processedElements.has(child)) {
            processedElements.add(child);
            processElement(child, $, elements, defaultFonts, paragraphSpacing);
          }
        });
      } else {
        // If no direct children, find all block elements but filter to avoid nested ones
        const allBlocks = $page.find('p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre, hr, [data-type="pageBreak"]');
        const topLevelBlocks = [];
        
        allBlocks.each((j, block) => {
          const $block = $(block);
          // Check if this block is nested inside another block we're processing
          let isNested = false;
          for (let k = 0; k < topLevelBlocks.length; k++) {
            if ($(topLevelBlocks[k]).find(block).length > 0) {
              isNested = true;
              break;
            }
          }
          if (!isNested && !processedElements.has(block)) {
            topLevelBlocks.push(block);
            processedElements.add(block);
          }
        });
        
        // Process top-level blocks in order
        topLevelBlocks.forEach(block => {
          processElement(block, $, elements, defaultFonts, paragraphSpacing);
        });
      }

      // Add page break after each page (except last)
      if (i < pages.length - 1) {
        elements.push(new Paragraph({ children: [new PageBreak()] }));
      }
    });
  } else {
    // If no pages found, process root elements
    // Try .ProseMirror or body content
    const container = $('.ProseMirror').length > 0 ? $('.ProseMirror') : $('body');
    
    if (container.length > 0) {
      // Process direct children only
      container.children().each((i, child) => {
        if (!processedElements.has(child)) {
          processedElements.add(child);
          processElement(child, $, elements, defaultFonts, paragraphSpacing);
        }
      });
      
      // If no children found, try finding all top-level block elements
      if (elements.length === 0) {
        const allBlocks = container.find('p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre, hr, div');
        const topLevelBlocks = [];
        
        allBlocks.each((j, block) => {
          const $block = $(block);
          const parent = $block.parent()[0];
          const parentTag = parent ? parent.name.toLowerCase() : '';
          
          // Only include if parent is container or not a block element
          const isTopLevel = parent === container[0] || 
                            !['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'blockquote', 'div'].includes(parentTag);
          
          if (isTopLevel) {
            // Check if nested in another block we're adding
            let isNested = false;
            for (let k = 0; k < topLevelBlocks.length; k++) {
              if ($(topLevelBlocks[k]).find(block).length > 0) {
                isNested = true;
                break;
              }
            }
            if (!isNested && !processedElements.has(block)) {
              topLevelBlocks.push(block);
              processedElements.add(block);
            }
          }
        });
        
        topLevelBlocks.forEach(block => {
          processElement(block, $, elements, defaultFonts, paragraphSpacing);
        });
      }
    }
  }

  return elements.length > 0 ? elements : [new Paragraph({ text: ' ' })];
};

// Export to DOCX
// Helper function to extract design settings from HTML style tags
const extractDesignSettings = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const settings = {
    pageColor: '#FFFFFF',
    pageBorders: null,
    fontSet: null,
    paragraphSpacing: null,
    colorScheme: null,
    theme: null
  };

  // Extract page color from style tag
  const pageColorStyle = $('#design-page-color').html() || $('style#design-page-color').html();
  if (pageColorStyle) {
    const bgMatch = pageColorStyle.match(/background-color:\s*([^;!]+)/i);
    if (bgMatch) {
      settings.pageColor = bgMatch[1].trim();
    }
  }

  // Extract page borders from style tag
  const pageBordersStyle = $('#design-page-borders').html() || $('style#design-page-borders').html();
  if (pageBordersStyle && !pageBordersStyle.includes('display: none')) {
    // Look for border in ::before pseudo-element or direct border
    const borderMatch = pageBordersStyle.match(/border:\s*([^;]+)/i);
    if (borderMatch) {
      const borderValue = borderMatch[1].trim();
      // Parse border width, style, color
      const parts = borderValue.split(/\s+/);
      const widthPart = parts.find(p => /pt|px/.test(p));
      const stylePart = parts.find(p => ['solid', 'dashed', 'dotted', 'double'].includes(p.toLowerCase()));
      const colorPart = parts.find(p => /^#|rgb|rgba/.test(p));
      
      settings.pageBorders = {
        width: widthPart || '1pt',
        style: stylePart || 'solid',
        color: colorPart || '#000000'
      };
    }
  }

  // Extract font set from style tag
  const fontSetStyle = $('#design-font-set').html() || $('style#design-font-set').html();
  if (fontSetStyle) {
    // Match heading fonts (h1-h6)
    const headingMatch = fontSetStyle.match(/h[1-6][^{]*\{[^}]*font-family:\s*['"]?([^'";,}]+)/i);
    // Match body fonts (p, li, td, th)
    const bodyMatch = fontSetStyle.match(/(?:p|li|td|th)[^{]*\{[^}]*font-family:\s*['"]?([^'";,}]+)/i);
    
    if (headingMatch || bodyMatch) {
      settings.fontSet = {
        heading: headingMatch ? headingMatch[1].trim().replace(/['"]/g, '') : 'Calibri Light',
        body: bodyMatch ? bodyMatch[1].trim().replace(/['"]/g, '') : 'Calibri'
      };
    }
  }

  // Extract paragraph spacing from style tag
  const spacingStyle = $('#design-paragraph-spacing').html() || $('style#design-paragraph-spacing').html();
  if (spacingStyle) {
    const lineHeightMatch = spacingStyle.match(/line-height:\s*([^;!]+)/i);
    const marginTopMatch = spacingStyle.match(/margin-top:\s*([^;!]+)/i);
    const marginBottomMatch = spacingStyle.match(/margin-bottom:\s*([^;!]+)/i);
    if (lineHeightMatch || marginTopMatch || marginBottomMatch) {
      // Helper to convert spacing value to points
      const parseSpacingValue = (value) => {
        if (!value) return null;
        const trimmed = value.trim();
        // Extract number
        const numMatch = trimmed.match(/([\d.]+)/);
        if (!numMatch) return null;
        let num = parseFloat(numMatch[1]);
        // Convert based on unit
        if (trimmed.includes('px')) {
          return `${(num / 1.33).toFixed(2)}pt`; // Convert px to pt (approximate)
        } else if (trimmed.includes('em')) {
          return `${(num * 12).toFixed(2)}pt`; // Convert em to pt (approximate)
        } else if (trimmed.includes('pt')) {
          return trimmed; // Already in points
        } else {
          // Assume points if no unit
          return `${num}pt`;
        }
      };
      
      settings.paragraphSpacing = {
        lineHeight: lineHeightMatch ? parseFloat(lineHeightMatch[1]) : null,
        marginTop: marginTopMatch ? parseSpacingValue(marginTopMatch[1]) : null,
        marginBottom: marginBottomMatch ? parseSpacingValue(marginBottomMatch[1]) : null
      };
    }
  }

  return settings;
};

const exportToDOCX = async (req, res) => {
  try {
    const { htmlContent, title = 'Document' } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Extract design settings from HTML
    const designSettings = extractDesignSettings(htmlContent);

    // Convert HTML to DOCX elements (pass design settings for default fonts/spacing)
    let elements;
    try {
      elements = htmlToDocxElements(htmlContent, designSettings);
    } catch (parseError) {
      logger.error('Error parsing HTML to DOCX elements:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse document content', 
        message: parseError.message 
      });
    }

    // Ensure we have at least one element
    if (!elements || elements.length === 0) {
      elements.push(new Paragraph({ text: ' ' }));
    }

    // Create numbering definitions for ordered lists
    const numbering = {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    };

    // Prepare page properties with design settings
    const pageProperties = {
      size: {
        orientation: 'portrait',
        width: 11906, // A4 width in twips (210mm)
        height: 16838, // A4 height in twips (297mm)
      },
      margin: {
        top: 1440, // 1 inch = 1440 twips
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
    };

    // Apply page background color
    if (designSettings.pageColor && designSettings.pageColor !== '#FFFFFF') {
      const bgColor = colorToHex(designSettings.pageColor);
      if (bgColor) {
        pageProperties.fill = {
          type: 'solid',
          color: bgColor
        };
      }
    }

    // Apply page borders
    if (designSettings.pageBorders) {
      // Parse border width from string like "1pt", "1/2 pt", etc.
      let borderWidth = 20; // Default 1pt = 20 twips
      const widthStr = designSettings.pageBorders.width || '1pt';
      // Handle fractional widths like "1/2 pt", "1 1/2 pt"
      let widthValue = widthStr.replace('pt', '').trim();
      widthValue = widthValue.replace('½', '0.5')
        .replace('1/2', '0.5')
        .replace('1 1/2', '1.5')
        .replace('2 1/4', '2.25')
        .replace('4 1/2', '4.5')
        .replace(/\s+/g, '');
      const widthNum = parseFloat(widthValue) || 1;
      borderWidth = Math.round(widthNum * 20); // Convert pt to twips (1pt = 20 twips)
      
      const borderColor = colorToHex(designSettings.pageBorders.color) || '000000';
      const borderStyle = designSettings.pageBorders.style === 'dashed' ? 'dash' :
                         designSettings.pageBorders.style === 'dotted' ? 'dot' :
                         designSettings.pageBorders.style === 'double' ? 'double' : 'single';
      
      pageProperties.borders = {
        top: {
          color: borderColor,
          size: borderWidth,
          style: borderStyle
        },
        right: {
          color: borderColor,
          size: borderWidth,
          style: borderStyle
        },
        bottom: {
          color: borderColor,
          size: borderWidth,
          style: borderStyle
        },
        left: {
          color: borderColor,
          size: borderWidth,
          style: borderStyle
        }
      };
    }

    // Create section properties with design settings
    const sectionProperties = {
      page: pageProperties
    };
    
    // Note: Page background color and borders in DOCX are typically applied via:
    // - Section properties for page borders
    // - Page background is handled differently in DOCX (may need to use page background element)
    // For now, we apply what's supported by the docx library

    // Create document with proper structure
    const doc = new Document({
      creator: 'Word Editor',
      title: title,
      description: 'Document exported from Word Editor',
      numbering: numbering,
      sections: [{
        properties: sectionProperties,
        children: elements
      }]
    });

    // Generate DOCX buffer
    let buffer;
    try {
      buffer = await Packer.toBuffer(doc);
    } catch (bufferError) {
      logger.error('Error generating DOCX buffer:', bufferError);
      return res.status(500).json({ 
        error: 'Failed to generate DOCX file', 
        message: bufferError.message,
        details: process.env.NODE_ENV === 'development' ? bufferError.stack : undefined
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    logger.info(`DOCX exported: ${title}`);
  } catch (error) {
    logger.error('Error exporting to DOCX:', error);
    res.status(500).json({ 
      error: 'Failed to export DOCX', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  exportToPDF,
  exportToDOCX
};

