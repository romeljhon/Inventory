
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the sales report, as it's the only report for now.
// If more reports are added, this could become a dashboard for all reports.
export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/reports/sales');
  }, [router]);

  return null;
}
