const express = require('express');
const cors = require('cors');
const homeRouter = require('./home');


const app = express();
const corsOptions = {
    origin: ['https://find-your-issue.vercel.app', 'http://localhost:3000'],
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));


app.use('/', homeRouter);

app.get("/", (req, res) => res.send("Express on Vercel"));

module.exports = app;
