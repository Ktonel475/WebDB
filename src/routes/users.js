const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// 取得所有 User（這裡範例改成取 Users）
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 取得特定 User 詳細資料，包含他參與的 Papers、Projects 等
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        paperAuthors: {
          include: {
            paper: {
              include: {
                tags: { include: { tag: true } },
                files: true
              }
            }
          }
        },
        projects: {
          include: {
            tags: { include: { tag: true } },
            files: true,
            owner: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// 新增 Project（示範用 User 之 ownerId 來建立 Project）
router.post('/projects', async (req, res) => {
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
        tags: { include: { tag: true } },
        owner: true,
        files: true
      }
    });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create project failed', details: err.message });
  }
});

module.exports = router;
