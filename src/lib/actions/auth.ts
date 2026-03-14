'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Database, UserRole } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Seed admin user - idempotent function that creates admin user if not exists
 * This should be called on application initialization
 */
export async function seedAdminUser() {
  try {
    // Create admin client with service role key
    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    const adminEmail = 'admin@primexmeta.com'
    const adminPassword = 'Admin@000'

    // Check if admin user already exists
    const { data: existingUser, error: fetchError } = await adminClient.auth.admin.listUsers()

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return { success: false, error: fetchError.message }
    }

    const adminExists = existingUser?.users?.some((user: any) => user.email === adminEmail) || false

    if (adminExists) {
      console.log('Admin user already exists, skipping seed.')
      return { success: true, message: 'Admin user already exists' }
    }

    // Create admin user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator',
        role: 'System Admin',
      },
    })

    if (createError) {
      console.error('Error creating admin user:', createError)
      return { success: false, error: createError.message }
    }

    console.log('Admin user created successfully:', newUser.user?.email)
    return { success: true, message: 'Admin user created successfully' }
  } catch (error) {
    console.error('Unexpected error in seedAdminUser:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Get current user profile with role information
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    ...profile,
  }
}

/**
 * Check if user has specific role(s)
 */
export async function hasRole(roles: UserRole | UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const roleArray = Array.isArray(roles) ? roles : [roles]
  return roleArray.includes(user.role)
}

/**
 * Invite a new user (sends magic link)
 */
export async function inviteUser(email: string, fullName: string, role: UserRole) {
  try {
    // Check if current user has permission
    const canInvite = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canInvite) {
      return { success: false, error: 'Unauthorized: Only admins and managers can invite users' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    // Create user with invite
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-password`,
    })

    if (error) {
      console.error('Error inviting user:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: 'User invitation sent successfully', data }
  } catch (error) {
    console.error('Unexpected error in inviteUser:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * List all users (admin/manager only)
 */
export async function listUsers() {
  try {
    const canView = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canView) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()
    const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

    if (error) {
      console.error('Error listing users:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: profiles }
  } catch (error) {
    console.error('Unexpected error in listUsers:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
