import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      // Send reset password email via Supabase
      const redirectUrl = `${window.location.origin}/reset-password`;
      await supabase.auth.resetPasswordForEmail(values.email.trim(), {
        redirectTo: redirectUrl,
      });

      // Always show neutral message to prevent account probing
      setSubmitted(true);
    } catch (err) {
      // Even on failure, show neutral success to prevent enumeration
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-primary">
            <KeyRound className="w-5 h-5 text-brand-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Password Recovery</CardTitle>
          <CardDescription>
            {submitted
              ? 'Check your inbox for password recovery instructions.'
              : 'Enter your registered email address to receive a secure recovery link.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800">
                If an account with that email exists in our records, a secure link to reset your password has been sent. Please check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className={`w-full h-11 px-3.5 rounded-md border text-sm bg-brand-background text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                    errors.email ? 'border-rose-400 ring-rose-200' : 'border-brand-border'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
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
                    <span>Sending recovery link...</span>
                  </>
                ) : (
                  <span>Send Recovery Link</span>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-brand-border pt-4 text-xs">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-primary font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
