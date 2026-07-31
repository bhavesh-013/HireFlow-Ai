const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('../utils/apiError');

/**
 * Extract raw text from PDF buffer
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromPdf = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    if (!data || !data.text || !data.text.trim()) {
      throw ApiError.badRequest('Unable to extract text from PDF file. File may be image-only, scanned, or empty.');
    }
    return data.text.trim();
  } catch (error) {
    if (error.isApiError) throw error;
    console.error('[PDF Parsing Error]:', error.message);
    throw ApiError.badRequest(`Corrupted or invalid PDF file: ${error.message}`);
  }
};

/**
 * Extract raw text from DOCX buffer
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (!result || !result.value || !result.value.trim()) {
      throw ApiError.badRequest('Unable to extract text from DOCX file. File may be blank or corrupted.');
    }
    return result.value.trim();
  } catch (error) {
    if (error.isApiError) throw error;
    console.error('[DOCX Parsing Error]:', error.message);
    throw ApiError.badRequest(`Corrupted or invalid DOCX file: ${error.message}`);
  }
};

/**
 * Extract text from document buffer based on mimetype or extension
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} originalName
 * @returns {Promise<string>}
 */
const extractTextFromBuffer = async (buffer, mimetype, originalName = '') => {
  const isPdf = mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    originalName.toLowerCase().endsWith('.docx') ||
    originalName.toLowerCase().endsWith('.doc');

  if (isPdf) {
    return await extractTextFromPdf(buffer);
  } else if (isDocx) {
    return await extractTextFromDocx(buffer);
  } else {
    throw ApiError.badRequest('Unsupported file format. Only PDF (.pdf) and DOCX (.docx) files are supported.');
  }
};

module.exports = {
  extractTextFromPdf,
  extractTextFromDocx,
  extractTextFromBuffer,
};
