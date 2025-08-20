const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const papersExample = [
  {
    title: "A Study on Quantum Algorithms",
    authors: [{ name: "Alice" }, { name: "Bob" }],
    year: 2024,
    tags: ["Quantum", "Algorithms", "Research"],
    abstract:
      "This paper explores the latest developments in quantum computing...",
  },
  {
    title: "Machine Learning in Healthcare",
    authors: [{ name: "Charlie" }],
    year: 2023,
    tags: ["ML", "Healthcare", "AI"],
    abstract:
      "An overview of machine learning applications in modern healthcare...",
  },
  {
    title: "Blockchain and Security",
    authors: [{ name: "Dave" }, { name: "Eve" }],
    year: 2025,
    tags: ["Blockchain", "Security"],
    abstract:
      "Discusses blockchain technologies and their security implications...",
  },
  {
    title: "Neural Networks for Image Recognition",
    authors: [{ name: "Frank" }],
    year: 2022,
    tags: ["AI", "Computer Vision"],
    abstract:
      "A detailed study on convolutional neural networks for image tasks...",
  },
  {
    title: "Natural Language Processing Trends",
    authors: [{ name: "Grace" }, { name: "Heidi" }],
    year: 2024,
    tags: ["NLP", "AI", "Linguistics"],
    abstract:
      "Covers emerging research in natural language understanding and generation...",
  },
  {
    title: "Cybersecurity Threat Detection",
    authors: [{ name: "Ivan" }],
    year: 2021,
    tags: ["Cybersecurity", "Detection"],
    abstract:
      "Methods and models for early detection of cyber threats in networks...",
  },
];

// Departments + roles for authors
const authorDetails = {
  Alice: { role: "author", department: "Quantum Computing Lab" },
  Bob: { role: "researcher", department: "Computer Science Dept." },
  Charlie: { role: "author", department: "Healthcare AI Center" },
  Dave: { role: "author", department: "Blockchain Institute" },
  Eve: { role: "co-author", department: "Cybersecurity Research Lab" },
  Frank: { role: "author", department: "Computer Vision Group" },
  Grace: { role: "author", department: "NLP Research Unit" },
  Heidi: { role: "co-author", department: "AI Language Institute" },
  Ivan: { role: "author", department: "Cybersecurity Division" },
};

async function main() {
  console.log("Clearing old data...");
  await prisma.event.deleteMany();
  await prisma.media.deleteMany();
  await prisma.file.deleteMany();
  await prisma.paperAuthor.deleteMany();
  await prisma.paperTag.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Event" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Media" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "File" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "PaperAuthor" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "PaperTag" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "ProjectTag" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Project" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Paper" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Tag" RESTART IDENTITY CASCADE;`
  );

  // Create Tags
  const uniqueTags = [...new Set(papersExample.flatMap((p) => p.tags))];
  const tagRecords = {};
  for (const tag of uniqueTags) {
    tagRecords[tag] = await prisma.tag.create({ data: { name: tag } });
  }

  // Create Users
  const uniqueAuthors = [
    ...new Set(papersExample.flatMap((p) => p.authors.map((a) => a.name))),
  ];
  const authorRecords = {};
  for (const author of uniqueAuthors) {
    const details = authorDetails[author] || {
      role: "author",
      department: "Independent",
    };
    const email = `${author.toLowerCase()}@example.com`;
    authorRecords[author] = await prisma.user.create({
      data: {
        name: author,
        email,
        role: details.role,
        department: details.department,
      },
    });
  }

  // Create Papers
  for (const paper of papersExample) {
    await prisma.paper.create({
      data: {
        title: paper.title,
        abstract: paper.abstract,
        status: "published",
        date: new Date(`${paper.year}-01-01`),
        authors: {
          create: paper.authors.map((a, idx) => ({
            userId: authorRecords[a.name].id,
            role: idx === 0 ? "corresponding" : "co-author",
          })),
        },
        tags: {
          create: paper.tags.map((t) => ({
            tag: { connect: { id: tagRecords[t].id } },
          })),
        },
        files: {
          create: [
            {
              filename: `${paper.title.replace(/\s+/g, "_")}.pdf`,
              url: `/uploads/${paper.title.replace(/\s+/g, "_")}.pdf`,
              mime: "application/pdf",
              size: 123456,
            },
          ],
        },
      },
    });
  }

  // Create a sample Project with Events + Media + Tags + Files
  const project = await prisma.project.create({
    data: {
      title: "AI for Social Good",
      summary: "Research project applying AI to solve societal challenges.",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2025-06-01"),
      owner: { connect: { id: authorRecords["Alice"].id } },
      tags: {
        create: [{ tag: { connect: { id: tagRecords["AI"].id } } }],
      },
      events: {
        create: [
          {
            title: "Kickoff Meeting",
            description: "Initial discussion of research goals and tasks",
            eventDate: new Date("2023-06-15"),
          },
          {
            title: "Workshop on AI Ethics",
            description: "Exploring ethical implications of AI applications",
            eventDate: new Date("2024-03-10"),
          },
        ],
      },
      media: {
        create: [
          {
            caption: "Team Photo",
            url: "/uploads/team.jpg",
            mime: "image/jpeg",
          },
          {
            caption: "Whiteboard Session",
            url: "/uploads/whiteboard.png",
            mime: "image/png",
          },
        ],
      },
      files: {
        create: [
          {
            filename: "project_proposal.pdf",
            url: "/uploads/project_proposal.pdf",
            mime: "application/pdf",
            size: 234567,
          },
        ],
      },
    },
  });

  console.log("Seeding complete! Project created:", project.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
