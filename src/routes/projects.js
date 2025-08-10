const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// 取得所有專案
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        tags: { include: { tag: true } },
        media: true
      },
      orderBy: { createdAt: 'desc' }  // 也可用 endDate
    });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// 取得特定專案
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        tags: { include: { tag: true } },
        media: true
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// 新增專案
router.post('/', async (req, res) => {
  const { title, summary, startDate, endDate, ownerId, tagNames = [] } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        title,
        summary,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        owner: ownerId ? { connect: { id: ownerId } } : undefined,
        tags: {
          create: tagNames.map(name => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name }
              }
            }
          }))
        }
      },
      include: {
        owner: true,
        tags: { include: { tag: true } },
        media: true
      }
    });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

module.exports = router;
