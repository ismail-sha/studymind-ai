// ─────────────────────────────────────────────────────────────
//  File Parser Utility
//  Extracts plain text from  TXT / MD / PDF / DOCX / images
// ─────────────────────────────────────────────────────────────

/** Read a plain-text file */
function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/** Extract text from a PDF using pdf.js (loaded via CDN worker) */
async function extractPDF(file) {
  const pdfjsLib = await import('pdfjs-dist');

  // Use CDN worker to avoid Vite bundling issues
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += `\n[Page ${i}]\n${pageText}\n`;
  }
  return fullText.trim() || `[PDF: ${file.name}] — No extractable text found (scanned/image PDF).`;
}

/** Extract text from a DOCX file using mammoth */
async function extractDOCX(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim() || `[DOCX: ${file.name}] — No text extracted.`;
}

/** Read image as base64 data URL (for display) */
function readImageDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

/**
 * Master extractor — detects file type and returns plain text.
 * @param {File} file
 * @returns {Promise<{text: string, preview?: string}>}
 */
export async function extractText(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  try {
    if (['txt', 'md', 'markdown', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'py'].includes(ext)) {
      const text = await readAsText(file);
      return { text };
    }

    if (ext === 'pdf') {
      const text = await extractPDF(file);
      return { text };
    }

    if (['doc', 'docx'].includes(ext)) {
      const text = await extractDOCX(file);
      return { text };
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      const preview = await readImageDataURL(file);
      return {
        text: `[Image: ${file.name}]\nThis is an image file. You can ask the AI to discuss topics related to this image, or describe what you see in it for AI-powered analysis.`,
        preview,
      };
    }

    if (['ppt', 'pptx'].includes(ext)) {
      return {
        text: `[Presentation: ${file.name}]\nPowerPoint parsing requires a backend server. For this app, please copy & paste the slide text below, or describe the topics covered in the presentation.`,
      };
    }

    // Generic fallback
    return {
      text: `[${file.name}]\nFile type ".${ext}" is not directly parseable in the browser. Ask the AI about the topic this file likely covers, or paste the relevant text into the chat.`,
    };
  } catch (err) {
    return {
      text: `[${file.name}]\n⚠️ Error extracting text: ${err.message}. Try a different file.`,
    };
  }
}

/** Format file size for display */
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Get colour associated with file extension */
export function fileColor(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const map = { pdf: '#f43f5e', doc: '#3b82f6', docx: '#3b82f6', ppt: '#f59e0b', pptx: '#f59e0b', jpg: '#a855f7', jpeg: '#a855f7', png: '#a855f7', gif: '#a855f7' };
  return map[ext] ?? '#06d6c8';
}
