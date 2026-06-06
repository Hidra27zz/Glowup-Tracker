const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.theorySection.findMany({
    include: { subject: true },
    where: {
      title: { contains: 'Chương 8: Kiểu dữ liệu có cấu trúc' }
    }
  });

  for (const s of sections) {
    console.log(`[${s.subject.code}] ${s.title}`);
    console.log(`  Source length: ${s.coreConcept?.length}`);
    console.log(`  Preview: ${s.coreConcept?.substring(0, 150).replace(/\n/g, '')}...`);
  }
}
main();
