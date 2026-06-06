const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.theorySection.updateMany({
    data: {
      coreConcept: '' // Reset all content to empty so the auto-miner picks it up
    }
  });
  console.log(`Purged ${result.count} theory sections. They are now ready to be re-mined with AI Professor Mode.`);
}
main();
