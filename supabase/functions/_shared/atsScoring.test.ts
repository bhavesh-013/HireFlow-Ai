import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { calculateDeterministicScore, ResumeFacts, JDRequirements } from "./atsScoring.ts";

Deno.test("atsScoring - Perfect matching", () => {
  const resume: ResumeFacts = {
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    keywords: ["Redux", "Docker", "AWS"],
    sections: ["Summary", "Experience", "Skills", "Education", "Projects"],
    projectsCount: 2,
    projectsWithMetrics: 2,
    experienceBullets: 5,
    experienceBulletsWithMetrics: 5,
    hasActionVerbs: true,
    formattingScore: 100
  };

  const jd: JDRequirements = {
    requiredSkills: ["React", "TypeScript", "Node"],
    preferredSkills: ["Postgres"],
    keywords: ["AWS", "Docker", "Redux"]
  };

  const result = calculateDeterministicScore(resume, jd);
  assertEquals(result.overallScore, 100);
});

Deno.test("atsScoring - Fresher Handling", () => {
  const resume: ResumeFacts = {
    skills: ["Python", "Java"],
    keywords: [],
    sections: ["Skills", "Education", "Projects"],
    projectsCount: 3,
    projectsWithMetrics: 3,
    experienceBullets: 0,
    experienceBulletsWithMetrics: 0,
    hasActionVerbs: true,
    formattingScore: 100
  };

  const result = calculateDeterministicScore(resume, null);
  // Should not heavily penalize missing experience since experienceBullets === 0
  assertEquals(result.breakdown.experience, 100);
  assertEquals(result.sectionIssues.length, 0); // Experience missing is allowed for fresher
});

Deno.test("atsScoring - Token Normalization", () => {
  const resume: ResumeFacts = {
    skills: ["React.js", "node.JS"],
    keywords: [],
    sections: ["Summary", "Experience", "Skills", "Education", "Projects"],
    projectsCount: 1,
    projectsWithMetrics: 1,
    experienceBullets: 1,
    experienceBulletsWithMetrics: 1,
    hasActionVerbs: true,
    formattingScore: 100
  };

  const jd: JDRequirements = {
    requiredSkills: ["React", "Node"],
    preferredSkills: [],
    keywords: []
  };

  const result = calculateDeterministicScore(resume, jd);
  assertEquals(result.missingSkills.length, 0);
  assertEquals(result.matchedSkills.includes("React"), true);
});
