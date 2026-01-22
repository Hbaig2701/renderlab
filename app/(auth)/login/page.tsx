'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Create client inside handler to avoid build-time execution
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError(null);

    // Create client inside handler to avoid build-time execution
    const supabase = createClient();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'testuser@gmail.com',
        password: 'testpass123',
      });

      if (signInError) {
        // Create test account if it doesn't exist
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'testuser@gmail.com',
          password: 'testpass123',
        });

        if (signUpError) {
          setError(`Sign up failed: ${signUpError.message}`);
          setLoading(false);
          return;
        }

        // Try signing in again after signup
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: 'testuser@gmail.com',
          password: 'testpass123',
        });

        if (retryError) {
          setError(`Login failed: ${retryError.message}`);
          setLoading(false);
          return;
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl text-center">Welcome back</CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* DEV ONLY - Remove before production */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            onClick={handleQuickLogin}
            disabled={loading}
          >
            [DEV] Quick Login
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
