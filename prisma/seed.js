import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync("./prisma/data.json", "utf-8"));

async function resetDatabase() {
  console.log("Clearing old data...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE 
    "PaperAuthor", 
    "PaperTag", 
    "ProjectTag", 
    "File", 
    "Media", 
    "Event", 
    "Paper", 
    "Project", 
    "Tag", 
    "User"
    RESTART IDENTITY CASCADE;
  `);
  console.log("Database reset ✅");
}

async function main() {
  await resetDatabase();
  console.log("Seeding from JSON...");

  // --- Users ---
  const users = {};
  for (const u of data.users) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: hashed,
        name: u.name,
        department: u.department,
        position: u.position,
        role: u.role,
      },
    });
    users[u.email] = user; // save reference
  }

  // --- Tags ---
  const tags = {};
  for (const t of data.tags) {
    const tag = await prisma.tag.create({ data: { name: t.name } });
    tags[t.name] = tag;
  }

  // --- Projects ---
  const projects = {};
  for (const p of data.projects) {
    const project = await prisma.project.create({
      data: {
        title: p.title,
        summary: p.summary,
        startDate: p.startDate ? new Date(p.startDate) : null,
        endDate: p.endDate ? new Date(p.endDate) : null,
        ownerId: users[p.ownerEmail]?.id,
        tags: {
          create: p.tags.map((tagName) => ({ tagId: tags[tagName].id })),
        },
      },
    });
    projects[p.title] = project;
  }

  // --- Papers ---
  for (const p of data.papers) {
    await prisma.paper.create({
      data: {
        title: p.title,
        abstract: p.abstract,
        date: p.date ? new Date(p.date) : null,
        affiliation: p.affiliation,
        publication: p.publication,
        DOI: p.DOI,
        authors: {
          create: p.authors.map((a) => ({
            userId: users[a.email].id,
            role: a.role,
          })),
        },
        tags: {
          create: p.tags.map((tagName) => ({ tagId: tags[tagName].id })),
        },
        files: {
          create: p.files,
        },
      },
    });
  }

  // --- Events ---
  for (const e of data.events) {
    await prisma.event.create({
      data: {
        title: e.title,
        description: e.description,
        eventDate: e.eventDate ? new Date(e.eventDate) : null,
        projectId: projects[e.projectTitle].id,
      },
    });
  }

  // --- Media ---
  for (const m of data.media) {
    await prisma.media.create({
      data: {
        caption: m.caption,
        url: m.url,
        mime: m.mime,
        projectId: projects[m.projectTitle].id,
      },
    });
  }

  console.log("Seeding finished ✅");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
