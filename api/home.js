const express = require('express');
const axios = require('axios');
const router = express.Router();
const config = require('./config'); // Import the config file

// Create an Axios instance with the base URL and headers for GitHub API
const githubApi = axios.create({
    baseURL: config.GITHUB_API_URL,
    headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${config.GITHUB_TOKEN}`,
    },
});

// Middleware to handle rate limiting for GitHub API
router.get('/repos', async (req, res) => {
    try {
        const response = await githubApi.get('/search/repositories', {
            params: {
                q: 'stars:>1',
                sort: 'stars',
                order: 'desc',
                per_page: 10,
            },
        });

        const repos = response.data.items.map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            stargazers_count: repo.stargazers_count,
            language: repo.language,
        }));

        res.json(repos);
    } catch (error) {
        // Check if the error is due to rate limiting
        if (error.response && error.response.status === 403) {
            const rateLimitReset = error.response.headers['x-ratelimit-reset'];
            const retryAfter = rateLimitReset ? new Date(rateLimitReset * 1000) : 'later';
            res.status(429).send(`Rate limit exceeded. Please try again after ${retryAfter}.`);
        } else {
            console.error('Error:', error);
            res.status(500).send('An error occurred while fetching repositories.');
        }
    }
});

module.exports = router;
