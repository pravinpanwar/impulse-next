# Production Deployment Guide

## Vercel Environment Variables

You need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **Database Configuration:**
   ```
   DB_HOST=103.190.26.133
   DB_USER=pravin
   DB_PASSWORD=Pravin@2012
   DB_NAME=impulse_db
   ```

2. **NextAuth Configuration:**
   ```
   NEXTAUTH_URL=https://impulse-olive.vercel.app
   NEXTAUTH_SECRET=OsKNAdjipSFbv3KtfJLFyzHrGQ64CNQ16M4f9HL0YrU
   ```
   ⚠️ **Important**: Generate a new secret for production using:
   ```bash
   openssl rand -base64 32
   ```

3. **Node Environment:**
   ```
   NODE_ENV=production
   ```

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments
4. After adding variables, you need to **redeploy** your project for changes to take effect

### Important Notes

- **NEXTAUTH_URL**: Must match your production domain exactly (https://impulse-olive.vercel.app)
- **NEXTAUTH_SECRET**: Use a strong, random secret. Never commit this to git.
- **Database**: Ensure your production database is accessible from Vercel's IP ranges

### Troubleshooting

If login doesn't work in production:

1. ✅ Verify all environment variables are set in Vercel
2. ✅ Check that NEXTAUTH_URL matches your production domain
3. ✅ Ensure database is accessible from Vercel
4. ✅ Clear browser cookies and try again
5. ✅ Check Vercel function logs for errors
6. ✅ Verify NEXTAUTH_SECRET is set and matches between deployments

### Database Connection

If your database requires IP whitelisting, you'll need to allow Vercel's IP ranges. However, Vercel uses dynamic IPs, so consider:

- Using a database that allows connections from anywhere (with proper authentication)
- Using Vercel's serverless functions which may have different IPs
- Setting up a database connection pooler

