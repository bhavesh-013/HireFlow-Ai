import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  Copy,
  ChevronDown,
  Briefcase,
  Layers,
  Code2,
  Cpu,
  Cloud,
  Check
} from 'lucide-react';

interface JobDescriptionInputProps {
  jobDescription: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasResume: boolean;
}

const SAMPLE_JDS = [
  {
    title: 'Senior Full Stack Software Engineer',
    company: 'TechFlow Global',
    icon: Code2,
    text: `Job Title: Senior Full Stack Software Engineer
Company: TechFlow Global
Experience: 4-6 years
Location: Remote / San Francisco, CA

About the Role:
We are seeking an experienced Senior Full Stack Engineer to architect, build, and scale our enterprise SaaS platform. You will collaborate with cross-functional teams to design mission-critical microservices, build responsive React frontends, and optimize high-throughput distributed database queries.

Key Responsibilities:
• Architect, develop, and deploy scalable web applications using React, TypeScript, Node.js, and PostgreSQL.
• Design and implement RESTful APIs and GraphQL services with high reliability and low latency.
• Containerize microservices using Docker and orchestrate deployments via Kubernetes and CI/CD pipelines.
• Collaborate with product managers, UI/UX designers, and QA engineers in an agile/scrum environment.
• Write comprehensive unit, integration, and end-to-end tests using Jest, React Testing Library, and Playwright.
• Optimize system architecture for performance, scalability, and AWS cloud cost efficiency.

Required Qualifications & Skills:
• 4+ years of professional full-stack development experience.
• Strong proficiency in TypeScript, JavaScript (ES6+), React, and Node.js.
• Hands-on expertise with PostgreSQL, Redis query caching, and relational database indexing.
• Proven experience with Docker, Kubernetes, and AWS (EC2, S3, RDS, Lambda).
• Demonstrated background with CI/CD automation (GitHub Actions or GitLab CI).
• Solid understanding of REST APIs, security best practices, and OAuth2 authentication.
• Bachelor's Degree in Computer Science, Software Engineering, or equivalent practical experience.

Preferred / Nice-to-Have:
• Experience with Next.js, Tailwind CSS, or GraphQL.
• Familiarity with FinTech domain, PCI-DSS compliance, or high-volume payment processing.
• AWS Certified Solutions Architect or Developer certification.`,
  },
  {
    title: 'Frontend Engineer (React / TypeScript)',
    company: 'Nexus Digital',
    icon: Layers,
    text: `Job Title: Frontend Engineer (React & TypeScript)
Company: Nexus Digital
Experience: 2-4 years

Responsibilities:
• Design and build intuitive, accessible, and high-performance user interfaces using React, Next.js, and TypeScript.
• Collaborate closely with product designers to implement pixel-perfect design systems using Tailwind CSS.
• Optimize client-side rendering, bundle size, and Core Web Vitals for desktop and mobile web experiences.
• Write automated frontend unit tests with Vitest/Jest and end-to-end browser tests using Cypress.
• Integrate backend REST and GraphQL endpoints with client state management (Zustand/Redux).

Required Skills:
• 2+ years experience building production single-page applications with React and TypeScript.
• Expertise in HTML5, CSS3, modern JavaScript, and Tailwind CSS.
• Experience with Git, Vite/Webpack, responsive web design, and REST APIs.
• Excellent verbal and written communication skills and commitment to code quality.`,
  },
  {
    title: 'Cloud & DevOps Engineer (AWS / K8s)',
    company: 'Apex Infrastructure',
    icon: Cloud,
    text: `Job Title: Cloud & DevOps Engineer
Company: Apex Infrastructure
Experience: 3-5 years

Role & Duties:
• Architect, automate, and maintain secure multi-region AWS cloud infrastructure using Terraform.
• Manage Kubernetes clusters, Helm charts, and containerized microservice deployments.
• Build automated CI/CD deployment pipelines using GitHub Actions and Jenkins.
• Implement observability, logging, and monitoring using Prometheus, Grafana, and Datadog.
• Ensure cloud security posture, IAM least-privilege policies, and SOC2 compliance.

Requirements:
• 3+ years of hands-on experience in AWS (EKS, VPC, IAM, S3, RDS, CloudWatch).
• Deep expertise in Docker containerization and Kubernetes orchestration.
• Strong scripting abilities in Python, Bash, or Go.
• Proven infrastructure as code (IaC) experience with Terraform.`,
  },
];

export default function JobDescriptionInput({
  jobDescription,
  onChange,
  onAnalyze,
  isAnalyzing,
  hasResume,
}: JobDescriptionInputProps) {
  const [showSamples, setShowSamples] = useState(false);
  const [copiedSample, setCopiedSample] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onChange(text);
      }
    };
    reader.readAsText(file);
  };

  const handleApplySample = (text: string, title: string) => {
    onChange(text);
    setCopiedSample(title);
    setShowSamples(false);
    setTimeout(() => setCopiedSample(null), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B192C] tracking-tight">
              Target Job Description (JD)
            </h3>
            <p className="text-xs text-[#475569]">
              Paste the role requirements to trigger live ATS semantic extraction & optimization.
            </p>
          </div>
        </div>

        {/* Quick Sample Selector & File Upload */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-[#475569] hover:text-[#0B192C] border border-slate-200 transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-[#2563EB]" />
              <span>Load Tech Sample JD</span>
              <ChevronDown size={13} className={`transition-transform ${showSamples ? 'rotate-180' : ''}`} />
            </button>

            {showSamples && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 space-y-1">
                <p className="text-[11px] font-semibold text-[#475569] px-2.5 py-1 uppercase tracking-wider">
                  Select Role Template
                </p>
                {SAMPLE_JDS.map((sample, idx) => {
                  const Icon = sample.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySample(sample.text, sample.title)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0B192C] truncate">
                          {sample.title}
                        </p>
                        <p className="text-[10px] text-[#475569]">{sample.company}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-[#475569] hover:text-[#0B192C] border border-slate-200 transition-all cursor-pointer">
            <Upload size={13} className="text-[#475569]" />
            <span>Upload .txt/.md</span>
            <input type="file" accept=".txt,.md,.text" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste full job description text here (e.g. Job title, Requirements, Responsibilities, Tech Stack, Qualifications)..."
          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-[#0B192C] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-mono leading-relaxed resize-y custom-scrollbar"
        />

        {jobDescription && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[11px] text-[#475569] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {jobDescription.length} characters • ~{jobDescription.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-[#475569] hover:text-red-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls & Primary Action Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-[#475569]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Real-time ATS parsing: Semantic Keywords • Action Verbs • Project Alignment</span>
        </div>

        <button
          type="button"
          disabled={isAnalyzing || !jobDescription.trim() || !hasResume}
          onClick={onAnalyze}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer ${
            isAnalyzing || !jobDescription.trim() || !hasResume
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Job & Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze Job & Optimize Resume</span>
            </>
          )}
        </button>
      </div>

      {!hasResume && (
        <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
          Please upload or select a candidate resume first before running the job analysis.
        </p>
      )}
    </div>
  );
}
