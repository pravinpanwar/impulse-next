# Production Login Fix

## Issue
The production server was showing 307 redirects when trying to access `/dashboard`, even though NextAuth session cookies were present.

## Root Cause
The middleware was not correctly reading the NextAuth v5 session cookie name in production. NextAuth v5 uses different cookie names in production (`__Secure-authjs.session-token`) vs development (`authjs.session-token`).

## Solution Applied

### 1. Updated Middleware (`middleware.ts`)
- Added explicit cookie name detection based on environment
- Production (HTTPS): `__Secure-authjs.session-token`
- Development: `authjs.session-token`
- Passes the correct cookie name to `getToken()`

### 2. NextAuth Configuration
- Added `trustHost: true` for Vercel deployments
- Configured secure cookies for HTTPS production environment
- Set proper cookie options (httpOnly, sameSite, secure)

## Required Vercel Environment Variables

Make sure these are set in Vercel dashboard:

```
NEXTAUTH_URL=https://impulse-olive.vercel.app
NEXTAUTH_SECRET=OsKNAdjipSFbv3KtfJLFyzHrGQ64CNQ16M4f9HL0YrU
DB_HOST=103.190.26.133
DB_USER=pravin
DB_PASSWORD=Pravin@2012
DB_NAME=impulse_db
NODE_ENV=production
```

## Testing

After deploying:
1. Clear browser cookies for the Vercel domain
2. Try logging in
3. Check browser console and network tab for errors
4. Verify session cookies are being set with the `__Secure-` prefix

## Additional Notes

- The 307 redirect was happening because middleware couldn't validate the session token
- NextAuth v5 uses JWT tokens stored in cookies
- Secure cookies (with `__Secure-` prefix) require HTTPS and proper configuration

