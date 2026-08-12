import React from 'react';
import type { TemplateLayoutConfig } from '../../services/templateConfig.service';
import type { PreviewResumeData } from './previewData';
import { FRESHER_ORDER, EXPERIENCED_ORDER } from '../../services/section.reorder';

export type TemplateVariant = 'ats-classic' | 'modern-professional' | 'technical' | 'minimal' | 'executive';

interface Props {
  layout: TemplateLayoutConfig;
  variant: TemplateVariant;
  data: PreviewResumeData;
}

type SectionKey = 'summary' | 'education' | 'skills' | 'projects' | 'experience' | 'achievements' | 'certificates';

function sectionOrderFor(variant: TemplateVariant, resumeType: 'fresher' | 'experienced'): SectionKey[] {
  if (variant === 'technical') {
    // Skills + projects always lead, per the Technical template's brief.
    return ['summary', 'skills', 'projects', 'experience', 'achievements', 'education', 'certificates'];
  }
  if (variant === 'executive') {
    // Experience-forward, education de-emphasized.
    return ['summary', 'experience', 'achievements', 'skills', 'projects', 'education', 'certificates'];
  }
  const base = resumeType === 'fresher' ? FRESHER_ORDER : EXPERIENCED_ORDER;
  return base.filter((k): k is SectionKey =>
    k === 'summary' || k === 'education' || k === 'skills' || k === 'projects' || k === 'experience' || k === 'achievements' || k === 'certificates'
  );
}

function sectionTitleClass(layout: TemplateLayoutConfig) {
  const transform =
    layout.sectionTitleTransform === 'uppercase' ? 'uppercase' :
    layout.sectionTitleTransform === 'capitalize' ? 'capitalize' : 'normal-case';
  const weight =
    layout.sectionTitleFont === 'extrabold' ? 'font-extrabold' :
    layout.sectionTitleFont === 'medium' ? 'font-medium' : 'font-bold';
  return `${transform} ${weight}`;
}

function SectionTitle({ layout, children }: { layout: TemplateLayoutConfig; children: React.ReactNode }) {
  const base = `text-[10px] tracking-widest mb-1.5 ${sectionTitleClass(layout)}`;
  if (layout.sectionBorder === 'accent-left') {
    return (
      <h3
        className={`${base} pl-2 border-l-[3px]`}
        style={{ color: layout.primaryColor, borderColor: layout.accentColor }}
      >
        {children}
      </h3>
    );
  }
  if (layout.sectionBorder === 'double-line') {
    return (
      <h3
        className={`${base} pb-1 border-b-4 border-double`}
        style={{ color: layout.primaryColor, borderColor: layout.primaryColor }}
      >
        {children}
      </h3>
    );
  }
  if (layout.sectionBorder === 'bottom-line') {
    return (
      <h3 className={`${base} pb-1 border-b`} style={{ color: layout.primaryColor, borderColor: '#E2E8F0' }}>
        {children}
      </h3>
    );
  }
  return (
    <h3 className={base} style={{ color: layout.primaryColor }}>
      {children}
    </h3>
  );
}

/**
 * The real, structural resume renderer shared by every template
 * component. Individual template files (ATSClassicTemplate.tsx, etc.)
 * are thin wrappers that call this with their own layout config — the
 * exact same layout config that also drives the live Resume Editor
 * preview and PDF/DOCX export, so what you see here is what you get.
 */
export default function ResumeTemplateRenderer({ layout, variant, data }: Props) {
  const order = sectionOrderFor(variant, data.resumeType);
  const isTechnical = variant === 'technical';
  const isExecutive = variant === 'executive';
  const isMinimal = variant === 'minimal';
  const headerCentered = layout.headerAlignment === 'center';

  const sectionGap = isMinimal ? 'mb-3.5' : 'mb-3';

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!data.summary) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>Summary</SectionTitle>
            <p
              className={`text-[9.5px] leading-relaxed ${isExecutive ? 'italic' : ''}`}
              style={{ color: layout.textColor }}
            >
              {data.summary}
            </p>
          </div>
        );

      case 'education':
        if (!data.education.length) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>Education</SectionTitle>
            <div className="space-y-1">
              {data.education.map((e, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9.5px] font-bold" style={{ color: layout.textColor }}>{e.degree}</p>
                    <p className="text-[9px]" style={{ color: layout.textColor }}>{e.institution}</p>
                  </div>
                  <span className="text-[8.5px] shrink-0" style={{ color: layout.accentColor }}>{e.period}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!data.skills.length) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>Skills</SectionTitle>
            {isTechnical ? (
              <div className="flex flex-wrap gap-1">
                {data.skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[8.5px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${layout.accentColor}1A`, color: layout.accentColor }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[9.5px] leading-relaxed" style={{ color: layout.textColor }}>
                {data.skills.join(' • ')}
              </p>
            )}
          </div>
        );

      case 'projects':
        if (!data.projects.length) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>Projects</SectionTitle>
            <div className="space-y-1.5">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <p className="text-[9.5px] font-bold" style={{ color: layout.textColor }}>{p.title}</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {p.bullets.slice(0, 2).map((b, bi) => (
                      <li key={bi} className="text-[8.5px] leading-snug" style={{ color: layout.textColor }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        if (!data.experience.length) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>{data.resumeType === 'fresher' ? 'Internships / Experience' : 'Experience'}</SectionTitle>
            <div className="space-y-1.5">
              {data.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[9.5px] font-bold" style={{ color: layout.textColor }}>{e.title}</p>
                      <p className="text-[9px]" style={{ color: layout.accentColor }}>{e.company}</p>
                    </div>
                    <span className="text-[8.5px] shrink-0" style={{ color: layout.accentColor }}>{e.period}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                    {e.bullets.slice(0, 2).map((b, bi) => (
                      <li key={bi} className="text-[8.5px] leading-snug" style={{ color: layout.textColor }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!data.achievements?.length) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>Achievements</SectionTitle>
            <ul className="list-disc list-inside space-y-0.5">
              {data.achievements.map((a, i) => (
                <li key={i} className="text-[8.5px] leading-snug" style={{ color: layout.textColor }}>
                  <span className="font-bold">{a.title}</span>
                  {a.description ? ` — ${a.description}` : ''}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'certificates':
        if (!data.certificates?.length) return null;
        return (
          <div key={key} className={sectionGap}>
            <SectionTitle layout={layout}>Certifications</SectionTitle>
            <div className="space-y-1">
              {data.certificates.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-[9px] font-semibold" style={{ color: layout.textColor }}>{c.title} — {c.issuer}</p>
                  <span className="text-[8.5px] shrink-0" style={{ color: layout.accentColor }}>{c.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white w-full h-full p-4 overflow-hidden"
      style={{ fontFamily: layout.fontFamily }}
    >
      {/* Header */}
      <div className={`pb-2 mb-2.5 border-b ${headerCentered ? 'text-center' : 'text-left'}`} style={{ borderColor: '#E2E8F0' }}>
        <h1
          className={`font-black tracking-tight ${isExecutive ? 'text-[15px]' : 'text-[13px]'}`}
          style={{ color: layout.primaryColor }}
        >
          {data.fullName}
        </h1>
        <p
          className={`text-[9.5px] font-semibold mt-0.5 ${isExecutive ? 'uppercase tracking-wider' : ''}`}
          style={{ color: layout.accentColor }}
        >
          {data.jobTitle}
        </p>
        <div
          className={`flex flex-wrap gap-x-2 text-[8px] mt-1 ${headerCentered ? 'justify-center' : ''}`}
          style={{ color: layout.textColor }}
        >
          <span>{data.email}</span>
          <span>{data.phone}</span>
          <span>{data.location}</span>
        </div>
        {(data.linkedin || data.github || data.website) && (
          <div
            className={`flex flex-wrap gap-x-2 text-[8px] mt-0.5 ${headerCentered ? 'justify-center' : ''}`}
            style={{ color: layout.accentColor }}
          >
            {data.linkedin && <span>{data.linkedin.replace(/^https?:\/\//, '')}</span>}
            {data.github && <span>{data.github.replace(/^https?:\/\//, '')}</span>}
            {data.website && <span>{data.website.replace(/^https?:\/\//, '')}</span>}
          </div>
        )}
      </div>

      {order.map(renderSection)}
    </div>
  );
}
