import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-primary">
            <LogIn className="w-5 h-5 text-brand-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Sign in to your account</CardTitle>
          <CardDescription>
            Access your site viewing bookings and valuation requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              disabled
              placeholder="name@example.com"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-brand-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              disabled
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <Button disabled className="w-full bg-brand-primary opacity-70">
            Sign In (Phase 3: Supabase Auth)
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t border-brand-border pt-4 text-xs text-brand-muted">
          Don't have an account?{' '}
          <Link to="/register" className="ml-1 text-brand-primary font-semibold hover:underline">
            Register here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
