require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./src/routes/users');
const papersRouter = require('./src/routes/papers');
const projectsRouter = require('./src/routes/projects');

const app = express();
app.use(cors());
app.use(express.json());

// mount routers
app.use('/api/users', usersRouter);
app.use('/api/papers', papersRouter);
app.use('/api/projects', projectsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
