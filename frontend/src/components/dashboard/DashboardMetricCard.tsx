import type { ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/Card';

export function DashboardMetricCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          </div>
          {icon ? <div className="text-emerald-700">{icon}</div> : null}
        </div>
      </CardBody>
    </Card>
  );
}
