/**
 * Client-Side Skill & Technology Extractor
 * Analyzes repository contents, dependencies, config files, file extensions, and READMEs
 * to infer technologies with confidence scores and reasoning.
 */

import { ExtractedSkill, GitHubRepoItem, GitHubTreeItem } from '../types';

// ─── Known Technology Mappings ───────────────────────────────────────────────

/** Map npm package names (or lowercased package names) to standardized tech names */
const NPM_PACKAGE_MAP: Record<string, { name: string; category: string; confidence: number }> = {
  // Frontend Frameworks & Libraries
  react: { name: 'React', category: 'Frontend', confidence: 95 },
  'react-dom': { name: 'React', category: 'Frontend', confidence: 95 },
  next: { name: 'Next.js', category: 'Frontend', confidence: 95 },
  vue: { name: 'Vue.js', category: 'Frontend', confidence: 95 },
  nuxt: { name: 'Nuxt.js', category: 'Frontend', confidence: 95 },
  '@angular/core': { name: 'Angular', category: 'Frontend', confidence: 95 },
  svelte: { name: 'Svelte', category: 'Frontend', confidence: 95 },
  'svelte-kit': { name: 'SvelteKit', category: 'Frontend', confidence: 95 },
  astro: { name: 'Astro', category: 'Frontend', confidence: 95 },
  gatsby: { name: 'Gatsby', category: 'Frontend', confidence: 90 },

  // Styling & UI
  tailwindcss: { name: 'Tailwind CSS', category: 'Frontend', confidence: 95 },
  '@tailwindcss/vite': { name: 'Tailwind CSS', category: 'Frontend', confidence: 95 },
  bootstrap: { name: 'Bootstrap', category: 'Frontend', confidence: 90 },
  '@mui/material': { name: 'Material UI', category: 'Frontend', confidence: 90 },
  '@chakra-ui/react': { name: 'Chakra UI', category: 'Frontend', confidence: 90 },
  'styled-components': { name: 'Styled Components', category: 'Frontend', confidence: 85 },
  'framer-motion': { name: 'Framer Motion', category: 'Frontend', confidence: 88 },
  motion: { name: 'Framer Motion', category: 'Frontend', confidence: 88 },
  sass: { name: 'Sass/SCSS', category: 'Frontend', confidence: 85 },

  // State Management
  redux: { name: 'Redux', category: 'Frontend', confidence: 90 },
  '@reduxjs/toolkit': { name: 'Redux Toolkit', category: 'Frontend', confidence: 92 },
  zustand: { name: 'Zustand', category: 'Frontend', confidence: 90 },
  recoil: { name: 'Recoil', category: 'Frontend', confidence: 88 },
  mobx: { name: 'MobX', category: 'Frontend', confidence: 85 },

  // Backend Frameworks
  express: { name: 'Express.js', category: 'Backend', confidence: 95 },
  '@nestjs/core': { name: 'NestJS', category: 'Backend', confidence: 95 },
  fastify: { name: 'Fastify', category: 'Backend', confidence: 92 },
  koa: { name: 'Koa', category: 'Backend', confidence: 88 },
  hono: { name: 'Hono', category: 'Backend', confidence: 90 },
  graphql: { name: 'GraphQL', category: 'Backend', confidence: 92 },
  '@apollo/client': { name: 'GraphQL', category: 'Frontend', confidence: 90 },
  'apollo-server': { name: 'GraphQL', category: 'Backend', confidence: 92 },
  trpc: { name: 'tRPC', category: 'Backend', confidence: 90 },
  '@trpc/server': { name: 'tRPC', category: 'Backend', confidence: 90 },

  // Databases & ORMs
  mongoose: { name: 'MongoDB', category: 'Database', confidence: 92 },
  mongodb: { name: 'MongoDB', category: 'Database', confidence: 90 },
  pg: { name: 'PostgreSQL', category: 'Database', confidence: 92 },
  mysql2: { name: 'MySQL', category: 'Database', confidence: 90 },
  redis: { name: 'Redis', category: 'Database', confidence: 92 },
  ioredis: { name: 'Redis', category: 'Database', confidence: 92 },
  prisma: { name: 'Prisma ORM', category: 'Database', confidence: 92 },
  '@prisma/client': { name: 'Prisma ORM', category: 'Database', confidence: 95 },
  typeorm: { name: 'TypeORM', category: 'Database', confidence: 90 },
  'drizzle-orm': { name: 'Drizzle ORM', category: 'Database', confidence: 92 },
  '@supabase/supabase-js': { name: 'Supabase', category: 'Database', confidence: 95 },
  firebase: { name: 'Firebase', category: 'Database', confidence: 95 },
  'firebase-admin': { name: 'Firebase', category: 'Database', confidence: 95 },

  // Testing & Tooling
  jest: { name: 'Jest', category: 'Testing', confidence: 90 },
  vitest: { name: 'Vitest', category: 'Testing', confidence: 90 },
  cypress: { name: 'Cypress', category: 'Testing', confidence: 90 },
  '@playwright/test': { name: 'Playwright', category: 'Testing', confidence: 92 },
  playwright: { name: 'Playwright', category: 'Testing', confidence: 92 },
  vite: { name: 'Vite', category: 'Tools', confidence: 90 },
  webpack: { name: 'Webpack', category: 'Tools', confidence: 85 },
  typescript: { name: 'TypeScript', category: 'Frontend', confidence: 95 },

  // AI & ML (JS/TS ecosystem)
  '@google/genai': { name: 'Gemini API', category: 'AI/ML', confidence: 95 },
  openai: { name: 'OpenAI API', category: 'AI/ML', confidence: 95 },
  langchain: { name: 'LangChain', category: 'AI/ML', confidence: 92 },
  '@langchain/core': { name: 'LangChain', category: 'AI/ML', confidence: 92 },
  '@pinecone-database/pinecone': { name: 'Pinecone', category: 'AI/ML', confidence: 90 },
  chromadb: { name: 'Chroma DB', category: 'AI/ML', confidence: 90 },
};

/** Python dependency mappings */
const PYTHON_PACKAGE_MAP: Record<string, { name: string; category: string; confidence: number }> = {
  django: { name: 'Django', category: 'Backend', confidence: 95 },
  flask: { name: 'Flask', category: 'Backend', confidence: 95 },
  fastapi: { name: 'FastAPI', category: 'Backend', confidence: 95 },
  celery: { name: 'Celery', category: 'Backend', confidence: 88 },
  sqlalchemy: { name: 'SQLAlchemy', category: 'Database', confidence: 90 },
  psycopg2: { name: 'PostgreSQL', category: 'Database', confidence: 90 },
  'psycopg2-binary': { name: 'PostgreSQL', category: 'Database', confidence: 90 },
  pymongo: { name: 'MongoDB', category: 'Database', confidence: 90 },
  redis: { name: 'Redis', category: 'Database', confidence: 90 },
  torch: { name: 'PyTorch', category: 'AI/ML', confidence: 95 },
  pytorch: { name: 'PyTorch', category: 'AI/ML', confidence: 95 },
  tensorflow: { name: 'TensorFlow', category: 'AI/ML', confidence: 95 },
  keras: { name: 'Keras', category: 'AI/ML', confidence: 90 },
  'scikit-learn': { name: 'Scikit-learn', category: 'AI/ML', confidence: 92 },
  sklearn: { name: 'Scikit-learn', category: 'AI/ML', confidence: 92 },
  pandas: { name: 'Pandas', category: 'AI/ML', confidence: 88 },
  numpy: { name: 'NumPy', category: 'AI/ML', confidence: 88 },
  opencv: { name: 'OpenCV', category: 'AI/ML', confidence: 90 },
  'opencv-python': { name: 'OpenCV', category: 'AI/ML', confidence: 90 },
  langchain: { name: 'LangChain', category: 'AI/ML', confidence: 92 },
  openai: { name: 'OpenAI API', category: 'AI/ML', confidence: 95 },
  pinecone: { name: 'Pinecone', category: 'AI/ML', confidence: 90 },
  faiss: { name: 'FAISS', category: 'AI/ML', confidence: 90 },
  pytest: { name: 'Pytest', category: 'Testing', confidence: 90 },
  docker: { name: 'Docker', category: 'DevOps', confidence: 88 },
};

/** Config files to Technology mapping */
const CONFIG_FILE_MAP: Record<string, { name: string; category: string; confidence: number }> = {
  'Dockerfile': { name: 'Docker', category: 'DevOps', confidence: 95 },
  'docker-compose.yml': { name: 'Docker', category: 'DevOps', confidence: 95 },
  'docker-compose.yaml': { name: 'Docker', category: 'DevOps', confidence: 95 },
  'next.config.js': { name: 'Next.js', category: 'Frontend', confidence: 95 },
  'next.config.mjs': { name: 'Next.js', category: 'Frontend', confidence: 95 },
  'next.config.ts': { name: 'Next.js', category: 'Frontend', confidence: 95 },
  'vite.config.ts': { name: 'Vite', category: 'Tools', confidence: 90 },
  'vite.config.js': { name: 'Vite', category: 'Tools', confidence: 90 },
  'tailwind.config.js': { name: 'Tailwind CSS', category: 'Frontend', confidence: 95 },
  'tailwind.config.ts': { name: 'Tailwind CSS', category: 'Frontend', confidence: 95 },
  'tsconfig.json': { name: 'TypeScript', category: 'Frontend', confidence: 90 },
  'angular.json': { name: 'Angular', category: 'Frontend', confidence: 95 },
  'pubspec.yaml': { name: 'Flutter', category: 'Mobile', confidence: 95 },
  'CMakeLists.txt': { name: 'C++', category: 'Backend', confidence: 92 },
  'prisma/schema.prisma': { name: 'Prisma ORM', category: 'Database', confidence: 95 },
  'drizzle.config.ts': { name: 'Drizzle ORM', category: 'Database', confidence: 95 },
  '.github/workflows/ci.yml': { name: 'GitHub Actions', category: 'DevOps', confidence: 95 },
  '.github/workflows/ci.yaml': { name: 'GitHub Actions', category: 'DevOps', confidence: 95 },
  '.github/workflows/main.yml': { name: 'GitHub Actions', category: 'DevOps', confidence: 95 },
  '.github/workflows/deploy.yml': { name: 'GitHub Actions', category: 'DevOps', confidence: 95 },
};

// ─── Main Extraction Function ───────────────────────────────────────────────

/**
 * Analyzes a single repository and its fetched config/dependency files to extract technical skills.
 */
export function extractSkillsFromRepo(
  repo: GitHubRepoItem,
  files: Map<string, string>,
  tree?: GitHubTreeItem[]
): ExtractedSkill[] {
  const repoName = repo.name;
  const skillsMap = new Map<string, ExtractedSkill>();

  const addSkill = (name: string, category: string, confidence: number, reason: string) => {
    const existing = skillsMap.get(name.toLowerCase());
    if (!existing || existing.confidence < confidence) {
      skillsMap.set(name.toLowerCase(), {
        name,
        category,
        confidence,
        reason,
        sourceRepo: repoName,
      });
    }
  };

  // 1. Primary Language from GitHub API metadata
  if (repo.language && repo.language !== 'Unknown') {
    addSkill(repo.language, 'Languages', 85, `Primary language of ${repoName}`);
  }

  // 2. Package.json inspection (Node.js ecosystem)
  for (const [path, content] of files.entries()) {
    if (path.endsWith('package.json')) {
      try {
        const parsed = JSON.parse(content);
        const allDeps = {
          ...(parsed.dependencies || {}),
          ...(parsed.devDependencies || {}),
        };

        for (const dep of Object.keys(allDeps)) {
          const matched = NPM_PACKAGE_MAP[dep.toLowerCase()];
          if (matched) {
            addSkill(
              matched.name,
              matched.category,
              matched.confidence,
              `Found dependency "${dep}" in ${path}`
            );
          }
        }
      } catch {
        // invalid json
      }
    }

    // 3. Python Requirements / Pyproject inspection
    if (path.endsWith('requirements.txt') || path.endsWith('Pipfile')) {
      const lines = content.split('\n');
      for (const line of lines) {
        const clean = line.trim().split('#')[0].split('==')[0].split('>=')[0].trim().toLowerCase();
        if (clean && PYTHON_PACKAGE_MAP[clean]) {
          const matched = PYTHON_PACKAGE_MAP[clean];
          addSkill(
            matched.name,
            matched.category,
            matched.confidence,
            `Found Python dependency "${clean}" in ${path}`
          );
        }
      }
    }

    // 4. Cargo.toml inspection (Rust)
    if (path.endsWith('Cargo.toml')) {
      addSkill('Rust', 'Languages', 95, `Found Cargo.toml in ${repoName}`);
      if (content.includes('tokio')) addSkill('Tokio', 'Backend', 90, 'Found tokio dependency in Cargo.toml');
      if (content.includes('actix-web')) addSkill('Actix Web', 'Backend', 92, 'Found actix-web in Cargo.toml');
      if (content.includes('axum')) addSkill('Axum', 'Backend', 92, 'Found axum in Cargo.toml');
    }

    // 5. Go.mod inspection (Go)
    if (path.endsWith('go.mod')) {
      addSkill('Go', 'Languages', 95, `Found go.mod in ${repoName}`);
      if (content.includes('gin-gonic/gin')) addSkill('Gin', 'Backend', 92, 'Found Gin framework in go.mod');
      if (content.includes('gorm.io/gorm')) addSkill('GORM', 'Database', 90, 'Found GORM in go.mod');
    }

    // 6. Dockerfile / Docker Compose inspection
    if (path === 'Dockerfile' || path.endsWith('/Dockerfile')) {
      addSkill('Docker', 'DevOps', 95, `Found Dockerfile in ${repoName}`);
    }
    if (path.includes('docker-compose')) {
      addSkill('Docker Compose', 'DevOps', 92, `Found ${path} in ${repoName}`);
      if (content.includes('postgres')) addSkill('PostgreSQL', 'Database', 88, 'Found postgres service in docker-compose');
      if (content.includes('redis')) addSkill('Redis', 'Database', 88, 'Found redis service in docker-compose');
      if (content.includes('mongo')) addSkill('MongoDB', 'Database', 88, 'Found mongo service in docker-compose');
    }

    // 7. Config file presence
    for (const [configPath, matched] of Object.entries(CONFIG_FILE_MAP)) {
      if (path === configPath || path.endsWith(`/${configPath}`)) {
        addSkill(matched.name, matched.category, matched.confidence, `Found config file ${configPath}`);
      }
    }

    // 8. README inspection for additional technology keywords
    if (path.toLowerCase().startsWith('readme')) {
      const lower = content.toLowerCase();
      const readmeKeywords: Record<string, { name: string; category: string }> = {
        kubernetes: { name: 'Kubernetes', category: 'DevOps' },
        aws: { name: 'AWS', category: 'Cloud' },
        gcp: { name: 'GCP', category: 'Cloud' },
        azure: { name: 'Azure', category: 'Cloud' },
        vercel: { name: 'Vercel', category: 'Cloud' },
        netlify: { name: 'Netlify', category: 'Cloud' },
        'graphql api': { name: 'GraphQL', category: 'Backend' },
        'rest api': { name: 'REST API', category: 'Backend' },
        'ci/cd': { name: 'CI/CD', category: 'DevOps' },
      };

      for (const [kw, spec] of Object.entries(readmeKeywords)) {
        if (lower.includes(kw)) {
          addSkill(spec.name, spec.category, 80, `Mentioned "${kw}" in README`);
        }
      }
    }
  }

  // 9. Infer from GitHub Topics
  if (repo.topics) {
    for (const topic of repo.topics) {
      const topicLower = topic.toLowerCase();
      if (NPM_PACKAGE_MAP[topicLower]) {
        const spec = NPM_PACKAGE_MAP[topicLower];
        addSkill(spec.name, spec.category, 82, `GitHub topic #${topic}`);
      } else if (PYTHON_PACKAGE_MAP[topicLower]) {
        const spec = PYTHON_PACKAGE_MAP[topicLower];
        addSkill(spec.name, spec.category, 82, `GitHub topic #${topic}`);
      }
    }
  }

  return Array.from(skillsMap.values());
}

/**
 * Analyzes multiple repositories and aggregates/deduplicates extracted skills across all of them.
 */
export function aggregateExtractedSkills(
  reposAnalysis: Array<{ repo: GitHubRepoItem; skills: ExtractedSkill[] }>
): ExtractedSkill[] {
  const aggregatedMap = new Map<string, ExtractedSkill>();

  for (const { repo, skills } of reposAnalysis) {
    for (const skill of skills) {
      const key = skill.name.toLowerCase();
      const existing = aggregatedMap.get(key);

      if (!existing) {
        aggregatedMap.set(key, { ...skill, sourceRepo: repo.name });
      } else {
        // If skill found in multiple repos, boost confidence slightly and combine reasons
        const higherConfidence = Math.max(existing.confidence, skill.confidence);
        const boosted = Math.min(99, higherConfidence + 3);
        aggregatedMap.set(key, {
          ...existing,
          confidence: boosted,
          reason: `${existing.reason}; also found in ${repo.name}`,
        });
      }
    }
  }

  return Array.from(aggregatedMap.values()).sort((a, b) => b.confidence - a.confidence);
}

export const skillExtractor = {
  extractSkillsFromRepo,
  aggregateExtractedSkills,
};

export default skillExtractor;
