const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// GET /api/papers  (list with authors & tags)
router.get("/", async (req, res) => {
  const papers = await prisma.paper.findMany({
    include: {
      authors: { include: { user: true } },
      tags: { include: { tag: true } },
      files: true,
    },
    orderBy: { id: "asc" },
  });
  res.json(papers);
});

router.get("/years", async (req, res) => {
  const years = await prisma.paper.findMany({
    select: {
      date: true,
    },
  });
  const uniqueYears = [
    ...new Set(years.map((paper) => paper.date.getFullYear())),
  ];
  res.json(uniqueYears);
});

router.get("/authors", async (req, res) => {
  const authors = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  res.json(authors);
});

router.get("/newID", async (req, res) => {
  const paper = await prisma.paper.findFirst({
    orderBy: { id: "desc" },
  });
  const newId = paper ? paper.id + 1 : 1;
  res.json({ id: newId });
});

router.get("/tags", async (req, res) => {
  const tags = await prisma.tag.findMany();
  res.json(tags);
});

router.get("/search", async (req, res) => {
  const {
    query = "",
    year,
    sort = "relevance",
    filters: filtersStr,
  } = req.query;

  let filters = {};
  if (filtersStr) {
    try {
      filters = JSON.parse(filtersStr);
    } catch (e) {
      console.error("Invalid filters JSON", e);
    }
  }

  const where = { AND: [] };

  if (filters.title) {
    where.AND.push({ title: { contains: filters.title, mode: "insensitive" } });
  }
  if (filters.tag) {
    where.AND.push({
      tags: {
        some: { tag: { name: { contains: filters.tag, mode: "insensitive" } } },
      },
    });
  }
  if (filters.author) {
    where.AND.push({
      authors: {
        some: {
          user: { name: { contains: filters.author, mode: "insensitive" } },
        },
      },
    });
  }
  if (year && !isNaN(Number(year))) {
    const start = new Date(Number(year), 0, 1); // Jan 1st
    const end = new Date(Number(year) + 1, 0, 1); // Jan 1st next year
    where.AND.push({
      date: {
        gte: start,
        lt: end, // less than next year's Jan 1
      },
    });
  }
  if (query) {
    where.AND.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { abstract: { contains: query, mode: "insensitive" } },
        {
          tags: {
            some: { tag: { name: { contains: query, mode: "insensitive" } } },
          },
        },
      ],
    });
  }

  let orderBy = {};
  switch (sort) {
    case "year_asc":
      orderBy = { date: "asc" };
      break;
    case "year_desc":
      orderBy = { date: "desc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "title_desc":
      orderBy = { title: "desc" };
      break;
    default:
      orderBy = {};
  }

  try {
    const papers = await prisma.paper.findMany({
      where: where.AND.length > 0 ? where : undefined,
      include: {
        authors: { include: { user: true } },
        tags: { include: { tag: true } },
        files: true,
      },
      orderBy: Object.keys(orderBy).length ? orderBy : undefined,
    });
    res.json(papers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router
  .route("/:id")
  .get(async (req, res) => {
    const id = Number(req.params.id);
    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        authors: { include: { user: true } },
        tags: { include: { tag: true } },
        files: true,
      },
    });
    if (!paper) return res.status(404).json({ error: "Not found" });
    res.json(paper);
  })
  .patch(async (req, res) => {
    const id = Number(req.params.id);
    const { title, abstract, date } = req.body;
    try {
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (abstract !== undefined) updateData.abstract = abstract;
      if (date !== undefined) updateData.date = new Date(date);

      if (authorIds !== undefined) {
        updateData.authors = {
          deleteMany: {},
          create: authorIds.map((uid) => ({
            user: { connect: { id: uid } },
          })),
        };
      }

      if (tagNames !== undefined) {
        updateData.tags = {
          deleteMany: {},
          create: tagNames.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        };
      }

      const paper = await prisma.paper.update({
        where: { id },
        data: updateData,
        include: {
          authors: { include: { user: true } },
          tags: { include: { tag: true } },
          files: true,
        },
      });

      res.json(paper);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Update failed", details: err.message });
    }
  });

router.post("/", async (req, res) => {
  const { title, abstract, date, authorIds = [], tagNames = [] } = req.body;
  try {
    const paper = await prisma.paper.create({
      data: {
        title,
        abstract,
        date: date ? new Date(date) : undefined,
        authors: {
          create: authorIds.map((uid) => ({ user: { connect: { id: uid } } })),
        },
        tags: {
          create: tagNames.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: {
        authors: { include: { user: true } },
        tags: { include: { tag: true } },
      },
    });
    res.status(201).json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create failed", details: err.message });
  }
});

router.post("/user", async (req, res) => {
  const { name, email, password, department, role, position } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash: hashedPassword,
        department: department || null,
        role: role || "USER",
        position: position || null,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Create failed", details: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.paper.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

module.exports = router;
