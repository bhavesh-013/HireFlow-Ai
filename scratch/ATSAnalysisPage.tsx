import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles, ArrowRight,
  UploadCloud, FileText, X, Target, ArrowUpRight, Loader2, Clock, Layers, FileCode,
  CheckCircle, TrendingUp, Cpu, ArrowLeftRight, BookOpen, AlignLeft, UserCheck, Layout, BriefcaseBusiness
} from 'lucide-react';
import { parseResumeFile } from '../utils/fileParser';
import { parseResumeText } from '../utils/resumeTextParser';
import { ParsedResumeData, AtsAnalysisResponse, CategoryName, ResumeCategory } from '../types';
import { isAuthenticated } from '../lib/api';
import { rememberCurrentLocationForRedirect } from '../lib/authGate';
import LoginRequiredModal from '../components/app/LoginRequiredModal';
import JobDescriptionInput from '../components/ats/JobDescriptionInput';
import AnalysisProgressBar from '../components/ats/AnalysisProgressBar';
import { aiService } from '../services/ai.service';

export default function ATSAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const gateAiAction = (): boolean => {
    if (!isAuthenticated()) {
      setIsAuthGateOpen(true);
      return true;
    }
    return false;
  };

  const [analysisMode, setAnalysisMode] = useState<'general' | 'jd'>('general');
  const [isScanning, setIsScanning] = useState(false);
  const [currentResumeName, setCurrentResumeName] = useState('No resume selected');
  const [uploadedTime, setUploadedTime] = useState('Just now');
  const [jobDescription, setJobDescription] = useState('');

  const [isLiveOptimizing, setIsLiveOptimizing] = useState(false);
  const [liveProgress, setLiveProgress] = useState(0);
  const [liveStepText, setLiveStepText] = useState('Analyzing...');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [atsReport, setAtsReport] = useState<AtsAnalysisResponse | null>(null);
  const [atsScore, setAtsScore] = useState(0);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<ParsedResumeData | null>(null);
  const [hasResumeData, setHasResumeData] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#2563EB', '#10B981', '#0B192C', '#60A5FA'] });
    } catch {}
  };

  const runAnalysis = useCallback(async (resumeData: ParsedResumeData, jd?: string) => {
    setIsScanning(true);
    setAtsError(null);
    try {
      const report = await aiService.atsAnalyze(resumeData, jd);
      setAtsReport(report);
      setAtsScore(report.atsScore.score);
      return report;
    } catch (error) {
      console.error('ATS analysis failed:', error);
      setAtsError(error instanceof Error ? error.message : 'Unable to analyze resume.');
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    const locState = location.state as any;
    if (locState?.importedResume || locState?.parsedResume) {
      const resume = locState.importedResume || locState.parsedResume;
      setPreviewData(resume);
      if (resume.title) setCurrentResumeName(resume.title);
      setHasResumeData(true);
      runAnalysis(resume);
      return;
    }

    try {
      const stored = localStorage.getItem('hireflow_current_resume');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.personalInfo?.fullName || parsed.skills || parsed.experiences?.length)) {
          setPreviewData(parsed);
          if (parsed.title) setCurrentResumeName(parsed.title);
          setHasResumeData(true);
          runAnalysis(parsed);
          return;
        }
      }
    } catch {}
    
    // Check backend
    (async () => {
      try {
        if (!isAuthenticated()) return;
        const { getLatestResume } = await import('../services/supabaseService');
        const { fromBackendResume } = await import('../lib/resumeMapping');
        const doc = await getLatestResume();
        if (!doc) return;
        const mapped = fromBackendResume(doc);
        const resume: ParsedResumeData = {
          id: doc.id,
          title: mapped.docTitle,
          personalInfo: mapped.personalInfo,
          experiences: mapped.experiences,
          education: mapped.education,
          skills: mapped.skills,
          projects: mapped.projects,
          certificates: mapped.certificates,
        };
        setPreviewData(resume);
        if (resume.title) setCurrentResumeName(resume.title);
        setHasResumeData(true);
        runAnalysis(resume);
      } catch (err) {
        console.warn(err);
      }
    })();
  }, [runAnalysis, location]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const fileName = file.name;
    setCurrentResumeName(fileName);
    showToast(`Imported "${fileName}" — parsing resume...`);

    try {
      const cleanText = await parseResumeFile(file);
      if (!cleanText?.trim()) throw new Error('No readable resume text was found.');
      const parsed = parseResumeText(cleanText, fileName);
      setPreviewData(parsed);
      setHasResumeData(true);
      const jd = analysisMode === 'jd' ? jobDescription : undefined;
      await runAnalysis(parsed, jd);
      showToast(`ATS analysis complete.`);
    } catch (err) {
      setHasResumeData(false);
      showToast(err instanceof Error ? err.message : 'Unable to parse this resume.');
    }
  };

  const handleRunLiveJobOptimization = async (jdToUse?: string) => {
    if (gateAiAction()) return;
    const jd = (jdToUse !== undefined ? jdToUse : jobDescription).trim();
    if (!jd) {
      showToast('Please provide a target job description to match against.');
      return;
    }
    if (!previewData) return;

    setIsLiveOptimizing(true);
    setLiveStepText('Analyzing against JD...');
    const report = await runAnalysis(previewData, jd);
    setIsLiveOptimizing(false);
    if (report) {
      setAnalysisMode('jd');
      triggerConfetti();
      showToast(`JD Match Complete! Score: ${report.atsScore.score}/100`);
    }
  };

  const handleNavigateToResumeBuilder = () => {
    if (!previewData) return;
    const payload = {
      importedResume: { ...previewData },
      atsAnalysisData: { newScore: atsScore }
    };
    navigate('/app/editor', { state: payload });
  };

  const renderCategoryCards = () => {
    if (!atsReport) return null;
    const iconMap: Record<CategoryName, any> = {
      contactAndHeader: UserCheck, summary: AlignLeft, skillsAndKeywords: Cpu,
      experience: BriefcaseBusiness, projects: FileCode, education: BookOpen,
      certificationsAndAchievements: CheckCircle2, formattingAndAtsCompatibility: Layout
    };
    
    return Object.entries(atsReport.resumeAnalysis).map(([key, cat]) => {
      const data = cat as ResumeCategory;
      const Icon = iconMap[key as CategoryName] || CheckCircle;
      return (
        <div key={key} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={18} className="text-blue-600"/>
            <h3 className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
            <span className="ml-auto font-bold">{data.score}/100</span>
          </div>
          {data.problems.length > 0 ? (
            <ul className="text-xs text-red-600 list-disc pl-4 space-y-1 mt-2">
              {data.problems.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          ) : (
             <p className="text-xs text-emerald-600 mt-2">Looks good!</p>
          )}
          {data.recommendation && (
            <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded italic">{data.recommendation}</p>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300 pb-28 text-[#0B192C] font-sans">
      <LoginRequiredModal open={isAuthGateOpen} onClose={() => setIsAuthGateOpen(false)} onLogin={() => {}} onSignup={() => {}} message="" />
      <input type="file" ref={fileInputRef} onChange={(e) => {if(e.target.files?.[0]) handleFileUpload(e.target.files[0])}} className="hidden" accept=".pdf,.docx,.doc,.txt,.rtf" />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#0B192C] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="text-xs font-bold">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {!hasResumeData ? (
        <div className="max-w-4xl mx-auto py-10 space-y-8 text-center">
           <h1 className="text-3xl font-black">Upload Your Resume for ATS Analysis</h1>
           <div 
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]); }}
             onClick={() => fileInputRef.current?.click()}
             className={`bg-white border-2 border-dashed rounded-3xl p-14 cursor-pointer ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
           >
             <UploadCloud size={32} className="mx-auto mb-4 text-blue-600" />
             <h3 className="font-bold text-lg">Drag & drop your resume file here</h3>
           </div>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black">ATS Analysis & Optimization</h1>
                <p className="text-sm text-slate-600">Analyzing <b>{currentResumeName}</b></p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                  <button onClick={() => { setAnalysisMode('general'); runAnalysis(previewData!, undefined); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${analysisMode === 'general' ? 'bg-white shadow' : ''}`}>General Audit</button>
                  <button onClick={() => setAnalysisMode('jd')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${analysisMode === 'jd' ? 'bg-[#0B192C] text-white shadow' : ''}`}>JD Match</button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-slate-100 text-xs font-bold rounded-xl border">Change File</button>
              </div>
            </div>

            {atsError && !isScanning && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-900">
                <AlertCircle size={18} /> <p className="text-sm font-bold flex-1">{atsError}</p>
                <button onClick={() => runAnalysis(previewData!, analysisMode === 'jd' ? jobDescription : undefined)} className="bg-red-600 text-white px-3 py-1 text-xs rounded-lg">Retry</button>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-bold mb-1">ATS SCORE</p>
                  <p className="text-3xl font-black">{atsScore}</p>
                </div>
                {analysisMode === 'jd' && atsReport?.matching && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <p className="text-xs text-blue-600 font-bold mb-1">MATCHED REQS</p>
                    <p className="text-3xl font-black">{atsReport.matching.filter(m => m.status === 'MATCHED').length}</p>
                  </div>
                )}
            </div>
          </div>

          {analysisMode === 'jd' ? (
            <div className="space-y-6">
               <JobDescriptionInput value={jobDescription} onChange={setJobDescription} onAnalyze={() => handleRunLiveJobOptimization()} isAnalyzing={isLiveOptimizing} />
               {atsReport?.jdAnalysis && (
                 <div className="bg-white p-6 rounded-2xl border shadow-sm">
                   <h2 className="text-xl font-bold mb-4">Job Description Match Results</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold mb-2">Matched Requirements</h3>
                        <ul className="text-sm space-y-1 text-emerald-700">
                          {atsReport.matching?.filter(m => m.status === 'MATCHED').map((m, i) => <li key={i}>✓ {m.requirement}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">Missing Requirements</h3>
                        <ul className="text-sm space-y-1 text-red-600">
                          {atsReport.matching?.filter(m => m.status === 'MISSING').map((m, i) => <li key={i}>✗ {m.requirement}</li>)}
                        </ul>
                      </div>
                   </div>
                   {atsReport.projectRelevance && atsReport.projectRelevance.length > 0 && (
                     <div className="mt-6 border-t pt-4">
                       <h3 className="font-bold mb-3">Project Relevance</h3>
                       {atsReport.projectRelevance.map((pr, i) => (
                         <div key={i} className="mb-2 p-3 bg-slate-50 rounded border">
                           <p className="font-bold">{pr.projectName} (Score: {pr.relevanceScore})</p>
                           <p className="text-xs text-slate-600">{pr.explanation}</p>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-6">
               <h2 className="text-xl font-bold px-2">Resume Categories Breakdown</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderCategoryCards()}
               </div>
            </div>
          )}
          
          <div className="flex justify-end pt-6 border-t">
            <button onClick={handleNavigateToResumeBuilder} className="bg-[#0B192C] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
              Edit in Builder <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
