// api/routes/repoSearchRoute.js
const express = require('express');
const githubApiService = require('../services/githubApiService');
const router = express.Router();

function validateQuery(query) {
    if (query.length > 256) return false;
    const operatorCount = (query.match(/AND|OR|NOT/g) || []).length;
    return operatorCount <= 5;
}

function getLastTwoMonthsDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 2);
    return date.toISOString().split('T')[0];
}

function buildQueryString(languages, maxStars) {
    const lastTwoMonths = getLastTwoMonthsDate();
    let queryString = 'is:public';
    
    // Add language filter
    if (languages) {
        const languageArray = languages.split(',');
        queryString += ` language:${languageArray.join(' language:')}`;
    }
    
    // Add max stars filter if specified
    if (maxStars) {
        queryString += ` stars:<=${maxStars}`;
    }
    
    // Add filter for issues created in the last two months
    queryString += ` created:>=${lastTwoMonths}`;
    
    // Ensure the repository has open issues
    queryString += ' is:issue is:open';
    
    return queryString;
}

router.get('/repos', async (req, res, next) => {
    try {
        const { languages, maxStars, page = 1, per_page = 100 } = req.query;
        const queryString = buildQueryString(languages, maxStars);
        
        if (!validateQuery(queryString)) {
            return res.status(400).json({ error: 'Query is too long or has too many operators' });
        }
        
        const { repos, totalCount, currentPage, hasNextPage, rateLimit } = 
            await githubApiService.searchRepositories(queryString, parseInt(page), parseInt(per_page));
        
        res.json({
            repos: repos.map(repo => ({
                name: repo.name,
                full_name: repo.full_name,
                html_url: repo.html_url,
                description: repo.description,
                stargazers_count: repo.stargazers_count,
                language: repo.language,
                open_issues_count: repo.open_issues_count,
                created_at: repo.created_at,
                updated_at: repo.updated_at
            })),
            pagination: {
                totalCount,
                currentPage,
                hasNextPage,
                itemsPerPage: parseInt(per_page)
            },
            rateLimit
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;