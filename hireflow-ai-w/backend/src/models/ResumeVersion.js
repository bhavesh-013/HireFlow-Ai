const mongoose = require('mongoose');

const ResumeVersionSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      default: function () {
        return `Version ${this.versionNumber}`;
      },
    },
    notes: {
      type: String,
      default: '',
    },
    snapshot: {
      title: { type: String, required: true },
      template: { type: String, default: 'modern' },
      theme: { type: Object, default: {} },
      resumeData: { type: Object, required: true },
      atsScore: { type: Number, default: 0 },
      healthScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

ResumeVersionSchema.index({ resume: 1, versionNumber: -1 }, { unique: true });

module.exports = mongoose.model('ResumeVersion', ResumeVersionSchema);
