import { ClerkExpressWithAuth, createClerkClient } from '@clerk/clerk-sdk-node'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
})

// 1. Clerk Token Verification Middleware
const verifyClerkToken = ClerkExpressWithAuth()

// 2. User Synchronization & Context Middleware
const syncUserContext = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No valid session detected',
      errorCode: 'AUTH_MISSING_SESSION'
    })
  }

  try {
    const clerkId = req.auth.userId

    // Find local user by clerkId first (fastest path)
    let user = await User.findOne({ where: { clerkId } })

    // If not found, sync from Clerk
    if (!user) {
      console.log(`[Auth] User not found locally for Clerk ID: ${clerkId}. Attempting sync...`)

      // Fetch details from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkId)
      const primaryEmailObj = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
      const email = primaryEmailObj ? primaryEmailObj.emailAddress : null

      if (!email) {
        throw new Error('Clerk user has no primary email address')
      }

      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User'

      try {
        // Use findOrCreate to atomically handle race conditions
        const [foundUser, created] = await User.findOrCreate({
          where: { email },
          defaults: {
            clerkId,
            name: fullName,
            role: 'user',
            password: 'CLERK_AUTH_PLACEHOLDER'
          }
        })

        if (created) {
          console.log(`[Auth] Created new user for ${email}`)
        } else {
          // User existed by email but without clerkId — link them
          if (!foundUser.clerkId) {
            console.log(`[Auth] Linking existing user ${email} to Clerk ID ${clerkId}`)
            foundUser.clerkId = clerkId
            await foundUser.save()
          }
        }
        user = foundUser
      } catch (dupError) {
        // Race condition: another concurrent request just created/updated the user
        if (dupError.name === 'SequelizeUniqueConstraintError' || dupError.original?.code === 'ER_DUP_ENTRY') {
          console.log(`[Auth] Race condition on create — retrying lookup for ${email}`)
          user = await User.findOne({ where: { email } })
          if (user && !user.clerkId) {
            user.clerkId = clerkId
            await user.save()
          }
        } else {
          throw dupError
        }
      }
    }

    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed: could not resolve user',
        errorCode: 'AUTH_USER_NOT_RESOLVED'
      })
    }

    // Auto-promote specific emails to Admin (Bootstrap Admin Access)
    const ADMIN_EMAILS = ['danielnunda@gmail.com', 'admin@regil.com']
    if (ADMIN_EMAILS.includes(user.email) && user.role !== 'admin') {
      console.log(`[Auth] Auto-promoting ${user.email} to Admin Role`)
      user.role = 'admin'
      await user.save()

      // Update Clerk metadata so frontend knows immediately
      try {
        await clerkClient.users.updateUserMetadata(clerkId, {
          publicMetadata: { role: 'admin' }
        })
        console.log(`[Auth] Synced admin role to Clerk metadata for ${user.email}`)
      } catch (clerkError) {
        console.error('[Auth] Failed to update Clerk metadata:', clerkError)
      }
    }

    // Attach user to request object
    req.user = user
    next()

  } catch (error) {
    console.error('[Auth] Sync error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication failed during user synchronization',
      errorCode: 'AUTH_SYNC_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Export combined authentication middleware
export const authenticate = [verifyClerkToken, syncUserContext]

// Admin Authorization Middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User context missing',
      errorCode: 'AUTH_CONTEXT_MISSING'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required',
      errorCode: 'AUTH_FORBIDDEN_ADMIN'
    })
  }

  next()
}
