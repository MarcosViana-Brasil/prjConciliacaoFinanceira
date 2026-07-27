import type { ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import styles from './DashboardSummary.module.css';

export function DashboardMetricCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <Card className={`${styles.selectedCard} overflow-hidden`}>
      <CardBody>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-blue-100/80">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
          {icon ? <div className="text-cyan-300 drop-shadow-[0_0_10px_rgba(0,195,255,0.65)]">{icon}</div> : null}
        </div>
      </CardBody>
    </Card>
  );
}
