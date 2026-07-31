const mongoose = require('mongoose');

const ResumeUploadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx'],
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: true,
      max: [10 * 1024 * 1024, 'File size cannot exceed 10MB'],
    },
    cloudinaryUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['uploading', 'parsed', 'failed'],
      default: 'uploading',
    },
    parsedResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    errorDetails: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ResumeUploadSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeUpload', ResumeUploadSchema);
