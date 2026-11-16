import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export const ValuationRequestPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Survey &amp; Appraisal Department
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
          Request a Property Valuation
        </h1>
        <p className="text-sm text-brand-muted max-w-lg mx-auto">
          Submit your property specifications for certified appraisal by licensed surveyors. (Functional form wired in Phase 5).
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface shadow-sm">
        <CardHeader>
          <CardTitle>Property &amp; Land Particulars</CardTitle>
          <CardDescription>
            Provide accurate details to assist our team in assessing the parcel and scheduling the survey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-md bg-brand-background border border-brand-border text-sm text-brand-ink space-y-2">
            <div className="flex items-center gap-2 font-semibold text-brand-primary">
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              <span>Valuation Request Overview</span>
            </div>
            <p className="text-xs text-brand-muted">
              Fields will include: Property Category (Residential / Commercial), Physical Location, Land Reference (LR) Number, Approximate Size (e.g. 50x100 ft or 0.25 acre), Purpose (Sale, Purchase, Mortgage, Insurance, etc.), and Special Instructions.
            </p>
          </div>
          <Button disabled className="w-full bg-brand-primary opacity-60">
            Form Active in Phase 5 (Requires Sign-In)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
