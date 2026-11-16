import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, FileText } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Intelligence &amp; Records
        </span>
        <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
          Exportable Reports
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Generate branded PDF documents and CSV data exports with official firm credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-brand-border bg-brand-surface p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
            <FileText className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-brand-primary">Viewing Appointments</h3>
            <p className="text-xs text-brand-muted">
              Summary of all client bookings, dates, status, and managing surveyor notes.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="text-xs flex-1 flex items-center gap-1.5" disabled>
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </Button>
            <Button size="sm" variant="outline" className="text-xs flex-1 flex items-center gap-1.5" disabled>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </Button>
          </div>
        </Card>

        <Card className="border-brand-border bg-brand-surface p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
            <FileText className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-brand-primary">Valuation Registry</h3>
            <p className="text-xs text-brand-muted">
              Record of parcels, LR numbers, purposes, clients, and completion status.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="text-xs flex-1 flex items-center gap-1.5" disabled>
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </Button>
            <Button size="sm" variant="outline" className="text-xs flex-1 flex items-center gap-1.5" disabled>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </Button>
          </div>
        </Card>

        <Card className="border-brand-border bg-brand-surface p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
            <FileText className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-brand-primary">Property Catalog</h3>
            <p className="text-xs text-brand-muted">
              Current inventory breakdown by residential/commercial category and status.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="text-xs flex-1 flex items-center gap-1.5" disabled>
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </Button>
            <Button size="sm" variant="outline" className="text-xs flex-1 flex items-center gap-1.5" disabled>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
