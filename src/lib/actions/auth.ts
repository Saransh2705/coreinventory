'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Database, UserRole } from '@/types/supabase'
import { sendInviteEmail, sendResendInviteEmail, sendResetPasswordEmail } from '@/lib/email'

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
export async function inviteUser(email: string, fullName: string, role: UserRole, warehouseId?: string) {
  try {
    // Check if current user has permission
    const canInvite = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canInvite) {
      return { success: false, error: 'Unauthorized: Only admins and managers can invite users' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    // Create user without sending Supabase's default email
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        role: role,
        warehouse_id: warehouseId || null,
      },
    })

    if (error) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message }
    }

    // Update the profile with warehouse_id if provided
    if (warehouseId && data?.user?.id) {
      await adminClient
        .from('profiles')
        .update({ warehouse_id: warehouseId })
        .eq('id', data.user.id)
    }

    // Generate a password reset link (so user sets their password)
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-password`,
      },
    })

    if (linkError) {
      console.error('Error generating invite link:', linkError)
      return { success: false, error: linkError.message }
    }

    // Send email via Resend
    const link = linkData?.properties?.action_link
    if (link) {
      await sendInviteEmail(email, fullName, link)
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

/**
 * List all warehouses
 */
export async function listWarehouses() {
  try {
    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)
    const { data: warehouses, error } = await adminClient
      .from('warehouses')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error listing warehouses:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: warehouses }
  } catch (error) {
    console.error('Unexpected error in listWarehouses:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Resend invite to a user who hasn't verified yet
 */
export async function resendInvite(userId: string, email: string) {
  try {
    const canInvite = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canInvite) {
      return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    // Generate a recovery link without sending Supabase's default email
    const { data: linkData, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-password`,
      },
    })

    if (error) {
      console.error('Error generating resend link:', error)
      return { success: false, error: error.message }
    }

    // Send email via Resend
    const link = linkData?.properties?.action_link
    if (link) {
      await sendResendInviteEmail(email, link)
    }

    return { success: true, message: 'Invitation resent successfully' }
  } catch (error) {
    console.error('Unexpected error in resendInvite:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Toggle disable/enable a user
 */
export async function toggleDisableUser(userId: string, disable: boolean) {
  try {
    const canManage = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canManage) {
      return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    if (disable) {
      // Ban the user indefinitely
      const { error: banError } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: '876000h', // ~100 years
      })
      if (banError) {
        return { success: false, error: banError.message }
      }
    } else {
      // Unban
      const { error: unbanError } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      })
      if (unbanError) {
        return { success: false, error: unbanError.message }
      }
    }

    // Update profile disabled flag
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ disabled: disable })
      .eq('id', userId)

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    return { success: true, message: `User ${disable ? 'disabled' : 'enabled'} successfully` }
  } catch (error) {
    console.error('Unexpected error in toggleDisableUser:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Send password reset link to a user (admin-triggered)
 */
export async function sendPasswordReset(userId: string, email: string) {
  try {
    const canManage = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canManage) {
      return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    const { data: linkData, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const link = linkData?.properties?.action_link
    if (link) {
      await sendResetPasswordEmail(email, link)
    }

    return { success: true, message: 'Password reset link sent successfully' }
  } catch (error) {
    console.error('Unexpected error in sendPasswordReset:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Delete a user permanently
 */
export async function deleteUser(userId: string) {
  try {
    const canManage = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canManage) {
      return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    // Delete from auth (cascade should handle profile via trigger/FK)
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Unexpected error in deleteUser:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Update a user's role (and optionally warehouse)
 */
export async function updateUserRole(userId: string, role: UserRole, warehouseId?: string | null) {
  try {
    const canManage = await hasRole(['System Admin', 'Warehouse Manager'])
    if (!canManage) {
      return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    const needsWarehouse = role === 'Warehouse Manager' || role === 'Warehouse Staff'

    const { error } = await adminClient
      .from('profiles')
      .update({
        role,
        warehouse_id: needsWarehouse ? warehouseId : null,
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Also update user_metadata
    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { role, warehouse_id: needsWarehouse ? warehouseId : null },
    })

    return { success: true, message: 'User role updated successfully' }
  } catch (error) {
    console.error('Unexpected error in updateUserRole:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
