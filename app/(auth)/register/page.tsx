'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Zap } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <Brain className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8" />
            <span className="font-mono text-blue-500 font-bold text-base sm:text-xl md:text-2xl tracking-widest">
              IMPULSE_PROTOCOL_V3
            </span>
          </div>
          <p className="text-gray-500 font-mono text-xs sm:text-sm">Create Account</p>
        </div>

        <div className="bg-black/60 border-2 border-gray-800 p-4 sm:p-6 md:p-8 rounded-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-2.5 sm:p-3 rounded font-mono text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] sm:text-xs font-mono text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-700 text-white text-sm sm:text-base p-2.5 sm:p-3 rounded font-mono outline-none focus:border-blue-500 transition-all"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-mono text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-700 text-white text-sm sm:text-base p-2.5 sm:p-3 rounded font-mono outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-mono text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-700 text-white text-sm sm:text-base p-2.5 sm:p-3 rounded font-mono outline-none focus:border-blue-500 transition-all"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-mono text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-700 text-white text-sm sm:text-base p-2.5 sm:p-3 rounded font-mono outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 sm:py-3.5 rounded transition-all uppercase tracking-widest font-mono flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <Zap size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 font-mono text-xs sm:text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 underline touch-manipulation">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

