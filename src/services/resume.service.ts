import {
  supabaseService,
  createResume,
  updateResume,
  getResume,
  listResumes,
  deleteResume,
  duplicateResume,
  renameResume,
  favoriteResume,
  archiveResume,
  autosaveResume,
  getLatestResume,
  getIsCreatingResume,
  ResumeDocument,
} from './supabaseService';

export type { ResumeDocument };

export const resumeService = {
  list: listResumes,
  get: getResume,
  create: createResume,
  update: updateResume,
  autosave: autosaveResume,
  remove: deleteResume,
  duplicate: duplicateResume,
  rename: renameResume,
  favorite: favoriteResume,
  archive: archiveResume,
  getLatestResume,
  getIsCreatingResume,
};

export {
  createResume,
  updateResume,
  getResume,
  listResumes,
  deleteResume,
  duplicateResume,
  renameResume,
  favoriteResume,
  archiveResume,
  autosaveResume,
  getLatestResume,
  getIsCreatingResume,
};

export default resumeService;
