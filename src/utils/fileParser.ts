import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

// Set local PDF.js worker URL bundled by Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function parseResumeFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. PDF File Text Extraction using pdfjs-dist with Y-coordinate Line Breaking
  if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let extractedPdfText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageLines: string[] = [];
        let lastY: number | null = null;
        let currentLine = '';

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;

          // y position is item.transform[5]
          const currentY = item.transform ? Math.round(item.transform[5]) : null;

          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) >= 4) {
            // New Y line detected
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            currentLine += (item.hasEOL ? '\n' : ' ') + item.str;
          }

          if (currentY !== null) {
            lastY = currentY;
          }
        }

        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }

        extractedPdfText += pageLines.join('\n') + '\n';
      }

      const cleaned = cleanExtractedText(extractedPdfText);
      if (cleaned.length > 10) {
        return cleaned;
      }
    } catch (err) {
      console.warn('PDF.js parsing failed, trying text stream extractor:', err);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const textDecoder = new TextDecoder('latin1');
        const rawBytesString = textDecoder.decode(arrayBuffer);
        const extracted = extractPdfLiteralStrings(rawBytesString);
        if (extracted.length > 10) {
          return cleanExtractedText(extracted);
        }
      } catch (fallbackErr) {
        console.error('Fallback PDF parsing error:', fallbackErr);
      }
    }
  }

  // 2. DOCX / DOC File Text Extraction using mammoth
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 10) {
        return cleanExtractedText(result.value);
      }
    } catch (err) {
      console.warn('Mammoth DOCX parsing failed:', err);
    }
  }

  // 3. Plain Text / TXT / RTF fallback
  try {
    const rawText = await file.text();
    if (!fileName.endsWith('.pdf')) {
      return cleanExtractedText(rawText);
    }
  } catch (err) {
    console.error('File reading failed:', err);
  }

  return '';
}

// Extract uncompressed literal strings from PDF stream
function extractPdfLiteralStrings(rawBytes: string): string {
  const matches = rawBytes.match(/\(([^()]{2,200})\)/g) || [];
  const lines: string[] = [];

  matches.forEach((m) => {
    const text = m
      .slice(1, -1)
      .replace(/\\([()])/g, '$1')
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .trim();

    const lower = text.toLowerCase();
    if (
      text.length >= 2 &&
      !lower.startsWith('/f') &&
      !lower.startsWith('pdf') &&
      !lower.includes('startxref') &&
      !lower.includes('endstream') &&
      !lower.includes('flatedecode') &&
      !lower.includes('fontdescriptor') &&
      !/^\d+$/.test(text)
    ) {
      lines.push(text);
    }
  });

  return lines.join('\n');
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
    .replace(/startxref[\s\S]*?%%EOF/gi, '')
    .replace(/%PDF-[0-9.]+/gi, '')
    .replace(/stream[\s\S]*?endstream/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
