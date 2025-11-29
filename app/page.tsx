import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  // Check for NextAuth v5 cookie names
  const sessionToken = cookieStore.get('authjs.session-token') 
    || cookieStore.get('__Secure-authjs.session-token')
    || cookieStore.get('next-auth.session-token')
    || cookieStore.get('__Secure-next-auth.session-token');
  
  if (sessionToken) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
