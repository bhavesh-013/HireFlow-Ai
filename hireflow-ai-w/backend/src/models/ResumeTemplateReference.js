const mongoose = require('mongoose');

const ResumeTemplateReferenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Modern', 'Professional', 'Minimalist', 'Creative', 'Executive', 'Academic'],
      default: 'Modern',
    },
    previewImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600',
    },
    config: {
      defaultPrimaryColor: { type: String, default: '#0B192C' },
      defaultSecondaryColor: { type: String, default: '#1E3E62' },
      defaultFont: { type: String, default: 'Inter' },
      supportedFonts: [{ type: String }],
      layout: { type: String, enum: ['single-column', 'two-column', 'left-sidebar', 'right-sidebar'], default: 'single-column' },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeTemplateReference', ResumeTemplateReferenceSchema);
