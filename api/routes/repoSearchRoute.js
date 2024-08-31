// api/routes/repoSearchRoute.js
const express = require('express');
const githubApiService = require('../services/githubApiService');
const router = express.Router();

function validateQuery(query) {
    if (query.length > 256) return false;
    const operatorCount = (query.match(/AND|OR|NOT/g) || []).length;
    return operatorCount <= 5;
}

function buildQueryString(languages, minStars, maxStars) {
    let queryString = 'is:public';
    if (languages) {
        const languageArray = languages.split(',');
        queryString += ` language:${languageArray.join(' language:')}`;
    }
    if (minStars && maxStars) {
        queryString += ` stars:${minStars}..${maxStars}`;
    } else if (minStars) {
        queryString += ` stars:>=${minStars}`;
    } else if (maxStars) {
        queryString += ` stars:<=${maxStars}`;
    }
    return queryString;
}

router.get('/repos', async (req, res, next) => {
    try {
        const { languages, minStars, maxStars } = req.query;
        const queryString = buildQueryString(languages, minStars, maxStars);

        if (!validateQuery(queryString)) {
            return res.status(400).json({ error: 'Query is too long or has too many operators' });
        }

        const { repos, rateLimit } = await githubApiService.searchRepositories(queryString);

        res.json({
            repos: repos.map(repo => ({
                name: repo.name,
                full_name: repo.full_name,
                html_url: repo.html_url,
                description: repo.description,
                stargazers_count: repo.stargazers_count,
                language: repo.language,
            })),
            rateLimit
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;