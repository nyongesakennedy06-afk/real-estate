import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      toast.success('Password updated successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Please request a new recovery link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-primary">
            <Lock className="w-5 h-5 text-brand-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Set New Password</CardTitle>
          <CardDescription>
            Enter a secure password of at least 8 characters for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className={`w-full h-11 px-3.5 rounded-md border text-sm bg-brand-background text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                  errors.password ? 'border-rose-400 ring-rose-200' : 'border-brand-border'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className={`w-full h-11 px-3.5 rounded-md border text-sm bg-brand-background text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                  errors.confirmPassword ? 'border-rose-400 ring-rose-200' : 'border-brand-border'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-600 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-light text-white font-medium flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
