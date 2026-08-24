import React from 'react';
import {
  Phone,
  Mail,
  Linkedin,
  Github,
  MapPin,
  Globe,
  Code,
  Sliders,
  GraduationCap,
  FileText,
  Trophy,
  Briefcase,
  Award,
  Star,
  Sparkles,
  Layers,
  Heart
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

interface FresherDocumentViewProps {
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
  forceLayoutMode?: 'auto' | '2-column' | '1-column';
}

function getSectionIcon(titleOrType: string) {
  const t = titleOrType.toLowerCase();
  if (t.includes('skill')) return <Code size={11} />;
  if (t.includes('tool')) return <Sliders size={11} />;
  if (t.includes('education')) return <GraduationCap size={11} />;
  if (t.includes('course')) return <FileText size={11} />;
  if (t.includes('achievement')) return <Trophy size={11} />;
  if (t.includes('project')) return <Briefcase size={11} />;
  if (t.includes('certif')) return <Award size={11} />;
  if (t.includes('strength')) return <Star size={11} />;
  if (t.includes('lang')) return <Globe size={11} />;
  if (t.includes('interest')) return <Heart size={11} />;
  if (t.includes('experi')) return <Briefcase size={11} />;
  return <Layers size={11} />;
}

function SectionBadgeTitle({ title, icon, color }: { title: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
      <div
        style={{ backgroundColor: color || '#000000' }}
        className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
      >
        {icon}
      </div>
      <h2
        style={{ color: color || '#000000' }}
        className="text-xs font-black tracking-wider uppercase"
      >
        {title}
      </h2>
    </div>
  );
}

export default function FresherDocumentView({
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
  forceLayoutMode = 'auto',
}: FresherDocumentViewProps) {
  // Determine if content is large
  const projBullets = displayProjects.reduce((acc, p) => acc + (p.bullets?.length || 0), 0);
  const expBullets = displayExperiences.reduce((acc, e) => acc + (e.bullets?.length || 0), 0);
  const totalBullets = projBullets + expBullets;
  const isContentLarge =
    displayProjects.length >= 3 ||
    displayExperiences.length + displayProjects.length >= 4 ||
    totalBullets >= 6 ||
    (displaySkills && displaySkills.length > 200) ||
    customSections.length >= 4;

  const isOneColumn = forceLayoutMode === '1-column' || (forceLayoutMode !== '2-column' && isContentLarge);

  // Categorize sections into Left Column vs Right Column for 2-column mode
  const leftSectionIds = new Set(['skills', 'sec_tools_tech', 'education', 'sec_courses', 'achievements']);

  const isLeftSec = (sec: SectionNavItem) => {
    if (leftSectionIds.has(sec.id)) return true;
    const t = (sec.type + ' ' + sec.title).toLowerCase();
    if (sec.type === 'skills' || sec.type === 'education' || sec.type === 'achievements') return true;
    if (
      t.includes('tool') ||
      t.includes('course') ||
      t.includes('education') ||
      t.includes('skill') ||
      t.includes('achievement')
    ) {
      return true;
    }
    return false;
  };

  const visibleSections = sections.filter((s) => s.visible && s.type !== 'personal' && s.type !== 'summary' && s.type !== 'styling');

  // Declaration custom section if any
  const decCustom = customSections.find((c) => c.title.toLowerCase().includes('declaration'));
  const declarationText = decCustom?.items[0]?.title || decCustom?.items[0]?.description || 'I hereby declare that the above information is true to the best of my knowledge.';

  const leftSections = visibleSections.filter(isLeftSec);
  const rightSections = visibleSections.filter((s) => !isLeftSec(s));

  const renderSectionItem = (sec: SectionNavItem) => {
    if (sec.type === 'skills' && displaySkills) {
      const lines = displaySkills.split('\n').filter((l) => l.trim());
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-5 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id
              ? 'ring-2 ring-blue-500/50 bg-blue-50/20'
              : aiHighlightedSection === 'skills'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30'
              : 'hover:bg-slate-50/60'
          }`}
        >
          <SectionBadgeTitle title={sec.title} icon={getSectionIcon(sec.title)} color={primaryColor} />
          <div className="space-y-2 mt-2">
            {lines.map((line, idx) => {
              const parts = line.split(':');
              if (parts.length > 1) {
                return (
                  <div key={idx}>
                    <p className="font-bold text-xs text-slate-900">{parts[0].trim()}</p>
                    <p className="text-xs text-slate-700 mt-0.5">{parts.slice(1).join(':').trim()}</p>
                  </div>
                );
              }
              return (
                <p key={idx} className="text-xs text-slate-700">{line}</p>
              );
            })}
          </div>
        </div>
      );
    }

    if (sec.type === 'education' && displayEducation.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-4 cursor-pointer transition-all rounded p-1 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/50'
          }`}
        >
          {/* Clean ATS Section Heading without icon or badges */}
          <div className="mb-2 pb-0.5 border-b border-slate-900">
            <h2
              style={{ color: primaryColor || '#000000' }}
              className="font-bold text-xs uppercase tracking-wider text-slate-900"
            >
              {sec.title || 'EDUCATION'}
            </h2>
          </div>

          <div className="space-y-2 mt-1.5">
            {displayEducation.map((edu) => {
              const startYear = edu.startYear || (edu.period ? edu.period.split(/[-–—]/)[0]?.trim() : '');
              const endYear = edu.endYear || (edu.period ? edu.period.split(/[-–—]/)[1]?.trim() : '');
              const periodText = (startYear && endYear) ? `${startYear} – ${endYear}` : (edu.period || startYear || endYear || '');

              const rawGpa = (edu.gpa || '').trim();
              const formattedGpa = rawGpa
                ? (/^(gpa|cgpa|grade|marks)/i.test(rawGpa) || rawGpa.includes('%')
                    ? rawGpa
                    : `CGPA: ${rawGpa}`)
                : null;

              const courseworkClean = (edu.coursework || edu.highlights || '').trim().replace(/^relevant coursework:\s*|^courses:\s*/i, '');

              return (
                <div key={edu.id} className="text-xs space-y-0.5">
                  {/* Row 1: Bold Institution (Left) + Right-aligned Dates */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-slate-900 leading-snug">{edu.institution}</span>
                    {periodText && (
                      <span className="font-mono text-slate-700 text-[11px] shrink-0 text-right">
                        {periodText}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Degree directly below Institution (Left) + Right-aligned GPA */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-slate-800 leading-snug">{edu.degree}</span>
                    {formattedGpa && (
                      <span className="text-slate-800 text-[11px] font-mono shrink-0 text-right">
                        {formattedGpa}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Compact Courses bullet (only when provided) */}
                  {courseworkClean && (
                    <ul className="list-disc list-outside ml-3.5 space-y-0 text-[11px] text-slate-700 pt-0.5">
                      <li className="leading-snug">
                        <span className="font-semibold text-slate-800">Courses: </span>
                        {courseworkClean}
                      </li>
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (sec.type === 'achievements' && displayAchievements.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-5 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <SectionBadgeTitle title={sec.title} icon={getSectionIcon(sec.title)} color={primaryColor} />
          <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700 mt-2">
            {displayAchievements.map((a) => (
              <li key={a.id}>
                <span className="font-bold text-slate-900">{a.title}</span>
                {a.description ? ` — ${a.description}` : ''}
                {a.date ? <span className="font-mono text-slate-500 text-[11px]"> ({a.date})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (sec.type === 'projects' && displayProjects.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-5 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id
              ? 'ring-2 ring-blue-500/50 bg-blue-50/20'
              : aiHighlightedSection === 'projects'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30'
              : 'hover:bg-slate-50/60'
          }`}
        >
          <SectionBadgeTitle title={sec.title} icon={getSectionIcon(sec.title)} color={primaryColor} />
          <div className="space-y-3 mt-2">
            {displayProjects.map((proj) => {
              const techList = (proj.techStack || []).filter(
                (t) => t && t.trim() && t.toLowerCase() !== 'unknown'
              );
              return (
                <div key={proj.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">{proj.title}</h3>
                    {proj.period && (
                      <span className="text-[11px] font-medium text-slate-600 font-mono shrink-0">
                        {proj.period}
                      </span>
                    )}
                  </div>
                  {techList.length > 0 && (
                    <p className="text-xs font-semibold text-slate-800">
                      {techList.join(', ')}
                    </p>
                  )}
                  {proj.description && <p className="text-xs text-slate-700">{proj.description}</p>}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700 leading-relaxed">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (sec.type === 'certificates' && displayCertificates.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-5 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <SectionBadgeTitle title={sec.title} icon={getSectionIcon(sec.title)} color={primaryColor} />
          <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700 mt-2">
            {displayCertificates.map((c) => (
              <li key={c.id}>
                <span className="font-bold text-slate-900">{c.title}</span>
                {c.issuer ? ` – ${c.issuer}` : ''}
                {c.date ? <span className="font-mono text-slate-500 text-[11px]"> ({c.date})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (sec.type === 'experience' && displayExperiences.length > 0) {
      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-5 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <SectionBadgeTitle title={sec.title} icon={getSectionIcon(sec.title)} color={primaryColor} />
          <div className="space-y-3 mt-2">
            {displayExperiences.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">{exp.title}</h3>
                  {exp.period && <span className="text-[11px] text-slate-500 font-mono">{exp.period}</span>}
                </div>
                <p className="text-xs font-semibold text-slate-800">{exp.company}</p>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700 leading-relaxed">
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

    if (sec.type === 'custom') {
      const customData = customSections.find((c) => c.id === sec.id);
      if (!customData || customData.items.length === 0) return null;
      if (customData.title.toLowerCase().includes('declaration')) return null;

      return (
        <div
          key={sec.id}
          id={`doc-sec-${sec.id}`}
          onClick={() => handleSelectSection(sec.id)}
          className={`mb-5 cursor-pointer transition-all rounded-lg p-2 ${
            activeSection === sec.id ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
          }`}
        >
          <SectionBadgeTitle title={customData.title} icon={getSectionIcon(customData.title)} color={primaryColor} />
          <div className="space-y-2 mt-2 text-xs text-slate-700">
            {customData.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    {item.subtitle && <p className="text-slate-800 font-semibold">{item.subtitle}</p>}
                  </div>
                  {item.date && <span className="text-[11px] text-slate-500 font-mono">{item.date}</span>}
                </div>
                {item.description && <p className="text-slate-700">{item.description}</p>}
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
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
    <div className="w-full space-y-4">
      {/* ── 1. HEADER (Two-column top header matching reference image) ───────────────────── */}
      <div
        id="doc-sec-personal"
        onClick={() => handleSelectSection('personal')}
        className={`flex flex-row justify-between pb-4 cursor-pointer transition-all rounded-lg p-2 ${
          activeSection === 'personal' ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'hover:bg-slate-50/60'
        }`}
      >
        {/* Left Side: Name, Job Title/Degree, Summary */}
        <div className="w-[68%] pr-4 space-y-1">
          <h1
            style={{ color: primaryColor }}
            className="text-2xl sm:text-3xl font-black tracking-tight uppercase"
          >
            {displayPersonalInfo.fullName}
          </h1>
          {displayPersonalInfo.jobTitle && (
            <p className="text-xs font-extrabold tracking-wider uppercase text-slate-900 mt-1">
              {displayPersonalInfo.jobTitle}
            </p>
          )}
          {displayPersonalInfo.summary && (
            <p className="text-xs text-slate-700 leading-relaxed mt-2 font-sans">
              {displayPersonalInfo.summary}
            </p>
          )}
        </div>

        {/* Right Side: Vertical divider + Contact items stacked */}
        <div className="w-[32%] pl-4 border-l border-slate-300 space-y-1.5 text-xs text-slate-700 font-sans">
          {displayPersonalInfo.phone && (
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 text-[9px]"
              >
                <Phone size={9} />
              </div>
              <span className="truncate">{displayPersonalInfo.phone}</span>
            </div>
          )}
          {displayPersonalInfo.email && (
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 text-[9px]"
              >
                <Mail size={9} />
              </div>
              <span className="truncate">{displayPersonalInfo.email}</span>
            </div>
          )}
          {displayPersonalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 text-[9px]"
              >
                <Linkedin size={9} />
              </div>
              <span className="truncate">{displayPersonalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {displayPersonalInfo.github && (
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 text-[9px]"
              >
                <Github size={9} />
              </div>
              <span className="truncate">
                {displayPersonalInfo.github.replace(/^https?:\/\//, '').replace(/.*github\.com\//, 'github.com/')}
              </span>
            </div>
          )}
          {displayPersonalInfo.location && (
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 text-[9px]"
              >
                <MapPin size={9} />
              </div>
              <span className="truncate">{displayPersonalInfo.location}</span>
            </div>
          )}
          {displayPersonalInfo.website && (
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 text-[9px]"
              >
                <Globe size={9} />
              </div>
              <span className="truncate">{displayPersonalInfo.website.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Divider Line below Header */}
      <div style={{ borderColor: primaryColor }} className="border-b-2 my-3 w-full" />

      {/* ── 2. BODY SECTIONS ───────────────────────────────────────────────────────── */}
      {isOneColumn ? (
        /* Full-Width Stacked Layout (Best for large resumes matching screenshot) */
        <div className="w-full space-y-4">
          {visibleSections.map((sec) => renderSectionItem(sec))}
        </div>
      ) : (
        /* 2-Column Side-by-Side Layout (For compact resumes) */
        <div className="grid grid-cols-12 gap-5 relative">
          <div className="col-span-5 border-r border-slate-200 pr-4 space-y-4">
            {leftSections.map((sec) => renderSectionItem(sec))}
          </div>
          <div className="col-span-7 pl-2 space-y-4">
            {rightSections.map((sec) => renderSectionItem(sec))}
          </div>
        </div>
      )}

      {/* ── 3. DECLARATION FOOTER ──────────────────────────────────────────────────── */}
      <div className="pt-4 mt-6 border-t border-slate-300 text-center">
        <p className="italic text-xs text-slate-600 font-sans">
          {declarationText}
        </p>
      </div>
    </div>
  );
}
