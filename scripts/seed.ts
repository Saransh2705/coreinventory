import { seedAdminUser } from '../src/lib/actions/auth'

async function runSeed() {
  console.log('🌱 Starting seed process...')
  
  const result = await seedAdminUser()
  
  if (result.success) {
    console.log('✅ Seed completed:', result.message)
  } else {
    console.error('❌ Seed failed:', result.error)
    process.exit(1)
  }
}

runSeed()
