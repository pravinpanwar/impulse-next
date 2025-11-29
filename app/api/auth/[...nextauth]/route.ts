import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword, getUserByEmail, getUserByUsername } from '@/lib/auth';

const config: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Try to find user by username or email
        let user = await getUserByUsername(credentials.username as string);
        if (!user) {
          user = await getUserByEmail(credentials.username as string);
        }

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password as string, user.password_hash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for Vercel/production deployments
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

export const { GET, POST } = handlers;

