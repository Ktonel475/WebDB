-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_paperId_fkey";

-- DropForeignKey
ALTER TABLE "PaperAuthor" DROP CONSTRAINT "PaperAuthor_paperId_fkey";

-- DropForeignKey
ALTER TABLE "PaperTag" DROP CONSTRAINT "PaperTag_paperId_fkey";

-- AddForeignKey
ALTER TABLE "PaperAuthor" ADD CONSTRAINT "PaperAuthor_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTag" ADD CONSTRAINT "PaperTag_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
