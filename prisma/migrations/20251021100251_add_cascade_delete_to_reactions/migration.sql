-- DropForeignKey
ALTER TABLE "public"."reactions" DROP CONSTRAINT "reactions_postId_fkey";

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
