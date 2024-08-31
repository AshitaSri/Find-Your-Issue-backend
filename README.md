
# GitHub Repository Search API

This project provides a REST API for searching GitHub repositories based on programming languages and star counts. It's built with Node.js and Express, and it's designed to be deployed on Vercel.

## Features

- Search for repositories by programming language(s)
- Filter repositories by minimum and/or maximum star count
- Handles GitHub API rate limiting
- CORS enabled for specified origins

## Prerequisites

- Node.js (v12 or later recommended)
- npm (comes with Node.js)
- A GitHub Personal Access Token

## Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your GitHub Personal Access Token:
   ```
   GITHUB_TOKEN=your_personal_access_token_here
   ```

4. Start the server:
   ```
   node server.js
   ```

The API will be available at `http://localhost:3000`.

## API Usage

### Endpoint

`GET /repos`

### Query Parameters

- `languages`: Comma-separated list of programming languages (e.g., `javascript,python`)
- `minStars`: Minimum number of stars (inclusive)
- `maxStars`: Maximum number of stars (inclusive)

### Example Requests

1. JavaScript repositories with more than 10,000 stars:
   ```
   GET /repos?languages=javascript&minStars=10000
   ```

2. Python and Java repositories with 1,000 to 5,000 stars:
   ```
   GET /repos?languages=python,java&minStars=1000&maxStars=5000
   ```

3. C++ repositories with less than 100 stars:
   ```
   GET /repos?languages=c%2B%2B&maxStars=100
   ```

### Response Format

The API returns a JSON object with two main properties:

1. `repos`: An array of repository objects, each containing:
   - `name`: Repository name
   - `full_name`: Full repository name (username/repo)
   - `html_url`: GitHub URL of the repository
   - `description`: Repository description
   - `stargazers_count`: Number of stars
   - `language`: Primary language of the repository

2. `rateLimit`: Object containing rate limit information:
   - `remaining`: Number of requests remaining in the current rate limit window
   - `resetAt`: ISO 8601 timestamp when the rate limit resets

## Deployment

This project is designed to be deployed on Vercel. To deploy:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Add your `GITHUB_TOKEN` as an environment variable in the Vercel project settings.
4. Deploy the project.

## Rate Limiting

This API uses GitHub's Search API, which has its own rate limits:
- For authenticated requests: 30 requests per minute
- For unauthenticated requests: 10 requests per minute

The API includes rate limit information in each response to help you manage your usage.

## CORS

CORS is enabled for `https://find-your-issue.vercel.app` and `http://localhost:3000`. If you need to allow other origins, update the `corsOptions` in `api/index.js`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
