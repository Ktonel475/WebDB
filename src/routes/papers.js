const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/papers  (list with authors & tags)
router.get('/', async (req, res) => {
  const papers = await prisma.paper.findMany({
    include: {
      authors: { include: { user: true } },
      tags: { include: { tag: true } },
      files: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(papers);
});

// GET /api/papers/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      authors: { include: { user: true } },
      tags: { include: { tag: true } },
      files: true
    }
  });
  if (!paper) return res.status(404).json({ error: 'Not found' });
  res.json(paper);
});

// POST /api/papers
// body: { title, abstract, date, authorIds: [1,2], tagNames: ['AI'] }
router.post('/', async (req, res) => {
  const { title, abstract, date, authorIds = [], tagNames = [] } = req.body;
  try {
    const paper = await prisma.paper.create({
      data: {
        title,
        abstract,
        date: date ? new Date(date) : undefined,
        authors: {
          create: authorIds.map(uid => ({ user: { connect: { id: uid } } }))
        },
        tags: {
          create: tagNames.map(name => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } }
          }))
        }
      },
      include: {
        authors: { include: { user: true } },
        tags: { include: { tag: true } }
      }
    });
    res.status(201).json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

module.exports = router;
