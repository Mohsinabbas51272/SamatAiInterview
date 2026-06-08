const { PrismaClient } = require('@prisma/client');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ca-central-1',
  'sa-east-1',
  'ap-southeast-2'
];

async function testRegion(region) {
  const url = `postgresql://postgres.gkbympgqoooqbmxcxfst:MyShop2026Pass@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=3`;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`\n🎉 SUCCESS! Connected to region: ${region}`);
    console.log(`Connection URL: ${url}`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`❌ Failed for region ${region}: ${err.message.split('\n')[0]}`);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  console.log('Testing Supabase regions to find the correct pooler...');
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      process.exit(0);
    }
  }
  console.log('Could not find any matching pooler region.');
  process.exit(1);
}

run();
