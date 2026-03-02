import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  isAdmin?: boolean
  isActive?: boolean
  fullName?: string
}

export interface UserProfile extends User {
  isAdmin: boolean
  isActive: boolean
  fullName: string
  createdAt: string
  updatedAt: string
}

/**
 * Sign up a new user with email and password
 */
export async function signupUser(email: string, password: string): Promise<{ user: User; error: string | null }> {
  if (!supabase) {
    return { user: { id: '', email: '' }, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.warn('❌ Signup error:', error.message)
      return { user: { id: '', email: '' }, error: error.message }
    }

    if (!data.user) {
      return { user: { id: '', email: '' }, error: 'User creation failed' }
    }

    console.log('✅ User signed up:', data.user.email)
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Signup exception:', err)
    return { user: { id: '', email: '' }, error: message }
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<{ user: User; error: string | null }> {
  if (!supabase) {
    return { user: { id: '', email: '' }, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.warn('❌ Login error:', error.message)
      return { user: { id: '', email: '' }, error: error.message }
    }

    if (!data.user) {
      return { user: { id: '', email: '' }, error: 'Login failed' }
    }

    console.log('✅ User logged in:', data.user.email)
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Login exception:', err)
    return { user: { id: '', email: '' }, error: message }
  }
}

/**
 * Logout the current user
 */
export async function logoutUser(): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.warn('❌ Logout error:', error.message)
      return false
    }

    console.log('✅ User logged out')
    return true
  } catch (err) {
    console.error('❌ Logout exception:', err)
    return false
  }
}

/**
 * Change user password
 */
export async function changePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update password (Supabase handles auth via session)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.warn('❌ Password change error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Password changed successfully')
    return { success: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Password change exception:', err)
    return { success: false, error: message }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    console.error('❌ Supabase not configured')
    return null
  }

  try {
    // Try to get the user from the current session
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Error getting user:', error.message)
      return null
    }

    if (!data.user) {
      console.warn('⚠️  No user in session - trying to get session directly')
      // Try alternative method
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        console.log('✅ Found user via session:', sessionData.session.user.email)
        return {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email || '',
        }
      }
      return null
    }

    console.log('✅ Got current user:', data.user.email)
    return {
      id: data.user.id,
      email: data.user.email || '',
    }
  } catch (err) {
    console.error('❌ Error getting current user:', err)
    return null
  }
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): (() => void) | undefined {
  if (!supabase) return

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
        })
      }
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })

  return data?.subscription?.unsubscribe
}

/**
 * Get user profile with role information
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.warn('❌ Failed to get profile:', error?.message)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      isAdmin: data.is_admin,
      isActive: data.is_active,
      fullName: data.full_name || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (err) {
    console.error('❌ Error getting profile:', err)
    return null
  }
}

/**
 * Get current user's profile with role info
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser()
  if (!user) return null
  return getUserProfile(user.id)
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<UserProfile[] | null> {
  if (!supabase) return null

  try {
    const currentProfile = await getCurrentUserProfile()
    if (!currentProfile || !currentProfile.isAdmin) {
      console.warn('❌ Only admins can view all users')
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('❌ Failed to get users:', error.message)
      return null
    }

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      isActive: user.is_active,
      fullName: user.full_name || '',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }))
  } catch (err) {
    console.error('❌ Error getting users:', err)
    return null
  }
}

/**
 * Assign admin role to user (admin only)
 */
export async function makeUserAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const currentProfile = await getCurrentUserProfile()
    if (!currentProfile || !currentProfile.isAdmin) {
      console.warn('❌ Only admins can assign admin role')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: true, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.warn('❌ Failed to make user admin:', error.message)
      return false
    }

    console.log('✅ User', userId, 'is now an admin')
    return true
  } catch (err) {
    console.error('❌ Error making user admin:', err)
    return false
  }
}

/**
 * Remove admin role from user (admin only)
 */
export async function removeUserAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const currentProfile = await getCurrentUserProfile()
    if (!currentProfile || !currentProfile.isAdmin) {
      console.warn('❌ Only admins can remove admin role')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.warn('❌ Failed to remove admin role:', error.message)
      return false
    }

    console.log('✅ Admin role removed from user', userId)
    return true
  } catch (err) {
    console.error('❌ Error removing admin role:', err)
    return false
  }
}

/**
 * Toggle user active status (admin only)
 */
export async function toggleUserActive(userId: string, isActive: boolean): Promise<boolean> {
  if (!supabase) return false

  try {
    const currentProfile = await getCurrentUserProfile()
    if (!currentProfile || !currentProfile.isAdmin) {
      console.warn('❌ Only admins can toggle user status')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.warn('❌ Failed to toggle user status:', error.message)
      return false
    }

    console.log(`✅ User ${userId} is now ${isActive ? 'active' : 'inactive'}`)
    return true
  } catch (err) {
    console.error('❌ Error toggling user status:', err)
    return false
  }
}

/**
 * Update user profile (admin can update anyone, users can update themselves)
 */
export async function updateUserProfile(
  userId: string,
  fullName: string
): Promise<boolean> {
  if (!supabase) return false

  try {
    const currentUser = await getCurrentUser()
    const currentProfile = await getCurrentUserProfile()

    // Users can only update themselves, admins can update anyone
    if (currentUser?.id !== userId && !currentProfile?.isAdmin) {
      console.warn('❌ Cannot update another user profile')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.warn('❌ Failed to update profile:', error.message)
      return false
    }

    console.log('✅ User profile updated')
    return true
  } catch (err) {
    console.error('❌ Error updating profile:', err)
    return false
  }
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.isAdmin ?? false
}
