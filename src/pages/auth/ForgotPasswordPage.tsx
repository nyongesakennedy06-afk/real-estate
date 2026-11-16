import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-primary">
            <KeyRound className="w-5 h-5 text-brand-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password recovery link.
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
          <Button disabled className="w-full bg-brand-primary opacity-70">
            Send Reset Link (Phase 3)
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t border-brand-border pt-4 text-xs">
          <Link to="/login" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-primary">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
