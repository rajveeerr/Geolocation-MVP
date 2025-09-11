import prisma from '../src/lib/prisma';

function generateReferralCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

async function getUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode();
    // @ts-ignore schema may not yet include field during generate
    const existing = await prisma.user.findFirst({ where: { referralCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique referral code after 10 attempts');
}

async function main() {
  // @ts-ignore schema pending generate
  const users = await prisma.user.findMany({ where: { OR: [{ referralCode: null }, { referralCode: '' }] }, select: { id: true } });
  console.log(`Found ${users.length} users missing referralCode`);
  for (const u of users) {
    const code = await getUniqueReferralCode();
    // @ts-ignore schema pending generate
    await prisma.user.update({ where: { id: u.id }, data: { referralCode: code } });
    console.log(`Assigned referralCode ${code} to user ${u.id}`);
  }
  console.log('Backfill complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
