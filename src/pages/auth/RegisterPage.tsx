import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phoneNumber: z.string().min(9, 'Please enter a valid phone number (e.g. +254 700 000 000)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      navigate(returnUrl || '/');
    }
  }, [user, navigate, returnUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
            phone_number: values.phoneNumber.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! Welcome to Kiragu & Mwangi.');
        navigate(returnUrl || '/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-brand-border bg-brand-surface shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-primary">
            <UserPlus className="w-5 h-5 text-brand-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Create an Account</CardTitle>
          <CardDescription>
            Register with Kiragu &amp; Mwangi to schedule site viewings and request property appraisals.
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
                Full Legal Name
              </label>
              <input
                type="text"
                {...register('fullName')}
                placeholder="e.g. John Kamau"
                className={`w-full h-11 px-3.5 rounded-md border text-sm bg-brand-background text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                  errors.fullName ? 'border-rose-400 ring-rose-200' : 'border-brand-border'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-rose-600 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                  Email Address
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  placeholder="+254 700 000 000"
                  className={`w-full h-11 px-3.5 rounded-md border text-sm bg-brand-background text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                    errors.phoneNumber ? 'border-rose-400 ring-rose-200' : 'border-brand-border'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-600 font-medium">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                  Password (min. 8 chars)
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
                  Confirm Password
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
            </div>

            <div className="text-xs text-brand-muted bg-brand-background p-3 rounded-md border border-brand-border flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                Standard client accounts automatically grant viewing reservations and valuation submission rights.
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-light text-white font-medium flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-brand-border pt-4 text-xs text-brand-muted">
          Already registered?{' '}
          <Link
            to={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
            className="ml-1 text-brand-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
