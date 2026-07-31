import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Save,
  Download,
  Eye,
  Undo,
  Redo,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Globe,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { mockUser } from '../data/mockData';
import { ParsedResumeData, ExperienceItem, EducationItem, ProjectItem, CertificateItem } from '../types';

export default function ResumeEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Try to load state from router location state or localStorage
  const importedData: ParsedResumeData | null = location.state?.importedResume || (() => {
    try {
      const stored = localStorage.getItem('hireflow_current_resume');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [activeSection, setActiveSection] = useState('personal');
  const [isSaved, setIsSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(
    importedData?.importSource
      ? `Resume auto-filled from ${importedData.importSource.toUpperCase()} import! All sections parsed and ready for editing.`
      : null
  );

  const [docTitle, setDocTitle] = useState(
    importedData?.title || 'Senior Frontend Engineer.pdf'
  );
  const [targetRole, setTargetRole] = useState(
    importedData?.targetRole || 'Senior Frontend Engineer'
  );

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: importedData?.personalInfo?.fullName || mockUser.name,
    jobTitle: importedData?.personalInfo?.jobTitle || mockUser.role,
    email: importedData?.personalInfo?.email || mockUser.email,
    phone: importedData?.personalInfo?.phone || mockUser.phone,
    location: importedData?.personalInfo?.location || mockUser.location,
    website: importedData?.personalInfo?.website || mockUser.website,
    github: importedData?.personalInfo?.github || mockUser.github,
    linkedin: importedData?.personalInfo?.linkedin || mockUser.linkedin,
    summary:
      importedData?.personalInfo?.summary ||
      'Product-focused Senior Frontend Engineer with 6+ years of experience architecting high-performance React applications, design systems, and modern web architectures for scale.',
  });

  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    importedData?.experiences && importedData.experiences.length > 0
      ? importedData.experiences
      : [
          {
            id: 'exp1',
            title: 'Senior Frontend Engineer',
            company: 'Vercel / Tech Corp',
            period: '2023 - Present',
            location: 'San Francisco, CA',
            bullets: [
              'Architected high-throughput React SPA utilizing Zustand state management, lowering initial load latency by 38% for 120k monthly active users.',
              'Engineered reusable design system component library adopted by 14 cross-functional engineering pods.',
              'Mentored 5 junior frontend developers and established automated Web Vitals performance benchmarks in CI/CD.',
            ],
          },
          {
            id: 'exp2',
            title: 'Frontend Developer',
            company: 'Scale AI',
            period: '2020 - 2023',
            location: 'Remote',
            bullets: [
              'Built real-time data annotation canvas using TypeScript and HTML5 Canvas API handling 50k+ nodes without frame drops.',
              'Optimized GraphQL query caching, resulting in a 250ms speedup in search index results.',
            ],
          },
        ]
  );

  const [education, setEducation] = useState<EducationItem[]>(
    importedData?.education && importedData.education.length > 0
      ? importedData.education
      : [
          {
            id: 'edu1',
            degree: 'B.S. in Computer Science & Engineering',
            institution: 'University of California, Berkeley',
            period: '2016 - 2020',
            location: 'Berkeley, CA',
            gpa: '3.88 / 4.00',
            highlights: 'Dean’s Honor List, Specialization in Web Architecture & Distributed Systems',
          },
        ]
  );

  const [skills, setSkills] = useState<string>(
    importedData?.skills ||
      'React 18, TypeScript, Next.js, Tailwind CSS, Redux Toolkit, Webpack, Vite, Web Vitals, GraphQL, Jest, Playwright, Node.js, Git'
  );

  const [projects, setProjects] = useState<ProjectItem[]>(
    importedData?.projects && importedData.projects.length > 0
      ? importedData.projects
      : [
          {
            id: 'proj1',
            title: 'HireFlow AI Workspace',
            description: 'AI-assisted resume builder and ATS analyzer platform for tech candidates.',
            techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express'],
            link: 'https://github.com/alexkumar-dev/hireflow-ai',
            stars: 840,
            bullets: [
              'Implemented custom document parsing pipeline converting PDF/DOCX into structured ATS JSON objects.',
              'Designed real-time keyword matching algorithm scoring candidate alignment against target job specs.',
            ],
          },
        ]
  );

  const [certificates, setCertificates] = useState<CertificateItem[]>(
    importedData?.certificates && importedData.certificates.length > 0
      ? importedData.certificates
      : [
          {
            id: 'cert1',
            title: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2024',
            link: 'https://aws.amazon.com/verification',
          },
        ]
  );

  // Save changes automatically to local storage
  useEffect(() => {
    const currentResume: ParsedResumeData = {
      title: docTitle,
      targetRole,
      personalInfo,
      experiences,
      education,
      skills,
      projects,
      certificates,
    };
    try {
      localStorage.setItem('hireflow_current_resume', JSON.stringify(currentResume));
    } catch {
      // ignore
    }
  }, [docTitle, targetRole, personalInfo, experiences, education, skills, projects, certificates]);

  const sectionsList = [
    { id: 'personal', label: 'Personal & Contact', icon: User },
    { id: 'summary', label: 'Professional Summary', icon: Sparkles },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Tech Stack', icon: Code },
    { id: 'projects', label: 'Projects & Highlights', icon: Award },
    { id: 'certificates', label: 'Certificates & Links', icon: Globe },
  ];

  // Bullet handlers
  const handleUpdateBullet = (expIndex: number, bulletIndex: number, val: string) => {
    setIsSaved(false);
    const updated = [...experiences];
    updated[expIndex].bullets[bulletIndex] = val;
    setExperiences(updated);
    setTimeout(() => setIsSaved(true), 800);
  };

  const handleAddBullet = (expIndex: number) => {
    setIsSaved(false);
    const updated = [...experiences];
    updated[expIndex].bullets.push('Spearheaded development of scalable user workflows.');
    setExperiences(updated);
    setTimeout(() => setIsSaved(true), 800);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    setIsSaved(false);
    const updated = [...experiences];
    updated[expIndex].bullets.splice(bulletIndex, 1);
    setExperiences(updated);
    setTimeout(() => setIsSaved(true), 800);
  };

  // Add position handler
  const handleAddExperience = () => {
    setIsSaved(false);
    const newExp: ExperienceItem = {
      id: `exp_${Date.now()}`,
      title: 'Senior Engineer',
      company: 'Tech Company',
      period: '2021 - 2023',
      location: 'Remote',
      bullets: ['Built scalable microservices and user interfaces with React and Node.js.'],
    };
    setExperiences([...experiences, newExp]);
    setTimeout(() => setIsSaved(true), 800);
  };

  const handleRemoveExperience = (id: string) => {
    setIsSaved(false);
    setExperiences(experiences.filter((exp) => exp.id !== id));
    setTimeout(() => setIsSaved(true), 800);
  };

  // Education handlers
  const handleAddEducation = () => {
    setIsSaved(false);
    const newEdu: EducationItem = {
      id: `edu_${Date.now()}`,
      degree: 'B.S. Computer Science',
      institution: 'State University',
      period: '2016 - 2020',
      location: 'City, State',
    };
    setEducation([...education, newEdu]);
    setTimeout(() => setIsSaved(true), 800);
  };

  const handleRemoveEducation = (id: string) => {
    setIsSaved(false);
    setEducation(education.filter((e) => e.id !== id));
    setTimeout(() => setIsSaved(true), 800);
  };

  // Project handlers
  const handleAddProject = () => {
    setIsSaved(false);
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: 'Open Source Tool',
      description: 'High performance utility library built for developers.',
      techStack: ['TypeScript', 'React'],
      bullets: ['Built modular core architecture supporting high concurrency.'],
    };
    setProjects([...projects, newProj]);
    setTimeout(() => setIsSaved(true), 800);
  };

  const handleRemoveProject = (id: string) => {
    setIsSaved(false);
    setProjects(projects.filter((p) => p.id !== id));
    setTimeout(() => setIsSaved(true), 800);
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    setIsSaved(false);
    const newCert: CertificateItem = {
      id: `cert_${Date.now()}`,
      title: 'Professional Cloud Engineer',
      issuer: 'Google Cloud Platform',
      date: '2024',
    };
    setCertificates([...certificates, newCert]);
    setTimeout(() => setIsSaved(true), 800);
  };

  const handleRemoveCertificate = (id: string) => {
    setIsSaved(false);
    setCertificates(certificates.filter((c) => c.id !== id));
    setTimeout(() => setIsSaved(true), 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Notice if data was imported */}
      {importNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 font-medium shadow-2xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>{importNotice}</span>
          </div>
          <button
            onClick={() => setImportNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Navigation Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/builder')}
            className="p-2 text-slate-500 hover:text-[#0B192C] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Back to Create Resume Hub"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs">
            ATS READY
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="font-black text-base text-[#0B192C] leading-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isSaved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isSaved ? 'All changes saved to cloud & local state' : 'Saving changes...'}</span>
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/app/builder')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Create New</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showPreview ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye size={15} />
            <span>{showPreview ? 'Exit Preview' : 'Full Preview'}</span>
          </button>

          <button
            onClick={() => alert(`Exporting "${docTitle}" in high-resolution ATS compliant PDF format...`)}
            className="bg-[#0B192C] hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Sections List */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            RESUME SECTIONS
          </p>
          {sectionsList.map((sec) => {
            const IconComponent = sec.icon;
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B192C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent size={16} className={isCurrent ? 'text-blue-300' : 'text-slate-400'} />
                  <span>{sec.label}</span>
                </div>
                <ChevronRight size={14} className={isCurrent ? 'text-white' : 'text-slate-300'} />
              </button>
            );
          })}
        </div>

        {/* Center Pane: Form Editors */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section 1: Personal Info */}
          {activeSection === 'personal' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                <span>Personal & Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0B192C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={personalInfo.jobTitle}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, jobTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0B192C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B192C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone / Location
                  </label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B192C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={personalInfo.github || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B192C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="text"
                    value={personalInfo.linkedin || personalInfo.website || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B192C]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Summary */}
          {activeSection === 'summary' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  <span>Professional Summary</span>
                </h3>
                <button
                  onClick={() =>
                    setPersonalInfo({
                      ...personalInfo,
                      summary:
                        'Results-driven Senior Frontend Engineer with 6+ years specializing in React, TypeScript, and micro-frontends, delivering 99.9% uptime UI systems for high-growth tech platforms.',
                    })
                  }
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Enhance with AI</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-[#0B192C] focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {/* Section 3: Work Experience */}
          {activeSection === 'experience' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-600" />
                  <span>Work Experience</span>
                </h3>
                <button
                  onClick={handleAddExperience}
                  className="bg-[#0B192C] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Position</span>
                </button>
              </div>

              {experiences.map((exp, expIdx) => (
                <div key={exp.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[expIdx].title = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B192C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[expIdx].company = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B192C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Period</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[expIdx].period = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                      />
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Location</label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[expIdx].location = e.target.value;
                            setExperiences(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="ml-2 p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Delete Position"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Bullet accomplishments */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Bullet Accomplishments (Metrics & Tech Stack)
                    </label>
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-[#0B192C] focus:outline-none"
                        />
                        <button
                          onClick={() => handleRemoveBullet(expIdx, bIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer mt-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddBullet(expIdx)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Achievement Bullet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Education */}
          {activeSection === 'education' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
                  <GraduationCap size={18} className="text-blue-600" />
                  <span>Education</span>
                </h3>
                <button
                  onClick={handleAddEducation}
                  className="bg-[#0B192C] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Education</span>
                </button>
              </div>

              {education.map((edu, eduIdx) => (
                <div key={edu.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[eduIdx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B192C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[eduIdx].institution = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B192C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Period</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[eduIdx].period = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                      />
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">GPA / Honors</label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[eduIdx].gpa = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="e.g. 3.9 GPA"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="ml-2 p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 5: Skills */}
          {activeSection === 'skills' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
                <Code size={18} className="text-blue-600" />
                <span>Skills & Tech Stack</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Comma Separated Technical Keywords
                </label>
                <textarea
                  rows={4}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#0B192C] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 6: Projects */}
          {activeSection === 'projects' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
                  <Award size={18} className="text-blue-600" />
                  <span>Projects & Highlights</span>
                </h3>
                <button
                  onClick={handleAddProject}
                  className="bg-[#0B192C] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.map((proj, pIdx) => (
                <div key={proj.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[pIdx].title = e.target.value;
                        setProjects(updated);
                      }}
                      className="font-bold text-sm text-[#0B192C] bg-white border border-slate-200 rounded-lg px-2.5 py-1"
                    />
                    <button
                      onClick={() => handleRemoveProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                    <input
                      type="text"
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[pIdx].description = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Technologies (comma separated)
                    </label>
                    <input
                      type="text"
                      value={proj.techStack?.join(', ') || ''}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[pIdx].techStack = e.target.value.split(',').map((s) => s.trim());
                        setProjects(updated);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 7: Certificates */}
          {activeSection === 'certificates' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
                  <Globe size={18} className="text-blue-600" />
                  <span>Certificates & Links</span>
                </h3>
                <button
                  onClick={handleAddCertificate}
                  className="bg-[#0B192C] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Certificate</span>
                </button>
              </div>

              {certificates.map((cert, cIdx) => (
                <div key={cert.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => {
                        const updated = [...certificates];
                        updated[cIdx].title = e.target.value;
                        setCertificates(updated);
                      }}
                      placeholder="Certificate Name"
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0B192C]"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => {
                        const updated = [...certificates];
                        updated[cIdx].issuer = e.target.value;
                        setCertificates(updated);
                      }}
                      placeholder="Issuing Authority"
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0B192C]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => {
                          const updated = [...certificates];
                          updated[cIdx].date = e.target.value;
                          setCertificates(updated);
                        }}
                        placeholder="Date Issued"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0B192C] flex-1"
                      />
                      <button
                        onClick={() => handleRemoveCertificate(cert.id)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Document Paper Preview Sheet */}
          <div className="bg-white border border-slate-300 rounded-2xl p-8 shadow-lg space-y-6 max-w-2xl mx-auto min-h-[500px]">
            {/* Header section on document */}
            <div className="border-b border-slate-200 pb-4 text-center space-y-1">
              <h2 className="text-2xl font-black text-[#0B192C] tracking-tight">
                {personalInfo.fullName}
              </h2>
              <p className="text-xs font-bold text-blue-700 tracking-wider uppercase">
                {personalInfo.jobTitle}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {personalInfo.email} &middot; {personalInfo.location}
                {personalInfo.github && ` · ${personalInfo.github}`}
              </p>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div className="space-y-1">
                <h4 className="font-mono text-xs font-black text-[#0B192C] uppercase border-b border-slate-200 pb-1 tracking-wider">
                  PROFESSIONAL SUMMARY
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">{personalInfo.summary}</p>
              </div>
            )}

            {/* Work experience */}
            {experiences.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-black text-[#0B192C] uppercase border-b border-slate-200 pb-1 tracking-wider">
                  WORK EXPERIENCE
                </h4>
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-[#0B192C]">{exp.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">{exp.period}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600">{exp.company} &middot; {exp.location}</p>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pt-1">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs font-black text-[#0B192C] uppercase border-b border-slate-200 pb-1 tracking-wider">
                  EDUCATION
                </h4>
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs flex justify-between items-baseline">
                    <div>
                      <p className="font-bold text-[#0B192C]">{edu.degree}</p>
                      <p className="text-slate-600 text-[11px]">{edu.institution} {edu.gpa && `(${edu.gpa})`}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{edu.period}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs font-black text-[#0B192C] uppercase border-b border-slate-200 pb-1 tracking-wider">
                  PROJECTS & HIGHLIGHTS
                </h4>
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[#0B192C]">{proj.title}</span>
                      {proj.techStack && (
                        <span className="font-mono text-[10px] text-blue-700">
                          [{proj.techStack.join(', ')}]
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px]">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="space-y-1">
                <h4 className="font-mono text-xs font-black text-[#0B192C] uppercase border-b border-slate-200 pb-1 tracking-wider">
                  TECHNICAL SKILLS
                </h4>
                <p className="text-xs text-slate-700 pt-1 leading-relaxed">{skills}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: AI Recommendations */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B192C] border-b border-slate-100 pb-3">
              <Sparkles size={16} className="text-blue-600" />
              <span>Real-Time AI Recommendations</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl space-y-1.5">
                <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  +18% Impact
                </span>
                <p className="text-xs font-bold text-[#0B192C]">Quantify Bullet Accomplishments</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Add query response millisecond savings or percentage latency reductions to highlight engineering speed.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1.5">
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  ATS Ready
                </span>
                <p className="text-xs font-bold text-[#0B192C]">ATS Compatibility Score: 94%</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Header hierarchy and section labels strictly conform to Greenhouse, Workday & Lever algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
