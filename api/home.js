// home.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/repos', async (req, res) => {
    try {
        const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
                q: 'stars:>1',
                sort: 'stars',
                order: 'desc',
                per_page: 10,
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json',
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
        console.error('Error:', error);
        res.status(500).send('An error occurred while fetching repositories.');
    }
});

module.exports = router;
