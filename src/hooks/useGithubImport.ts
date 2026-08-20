/**
 * Custom React Hook: useGithubImport
 * Coordinates the complete 10-step GitHub Import & Skill Optimization pipeline.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  ExtractedSkill,
  GitHubRepoItem,
  GitHubUserProfile,
  ImportProgress,
} from '../types';
import { githubService } from '../services/githubService';
import { skillExtractor } from '../services/skillExtractor';
import { aiSkillOptimizer } from '../services/aiSkillOptimizer';
import { projectExtractor } from '../services/projectExtractor';
import { mergeSkills, SkillMergeResult } from '../utils/skillMerger';

export interface UseGithubImportOptions {
  mode?: 'skills' | 'projects';
  existingSkillsString?: string;
  targetJobDescription?: string;
}

export function useGithubImport(options: UseGithubImportOptions = {}) {
  const mode = options.mode || 'skills';

  // Step 1: Username & Profile state
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState<GitHubUserProfile | null>(null);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Step 2: Repository List & Filtering State
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hideForks, setHideForks] = useState(false);
  const [hideArchived, setHideArchived] = useState(false);
  const [showPracticeRepos, setShowPracticeRepos] = useState(true);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set());

  // Step 3-10: Pipeline Execution State
  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    currentStep: 0,
    totalSteps: 6,
    stepLabel: '',
    percent: 0,
    isComplete: false,
  });
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[]>([]);
  const [extractedProjects, setExtractedProjects] = useState<any[]>([]);
  const [mergeResult, setMergeResult] = useState<SkillMergeResult | null>(null);
  const [statsSummary, setStatsSummary] = useState<{
    repositoriesAnalyzed: number;
    technologiesDetected?: number;
    newSkillsAdded?: number;
    projectsGenerated?: number;
    jdMatchApplied?: boolean;
  } | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 1: Sync & Fetch Repositories
  // ──────────────────────────────────────────────────────────────────────────
  const syncRepos = useCallback(async (userToSync?: string) => {
    const handle = (userToSync || username).trim();
    if (!handle) return;

    setIsSyncingRepos(true);
    setSyncError(null);
    setRepos([]);
    setSelectedRepoIds(new Set());

    try {
      // Fetch user profile and repos in parallel
      const [profile, fetchedRepos] = await Promise.all([
        githubService.validateUser(handle).catch(() => null),
        githubService.fetchRepos(handle, { includeForks: true }),
      ]);

      setUserProfile(profile);
      setRepos(fetchedRepos);

      // Prioritize high-quality repositories: default select non-fork, non-empty, non-archived, non-practice repos
      const defaultSelected = new Set<string>();
      fetchedRepos.forEach((r) => {
        if (!r.isFork && !r.isEmpty && !r.isArchived && !r.isPractice) {
          defaultSelected.add(r.id);
        }
      });
      // Fallback: if all repos are forks or practice, select non-empty ones
      if (defaultSelected.size === 0 && fetchedRepos.length > 0) {
        fetchedRepos.filter((r) => !r.isEmpty).slice(0, 5).forEach((r) => defaultSelected.add(r.id));
      }
      setSelectedRepoIds(defaultSelected);
    } catch (err: any) {
      console.error('Failed to sync GitHub repos:', err);
      setSyncError(err.message || 'Failed to fetch repositories for username.');
    } finally {
      setIsSyncingRepos(false);
    }
  }, [username]);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 2: Repository Filtering
  // ──────────────────────────────────────────────────────────────────────────
  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      if (hideForks && r.isFork) return false;
      if (hideArchived && r.isArchived) return false;
      if (!showPracticeRepos && r.isPractice) return false;

      return true;
    });
  }, [repos, searchQuery, hideForks, hideArchived, showPracticeRepos]);

  const selectedRepos = useMemo(() => {
    return repos.filter((r) => selectedRepoIds.has(r.id));
  }, [repos, selectedRepoIds]);

  const toggleSelectRepo = useCallback((id: string) => {
    setSelectedRepoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const next = new Set<string>();
    filteredRepos.forEach((r) => next.add(r.id));
    setSelectedRepoIds(next);
  }, [filteredRepos]);

  const deselectAll = useCallback(() => {
    setSelectedRepoIds(new Set());
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 3–10: Run Automated Import & Optimization Pipeline
  // ──────────────────────────────────────────────────────────────────────────
  const runImportPipeline = useCallback(async (overrideExistingSkills?: string) => {
    if (selectedRepos.length === 0) return;

    setIsProcessingPipeline(true);
    setPipelineError(null);
    setMergeResult(null);
    setStatsSummary(null);

    const updateStep = (stepNum: number, label: string, percent: number) => {
      setProgress({
        currentStep: stepNum,
        totalSteps: 6,
        stepLabel: label,
        percent,
        isComplete: stepNum === 6,
      });
    };

    try {
      // Step 1: Fetching repositories
      updateStep(1, 'Fetching repositories...', 15);
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: Downloading repository metadata & file trees
      updateStep(2, 'Downloading repository metadata & tree structure...', 35);
      const reposAnalysisData: Array<{ repo: GitHubRepoItem; skills: ExtractedSkill[] }> = [];
      const filesMap = new Map<string, Map<string, string>>();

      for (let i = 0; i < selectedRepos.length; i++) {
        const repo = selectedRepos[i];
        const owner = repo.url.split('/')[3] || username;
        const branch = (repo as any).defaultBranch || 'main';

        // Check cache first
        let cached = githubService.getCachedRepoData(repo.id);
        let tree = cached?.tree;
        let files = cached?.files;

        if (!files) {
          tree = await githubService.fetchRepoTree(owner, repo.name, branch);
          files = await githubService.fetchImportantFiles(owner, repo.name, tree || []);
          githubService.setCachedRepoData(repo.id, tree || [], files);
        }

        filesMap.set(repo.id, files);

        // Step 3: Analyzing dependencies
        updateStep(
          3,
          `Analyzing dependencies for ${repo.name} (${i + 1}/${selectedRepos.length})...`,
          35 + Math.round(((i + 1) / selectedRepos.length) * 20)
        );

        // Step 4: Extracting technologies
        const rawSkills = skillExtractor.extractSkillsFromRepo(repo, files, tree);
        reposAnalysisData.push({ repo, skills: rawSkills });
      }

      if (mode === 'projects') {
        // PROJECTS MODE: Extract complete project structures and rank by Job Description
        updateStep(4, 'Synthesizing STAR bullet achievements & project metadata...', 65);
        updateStep(5, 'Ranking projects by target Job Description relevance...', 85);

        const projects = await projectExtractor.extractAndRankProjects(
          selectedRepos,
          filesMap,
          options.targetJobDescription
        );

        setExtractedProjects(projects);
        setStatsSummary({
          repositoriesAnalyzed: selectedRepos.length,
          projectsGenerated: projects.length,
          jdMatchApplied: !!options.targetJobDescription && options.targetJobDescription.trim().length > 0,
        });

        updateStep(6, 'Projects Extracted & Ranked Successfully!', 100);
      } else {
        // SKILLS MODE: Extract and optimize ATS skills
        updateStep(4, 'Extracting technologies & aggregating confidence scores...', 60);
        const aggregatedSkills = skillExtractor.aggregateExtractedSkills(reposAnalysisData);

        // Step 5: Optimizing ATS keywords with Gemini/Claude AI
        updateStep(5, 'Optimizing ATS keywords with AI...', 80);
        let optimizedSkills: ExtractedSkill[] = [];
        try {
          optimizedSkills = await aiSkillOptimizer.optimizeSkillsWithAI(
            aggregatedSkills,
            options.targetJobDescription
          );
        } catch (aiErr) {
          console.warn('AI Optimization step failed, continuing with raw skills:', aiErr);
          optimizedSkills = aggregatedSkills;
        }

        if (optimizedSkills.length === 0) {
          optimizedSkills = aggregatedSkills;
        }

        setExtractedSkills(optimizedSkills);

        // Step 6: Merging with existing resume & updating
        updateStep(6, 'Updating resume with ATS-optimized skills...', 95);
        const currentSkillsStr = overrideExistingSkills ?? options.existingSkillsString ?? '';
        const merged = mergeSkills(currentSkillsStr, optimizedSkills);
        setMergeResult(merged);

        setStatsSummary({
          repositoriesAnalyzed: selectedRepos.length,
          technologiesDetected: optimizedSkills.length,
          newSkillsAdded: merged.newSkillsCount,
        });

        updateStep(6, 'Import & Optimization Completed Successfully!', 100);
      }
    } catch (err: any) {
      console.error('Import pipeline error:', err);
      setPipelineError(err.message || 'An error occurred while importing from GitHub.');
    } finally {
      setIsProcessingPipeline(false);
    }
  }, [selectedRepos, username, mode, options.targetJobDescription, options.existingSkillsString]);

  return {
    // Inputs & Profile
    username,
    setUsername,
    userProfile,
    isSyncingRepos,
    syncError,
    syncRepos,

    // Repo List & Filters
    repos,
    filteredRepos,
    selectedRepos,
    selectedRepoIds,
    searchQuery,
    setSearchQuery,
    hideForks,
    setHideForks,
    hideArchived,
    setHideArchived,
    showPracticeRepos,
    setShowPracticeRepos,
    toggleSelectRepo,
    selectAll,
    deselectAll,

    // Pipeline Execution
    isProcessingPipeline,
    progress,
    pipelineError,
    extractedSkills,
    extractedProjects,
    mergeResult,
    statsSummary,
    runImportPipeline,
  };
}

export default useGithubImport;
