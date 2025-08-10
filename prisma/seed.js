const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // create tags
  const [tagAI, tagHistory] = await Promise.all([
    prisma.tag.upsert({ where: { name: 'AI' }, update: {}, create: { name: 'AI' } }),
    prisma.tag.upsert({ where: { name: 'History' }, update: {}, create: { name: 'History' } }),
  ]);

  // create users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice', role: 'author' }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob', role: 'researcher' }
  });

  // create a paper with authors and tags
  const paper = await prisma.paper.create({
    data: {
      title: "Neural Methods in Historical Text Analysis",
      abstract: "Exploring AI models for historical documents...",
      status: "published",
      date: new Date("2024-01-15"),
      authors: {
        create: [
          { userId: alice.id, role: 'corresponding' },
          { userId: bob.id }
        ]
      },
      tags: {
        create: [{ tag: { connect: { id: tagAI.id } } }]
      },
      files: {
        create: [{ filename: 'paper.pdf', url: '/uploads/paper.pdf', mime: 'application/pdf', size: 123456 }]
      }
    }
  });

  // create a historical project
  const project = await prisma.project.create({
    data: {
      title: "Old Town Oral Histories",
      summary: "Collecting interviews and photos about the town's mid-20th century life.",
      startDate: new Date("2023-06-01"),
      owner: { connect: { id: alice.id } },
      tags: {
        create: [{ tag: { connect: { id: tagHistory.id } } }]
      },
      events: {
        create: [
          { title: "Interview with Mrs. Lee", description: "She spoke about the market", eventDate: new Date("1955-04-01") }
        ]
      },
      media: {
        create: [
          { caption: "Market photo", url: "/uploads/market.jpg", mime: "image/jpeg" }
        ]
      }
    }
  });

  console.log("Seed complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
