import React from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  Globe,
  MapPin
} from 'lucide-react';
import type {
  ParsedResumeData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificateItem,
  AchievementItem,
  SectionNavItem,
  CustomSectionData,
} from '../../types';

interface ExperiencedDocumentViewProps {
  displayPersonalInfo: ParsedResumeData['personalInfo'];
  displayExperiences: ExperienceItem[];
  displayEducation: EducationItem[];
  displaySkills: string;
  displayProjects: ProjectItem[];
  displayCertificates: CertificateItem[];
  displayAchievements: AchievementItem[];
  customSections: CustomSectionData[];
  sections: SectionNavItem[];
  activeSection: string;
  aiHighlightedSection: string | null;
  handleSelectSection: (id: string) => void;
  primaryColor?: string;
}

export default function ExperiencedDocumentView({
  displayPersonalInfo,
  displayExperiences,
  displayEducation,
  displaySkills,
  displayProjects,
  displayCertificates,
  displayAchievements,
  customSections,
  sections,
  activeSection,
  aiHighlightedSection,
  handleSelectSection,
  primaryColor = '#000000',
}: ExperiencedDocumentViewProps) {
  const visibleSections = sections.filter(
    (s) => s.visible && s.type !== 'personal' && s.type !== 'summary' && s.type !== 'styling'
  );

  const renderSectionItem = (sec: SectionNavItem) => {
    // ── 1. WORK EXPERIENCE ──────────────────────────────────────────────────────────
    if (sec.type === 'experience' && displayExperiences.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id
              ? 'ring-2 ring-blue-500/50 bg-blue-50/20'
              : aiHighlightedSection === 'experience'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30'
              : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {sec.title}
            </h2>
          </div>

          <div className="space-y-3 font-serif">
            {displayExperiences.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    {exp.title} {exp.company ? ` - ${exp.company}` : ''}
                  </h3>
                  {exp.period && (
                    <span className="text-[11px] text-slate-800 font-mono shrink-0">
                      {exp.period}
                    </span>
                  )}
                </div>
                {exp.location && (
                  <p className="text-[11px] italic text-slate-700">
                    {exp.location}
                  </p>
                )}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-800 leading-relaxed mt-1">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── 2. PROJECTS ─────────────────────────────────────────────────────────────────
    if (sec.type === 'projects' && displayProjects.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id
              ? 'ring-2 ring-blue-500/50 bg-blue-50/20'
              : aiHighlightedSection === 'projects'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30'
              : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {sec.title}
            </h2>
          </div>

          <div className="space-y-3 font-serif">
            {displayProjects.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    {proj.title}
                  </h3>
                  {(proj.link || proj.demoUrl || proj.period) && (
                    <span className="text-[11px] text-slate-700 font-mono shrink-0">
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-700 hover:underline"
                        >
                          Github
                        </a>
                      )}
                      {proj.link && proj.demoUrl && <span> | </span>}
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-700 hover:underline"
                        >
                          Live
                        </a>
                      )}
                      {proj.period && !proj.link && !proj.demoUrl && proj.period}
                    </span>
                  )}
                </div>
                {proj.description && <p className="text-xs text-slate-800">{proj.description}</p>}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-800 leading-relaxed">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── 3. ACHIEVEMENTS ─────────────────────────────────────────────────────────────
    if (sec.type === 'achievements' && displayAchievements.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {sec.title}
            </h2>
          </div>

          <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs text-slate-800 font-serif leading-relaxed">
            {displayAchievements.map((a) => (
              <li key={a.id}>
                <span className="font-bold text-slate-900">{a.title}</span>
                {a.description ? ` ${a.description}` : ''}
                {a.date ? <span className="font-mono text-slate-600 text-[11px]"> ({a.date})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // ── 4. EDUCATION ────────────────────────────────────────────────────────────────
    if (sec.type === 'education' && displayEducation.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {sec.title}
            </h2>
          </div>

          <div className="space-y-1.5 font-serif text-xs">
            {displayEducation.map((edu) => (
              <div key={edu.id} className="grid grid-cols-12 gap-2 items-baseline">
                {/* Date range left */}
                <div className="col-span-3 text-[11px] text-slate-700 font-mono">
                  {edu.period || ''}
                </div>
                {/* Degree & Institution middle */}
                <div className="col-span-6 text-slate-900">
                  <span className="font-bold">{edu.degree}</span>
                  {edu.institution ? ` at ${edu.institution}` : ''}
                </div>
                {/* Grade / CGPA right */}
                <div className="col-span-3 text-right text-[11px] text-slate-800">
                  {edu.highlights || (edu.gpa ? `Grade: ${edu.gpa}` : '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── 5. SKILLS ───────────────────────────────────────────────────────────────────
    if (sec.type === 'skills' && displaySkills) {
      const lines = displaySkills.split('\n').filter((l) => l.trim());
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id
              ? 'ring-2 ring-blue-500/50 bg-blue-50/20'
              : aiHighlightedSection === 'skills'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30'
              : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {sec.title}
            </h2>
          </div>

          <div className="space-y-1 font-serif text-xs">
            {lines.map((line, idx) => {
              const parts = line.split(':');
              if (parts.length > 1) {
                return (
                  <div key={idx} className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-900 min-w-[110px] shrink-0">
                      {parts[0].trim()} :
                    </span>
                    <span className="text-slate-800">{parts.slice(1).join(':').trim()}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="text-slate-800">{line}</div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── 6. CERTIFICATES ─────────────────────────────────────────────────────────────
    if (sec.type === 'certificates' && displayCertificates.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {sec.title}
            </h2>
          </div>

          <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-800 font-serif leading-relaxed">
            {displayCertificates.map((c) => (
              <li key={c.id}>
                <span className="font-bold text-slate-900">{c.title}</span>
                {c.issuer ? ` – ${c.issuer}` : ''}
                {c.date ? <span className="font-mono text-slate-600 text-[11px]"> ({c.date})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // ── 7. CUSTOM SECTIONS ──────────────────────────────────────────────────────────
    if (sec.type === 'custom') {
      const customData = customSections.find((c) => c.id === sec.id);
      if (!customData || customData.items.length === 0) return null;

      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <div className="border-b border-slate-900 pb-0.5 mb-2.5">
            <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">
              {customData.title}
            </h2>
          </div>

          <div className="space-y-2 font-serif text-xs text-slate-800">
            {customData.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    {item.subtitle && <p className="text-slate-700 italic">{item.subtitle}</p>}
                  </div>
                  {item.date && <span className="text-[11px] text-slate-600 font-mono">{item.date}</span>}
                </div>
                {item.description && <p className="text-slate-800">{item.description}</p>}
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800">
                    {item.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full space-y-3 font-serif">
      {/* ── 1. HEADER (Centered Name & Contact Bar matching reference image) ──────────── */}
      <div
        id="doc-sec-personal"
        onClick={() => handleSelectSection('personal')}
        className={`pb-2 text-center cursor-pointer transition-all rounded-lg p-2 ${
          activeSection === 'personal' ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
        }`}
      >
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900 tracking-wide text-center mb-1">
          {displayPersonalInfo.fullName}
        </h1>

        {/* Contact Row with Icons & Pipes */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-slate-800 flex-wrap mt-1.5 font-serif">
          {displayPersonalInfo.github && (
            <div className="flex items-center gap-1">
              <Github size={11} className="text-blue-800 shrink-0" />
              <span>
                {displayPersonalInfo.github.replace(/^https?:\/\//, '').replace(/.*github\.com\//, '')}
              </span>
            </div>
          )}
          {displayPersonalInfo.github && (displayPersonalInfo.linkedin || displayPersonalInfo.email || displayPersonalInfo.phone) && (
            <span className="text-slate-400 font-light">|</span>
          )}

          {displayPersonalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={11} className="text-blue-800 shrink-0" />
              <span>
                {displayPersonalInfo.linkedin.replace(/^https?:\/\//, '').replace(/.*linkedin\.com\/in\//, '')}
              </span>
            </div>
          )}
          {displayPersonalInfo.linkedin && (displayPersonalInfo.email || displayPersonalInfo.phone) && (
            <span className="text-slate-400 font-light">|</span>
          )}

          {displayPersonalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={11} className="text-blue-800 shrink-0" />
              <span>{displayPersonalInfo.email}</span>
            </div>
          )}
          {displayPersonalInfo.email && displayPersonalInfo.phone && (
            <span className="text-slate-400 font-light">|</span>
          )}

          {displayPersonalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={11} className="text-blue-800 shrink-0" />
              <span>{displayPersonalInfo.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Divider Line below Header */}
      <div className="border-b border-slate-900 w-full mb-3" />

      {/* ── 2. SECTIONS ───────────────────────────────────────────────────────────── */}
      <div className="w-full space-y-3">
        {visibleSections.map((sec) => renderSectionItem(sec))}
      </div>
    </div>
  );
}
