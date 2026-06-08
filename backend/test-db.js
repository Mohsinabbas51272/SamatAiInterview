const { PrismaClient } = require('@prisma/client');

const configs = [
  // aws-0 on 6543
  {
    name: 'aws-0-ap-south-1.pooler.supabase.com:6543 with tenant user',
    url: 'postgresql://postgres.gkbympgqoooqbmxcxfst:MyShop2026Pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=3'
  },
  {
    name: 'aws-0-ap-south-1.pooler.supabase.com:6543 with simple user',
    url: 'postgresql://postgres:MyShop2026Pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=3'
  },
  // aws-0 on 5432
  {
    name: 'aws-0-ap-south-1.pooler.supabase.com:5432 with tenant user',
    url: 'postgresql://postgres.gkbympgqoooqbmxcxfst:MyShop2026Pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=3'
  },
  {
    name: 'aws-0-ap-south-1.pooler.supabase.com:5432 with simple user',
    url: 'postgresql://postgres:MyShop2026Pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=3'
  },
  // aws-1 on 6543
  {
    name: 'aws-1-ap-south-1.pooler.supabase.com:6543 with tenant user',
    url: 'postgresql://postgres.gkbympgqoooqbmxcxfst:MyShop2026Pass@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=3'
  },
  {
    name: 'aws-1-ap-south-1.pooler.supabase.com:6543 with simple user',
    url: 'postgresql://postgres:MyShop2026Pass@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=3'
  },
  // aws-1 on 5432
  {
    name: 'aws-1-ap-south-1.pooler.supabase.com:5432 with tenant user',
    url: 'postgresql://postgres.gkbympgqoooqbmxcxfst:MyShop2026Pass@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=3'
  },
  {
    name: 'aws-1-ap-south-1.pooler.supabase.com:5432 with simple user',
    url: 'postgresql://postgres:MyShop2026Pass@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=3'
  }
];

async function testConnection(config) {
  console.log(`\nTesting: ${config.name}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`✅ SUCCESS! Connected using: ${config.name}`);
    console.log(`URL: ${config.url}`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message.split('\n')[0]}`);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log('\nFound working connection string! Exiting.');
      process.exit(0);
    }
  }
  console.log('\nAll configurations failed.');
  process.exit(1);
}

run();
