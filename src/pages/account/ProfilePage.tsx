import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { AccountNav } from '@/components/account/AccountNav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone_number || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone_number: phone.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile details saved.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          Profile Settings
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage your contact information and account security.
        </p>
      </div>

      <AccountNav />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="border-brand-border bg-brand-surface shadow-sm">
          <CardHeader className="border-b border-brand-border pb-3">
            <CardTitle className="text-base font-serif">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-stone-100 text-stone-500 text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                />
              </div>

              <Button
                type="submit"
                disabled={savingProfile}
                className="bg-brand-primary hover:bg-brand-primary-light text-white text-xs h-9"
              >
                {savingProfile ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-brand-border bg-brand-surface shadow-sm">
          <CardHeader className="border-b border-brand-border pb-3">
            <CardTitle className="text-base font-serif">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                />
              </div>

              <Button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="bg-brand-primary hover:bg-brand-primary-light text-white text-xs h-9"
              >
                {savingPassword ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </span>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
