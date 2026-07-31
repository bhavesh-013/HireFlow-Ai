const mongoose = require('mongoose');
const slugify = require('slugify');

const PersonalInfoSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    customFields: [
      {
        label: { type: String, default: '' },
        value: { type: String, default: '' },
      },
    ],
  },
  { _id: false }
);

const ExperienceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    company: { type: String, default: '' },
    position: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' },
    bullets: [{ type: String }],
    highlights: [{ type: String }],
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    gpa: { type: String, default: '' },
    bullets: [{ type: String }],
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    role: { type: String, default: '' },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    technologies: [{ type: String }],
    bullets: [{ type: String }],
  },
  { _id: false }
);

const SkillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    category: { type: String, default: 'General' },
    name: { type: String, default: '' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', ''], default: 'Intermediate' },
    keywords: [{ type: String }],
  },
  { _id: false }
);

const CertificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    url: { type: String, default: '' },
    credentialId: { type: String, default: '' },
  },
  { _id: false }
);

const AchievementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  { _id: false }
);

const LanguageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    language: { type: String, default: '' },
    proficiency: { type: String, default: 'Native / Native-like' },
  },
  { _id: false }
);

const LinkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const CustomSectionItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    heading: { type: String, default: '' },
    subheading: { type: String, default: '' },
    date: { type: String, default: '' },
    description: { type: String, default: '' },
    bullets: [{ type: String }],
  },
  { _id: false }
);

const CustomSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: 'Custom Section' },
    items: [CustomSectionItemSchema],
  },
  { _id: false }
);

const ValidationIssueSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['error', 'warning', 'info'], default: 'warning' },
    field: { type: String, default: '' },
    message: { type: String, required: true },
    recommendation: { type: String, default: '' },
  },
  { _id: false }
);

const ValidationResultSchema = new mongoose.Schema(
  {
    isValid: { type: Boolean, default: true },
    healthScore: { type: Number, default: 100 },
    issues: [ValidationIssueSchema],
    lastValidated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ResumeDataSchema = new mongoose.Schema(
  {
    personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
    summary: { type: String, default: '' },
    experience: [ExperienceSchema],
    education: [EducationSchema],
    projects: [ProjectSchema],
    skills: [SkillSchema],
    certifications: [CertificationSchema],
    achievements: [AchievementSchema],
    languages: [LanguageSchema],
    links: [LinkSchema],
    customSections: [CustomSectionSchema],
  },
  { _id: false }
);

const ThemeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#0B192C' },
    secondaryColor: { type: String, default: '#1E3E62' },
    accentColor: { type: String, default: '#3B82F6' },
    font: { type: String, default: 'Inter' },
    fontSize: { type: String, default: 'medium' },
    layoutSpacing: { type: String, default: 'normal' },
  },
  { _id: false }
);

const ThumbnailSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resume owner is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    template: {
      type: String,
      default: 'modern',
      trim: true,
    },
    theme: {
      type: ThemeSchema,
      default: () => ({}),
    },
    thumbnail: {
      type: ThumbnailSchema,
      default: () => ({}),
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'unlisted'],
      default: 'private',
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    healthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    validation: {
      type: ValidationResultSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastEdited: {
      type: Date,
      default: Date.now,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    resumeData: {
      type: ResumeDataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ResumeSchema.index({ owner: 1, createdAt: -1 });
ResumeSchema.index({ owner: 1, isFavorite: 1 });
ResumeSchema.index({ owner: 1, isArchived: 1 });
ResumeSchema.index({ owner: 1, title: 'text', 'resumeData.personalInfo.jobTitle': 'text' });

// Pre-save hook to generate slug and update lastEdited time
ResumeSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = slugify(`${this.title}-${uniqueSuffix}`, { lower: true, strict: true });
  }

  this.lastEdited = new Date();
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);
