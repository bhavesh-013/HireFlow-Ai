const axios = require('axios');
const ApiError = require('../utils/apiError');
const config = require('../config/env');

/**
 * Fetch GitHub user profile and public repositories
 * @param {string} usernameOrToken - GitHub Username or Access Token
 * @param {boolean} isToken - True if provided value is an OAuth access token
 */
const fetchGitHubData = async (usernameOrToken, isToken = false) => {
  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'HireFlow-AI-App',
    };

    let userUrl = 'https://api.github.com/user';
    let reposUrl = 'https://api.github.com/user/repos?sort=updated&per_page=15&type=all';

    if (isToken) {
      headers.Authorization = `Bearer ${usernameOrToken}`;
    } else {
      userUrl = `https://api.github.com/users/${encodeURIComponent(usernameOrToken)}`;
      reposUrl = `https://api.github.com/users/${encodeURIComponent(usernameOrToken)}/repos?sort=updated&per_page=15`;
    }

    // Fetch user profile & repos in parallel
    const [userRes, reposRes] = await Promise.all([
      axios.get(userUrl, { headers }),
      axios.get(reposUrl, { headers }),
    ]);

    const userData = userRes.data;
    const reposData = Array.isArray(reposRes.data) ? reposRes.data : [];

    // Filter & sort top repositories by stars and recency
    const sortedRepos = reposData
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 8);

    // Extract languages and technologies
    const languagesSet = new Set();
    sortedRepos.forEach((repo) => {
      if (repo.language) languagesSet.add(repo.language);
    });

    // Format into Resume Projects
    const projects = sortedRepos.map((repo, idx) => ({
      id: `gh_proj_${idx + 1}`,
      name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'Owner / Maintainer',
      description: repo.description || `Open-source project on GitHub with ${repo.stargazers_count} stars.`,
      link: repo.html_url,
      startDate: repo.created_at ? repo.created_at.substring(0, 7) : '',
      endDate: repo.pushed_at ? repo.pushed_at.substring(0, 7) : 'Present',
      technologies: repo.language ? [repo.language] : ['JavaScript'],
      bullets: [
        `Accumulated ${repo.stargazers_count} stars and ${repo.forks_count} forks on GitHub.`,
        `Primary language: ${repo.language || 'Software Engineering'}.`,
        repo.homepage ? `Live Demo: ${repo.homepage}` : `Repository URL: ${repo.html_url}`,
      ].filter(Boolean),
    }));

    // Format languages into Skills
    const skills = Array.from(languagesSet).map((lang, idx) => ({
      id: `gh_skill_${idx + 1}`,
      category: 'GitHub Tech Stack',
      name: lang,
      level: 'Advanced',
      keywords: ['Open Source', 'GitHub'],
    }));

    // Split name into first and last
    const fullName = userData.name || userData.login || 'GitHub User';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'GitHub';
    const lastName = nameParts.slice(1).join(' ') || 'Developer';

    return {
      profile: {
        username: userData.login,
        firstName,
        lastName,
        email: userData.email || '',
        location: userData.location || '',
        jobTitle: userData.bio || 'Software Developer',
        website: userData.blog || '',
        github: userData.html_url,
        photoUrl: userData.avatar_url || '',
      },
      summary: userData.bio ? `GitHub Profile: ${userData.bio}. Active contributor with ${userData.public_repos} public repositories.` : '',
      projects,
      skills,
      repoCount: sortedRepos.length,
    };
  } catch (error) {
    console.error('[GitHub API Error]:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 404) {
      throw ApiError.notFound('GitHub user or repositories not found. Please verify the username.');
    }
    throw ApiError.badRequest(`Failed to import GitHub data: ${error.message}`);
  }
};

/**
 * Exchange OAuth authorization code for GitHub access token
 * @param {string} code
 */
const exchangeGitHubCodeForToken = async (code) => {
  if (!config.github.clientId || !config.github.clientSecret) {
    throw ApiError.badRequest('GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) not configured.');
  }

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (response.data.error || !response.data.access_token) {
      throw ApiError.badRequest(`GitHub OAuth failed: ${response.data.error_description || 'Invalid authorization code'}`);
    }

    return response.data.access_token;
  } catch (error) {
    if (error.isApiError) throw error;
    throw ApiError.badRequest(`GitHub OAuth token exchange failed: ${error.message}`);
  }
};

module.exports = {
  fetchGitHubData,
  exchangeGitHubCodeForToken,
};
