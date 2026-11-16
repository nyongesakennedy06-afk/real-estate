import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-primary">
            <Lock className="w-5 h-5 text-brand-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Set New Password</CardTitle>
          <CardDescription>
            Enter your new secure password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              disabled
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              disabled
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <Button disabled className="w-full bg-brand-primary opacity-70">
            Update Password (Phase 3)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
