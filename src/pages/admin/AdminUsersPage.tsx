import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Access Control
        </span>
        <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
          User &amp; Role Management
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage user accounts, promote administrators, and configure account active states.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-brand-background text-sm"
            />
          </div>
          <Badge variant="outline">Total Users: 28</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background/70 border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                <tr className="hover:bg-brand-background/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-primary">Lead Surveyor</td>
                  <td className="py-3 px-4">admin@kiraguandmwangi.co.ke</td>
                  <td className="py-3 px-4">
                    <Badge variant="accent">admin</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-700 text-xs font-semibold">Active</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-brand-muted">Current Session</span>
                  </td>
                </tr>
                <tr className="hover:bg-brand-background/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-primary">Alice Wanjiku</td>
                  <td className="py-3 px-4">alice.w@example.com</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">user</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-700 text-xs font-semibold">Active</span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Make Admin
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-rose-600">
                      Deactivate
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
