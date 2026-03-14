import { seedAdminUser } from '@/lib/actions/auth'

/**
 * Initialize the application on first run
 * This function should be called during app startup
 */
export async function initializeApp() {
  console.log('🚀 Initializing application...')
  
  // Seed admin user
  const seedResult = await seedAdminUser()
  
  if (seedResult.success) {
    console.log('✅ Application initialized successfully')
  } else {
    console.error('❌ Application initialization failed:', seedResult.error)
  }
  
  return seedResult
}
