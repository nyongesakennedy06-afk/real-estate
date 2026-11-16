import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Account Settings
        </span>
        <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
          Personal Profile
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage your contact information and account security.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Your email is managed securely via authentication. Full name and phone number can be updated here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              disabled
              defaultValue="John Doe"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              defaultValue="john.doe@example.com"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background/60 text-brand-muted text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="tel"
              disabled
              defaultValue="+254 712 345 678"
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Account Role
            </label>
            <div className="flex items-center gap-2 text-sm text-brand-primary font-medium">
              <Shield className="w-4 h-4 text-brand-accent" />
              <span>Standard User (Client)</span>
            </div>
          </div>
          <Button disabled className="bg-brand-primary opacity-60">
            Save Changes (Phase 5)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
