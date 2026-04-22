'use client';

import dynamic from 'next/dynamic';

const DynamicIncentiveModal = dynamic(() => import("./IncentiveModal").then(mod => mod.IncentiveModal), {
  ssr: false,
});

export function ModalWrapper() {
  return <DynamicIncentiveModal />;
}
