import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building } from 'lucide-react';

export const AdminListingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Inventory Management
          </span>
          <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
            Properties Portfolio
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Manage all residential and commercial property listings, images, and statuses.
          </p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-primary-light flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Button>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Total: 12</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background/70 border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="hover:bg-brand-background/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-brand-border/40 flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-brand-muted" />
                      </div>
                      <div>
                        <div className="font-semibold text-brand-primary">Executive Villa {item}</div>
                        <div className="text-xs text-brand-muted">Lavington, Nairobi</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">Sale &middot; Residential</td>
                    <td className="py-3 px-4 font-semibold">KES 45,000,000</td>
                    <td className="py-3 px-4">
                      <Badge variant="confirmed">Available</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">Delete</Button>
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
