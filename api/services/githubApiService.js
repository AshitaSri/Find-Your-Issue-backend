// api/services/githubApiService.js
const axios = require('axios');
const config = require('../config');

class GitHubApiService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.GITHUB_API_URL,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${config.GITHUB_TOKEN}`
            }
        });
    }

    async searchRepositories(queryString, page = 1, perPage = 100, showOnlyWithIssues = false) {
        try {
            // Base query
            const enhancedQuery = `${queryString} is:public archived:false`;
            
            const response = await this.axiosInstance.get('/search/repositories', {
                params: {
                    q: enhancedQuery,
                    per_page: perPage,
                    page: page,
                    sort: 'updated',
                    order: 'desc'
                }
            });

            let filteredRepos = response.data.items;

            // If showOnlyWithIssues is true, filter and get issue details
            if (showOnlyWithIssues) {
                // Filter repositories to only include those with open issues
                filteredRepos = response.data.items.filter(repo => repo.open_issues_count > 0);

                // Get issue details for filtered repos
                const reposWithDetails = await Promise.all(filteredRepos.map(async (repo) => {
                    try {
                        const issuesResponse = await this.axiosInstance.get(`/repos/${repo.full_name}/issues`, {
                            params: {
                                state: 'open',
                                per_page: 1,
                                sort: 'created',
                                direction: 'desc'
                            }
                        });

                        return {
                            ...repo,
                            latest_issue_date: issuesResponse.data[0]?.created_at
                        };
                    } catch (error) {
                        console.error(`Error fetching issues for ${repo.full_name}:`, error);
                        return repo;
                    }
                }));

                // Sort by latest issue date if showing only repos with issues
                filteredRepos = reposWithDetails
                    .filter(repo => repo.latest_issue_date)
                    .sort((a, b) => new Date(b.latest_issue_date) - new Date(a.latest_issue_date));
            }

            return {
                repos: filteredRepos,
                totalCount: filteredRepos.length,
                currentPage: page,
                hasNextPage: response.data.total_count > page * perPage,
                rateLimit: {
                    remaining: response.headers['x-ratelimit-remaining'],
                    resetAt: new Date(response.headers['x-ratelimit-reset'] * 1000).toISOString(),
                    total: response.headers['x-ratelimit-limit']
                }
            };
        } catch (error) {
            if (error.response && error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                const rateLimitReset = error.response.headers['x-ratelimit-reset'];
                throw new Error(`Rate limit exceeded. Try again after ${new Date(rateLimitReset * 1000).toISOString()}`);
            }
            throw error;
        }
    }
}

module.exports = new GitHubApiService();