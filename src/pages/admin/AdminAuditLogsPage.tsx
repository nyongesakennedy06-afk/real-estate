import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Security &amp; Compliance
        </span>
        <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
          System Audit Trail
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Immutable, automated log of all administrative actions, data edits, and report generations.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Database trigger level audit logging enabled (Phase 2 &amp; 8).</span>
          </div>
          <Badge variant="outline">Read-Only</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background/70 border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-xs">
                <tr className="hover:bg-brand-background/40">
                  <td className="py-3 px-4 text-brand-muted">Just now</td>
                  <td className="py-3 px-4 font-semibold text-brand-primary">System Initialization</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold">
                      INITIALIZE
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">system</td>
                  <td className="py-3 px-4 text-brand-muted">Phase 1 client scaffolding completed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
