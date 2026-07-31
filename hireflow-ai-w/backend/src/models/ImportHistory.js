const mongoose = require('mongoose');

const ImportHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    importType: {
      type: String,
      required: true,
      enum: ['file_upload', 'linkedin_pdf', 'github'],
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
    },
    sourceDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    itemsImportedCount: {
      type: Number,
      default: 0,
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

ImportHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ImportHistory', ImportHistorySchema);
