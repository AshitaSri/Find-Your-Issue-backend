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

    async searchRepositories(queryString) {
        try {
            const response = await this.axiosInstance.get('/search/repositories', {
                params: {
                    q: queryString,
                    per_page: 30,
                }
            });
            return {
                repos: response.data.items,
                rateLimit: {
                    remaining: response.headers['x-ratelimit-remaining'],
                    resetAt: new Date(response.headers['x-ratelimit-reset'] * 1000).toISOString(),
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