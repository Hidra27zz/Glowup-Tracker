const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.theorySection.findMany({
    include: { subject: true },
    where: {
      subject: { code: { in: ['IT005', 'IT007'] } }
    }
  });

  for (const s of sections) {
    console.log(`[${s.subject.code}] ${s.title}`);
    console.log(`  Source: ${s.coreConcept?.substring(0, 80).replace(/\n/g, '')}...`);
  }

  // Clear them
  await prisma.theorySection.updateMany({
    where: {
      subject: { code: { in: ['IT005', 'IT007'] } }
    },
    data: {
      coreConcept: '' // reset to empty so miner can run again or AI can take over
    }
  });
  console.log('Cleared coreConcept for IT005 and IT007');
}
main();
