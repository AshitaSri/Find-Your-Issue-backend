// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const repoSearchRoute = require('./api/routes/repoSearchRoute');

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'https://find-your-issue.vercel.app'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount the repoSearchRoute at the root, as in your index.js
app.use('/', repoSearchRoute);

app.get("/", (req, res) => res.send("Express on Vercel"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});