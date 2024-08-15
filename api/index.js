const express = require('express');
const homeRouter = require('./home');

const app = express();

app.use('/', homeRouter);

app.get("/", (req, res) => res.send("Express on Vercel"));

module.exports = app;