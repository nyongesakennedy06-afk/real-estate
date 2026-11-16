import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export const AdminValuationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Survey Division
        </span>
        <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
          Valuation Requests
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Review submitted property details, assign surveyors, and update appraisal progress.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by LR number or client..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <Badge variant="outline">3 Unreviewed</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background/70 border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Parcel / LR No.</th>
                  <th className="py-3 px-4">Category &amp; Size</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {[1, 2].map((item) => (
                  <tr key={item} className="hover:bg-brand-background/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand-primary">David Kariuki</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-brand-ink">LR 209/14352</div>
                      <div className="text-xs text-brand-muted">Upper Hill</div>
                    </td>
                    <td className="py-3 px-4">Commercial &middot; Approx. 0.5 Acre</td>
                    <td className="py-3 px-4">Mortgage Security</td>
                    <td className="py-3 px-4">
                      <Badge variant="pending">Submitted</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="text-xs">
                        Review Job
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
