import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
        Error 404
      </span>
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-primary mt-2">
        Page Not Found
      </h1>
      <p className="text-brand-muted text-base max-w-md mt-3 mb-8">
        The page or property listing you are seeking might have been moved, renamed, or is currently unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
          <Link to="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="border-brand-border">
          <Link to="/properties" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Properties</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
