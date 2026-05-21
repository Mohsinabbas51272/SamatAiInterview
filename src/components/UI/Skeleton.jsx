import React from 'react';

export const Skeleton = ({
  className = '',
  circle = false
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/75 ${
        circle ? 'rounded-full' : 'rounded-lg'
      } ${className}`}
    />
  );
};

export const CardSkeleton = () => (
  <div className="glass-panel p-6 rounded-2xl space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12" circle />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-slate-100 animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9" circle />
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
    <td className="px-6 py-4"><Skeleton className="h-8 w-16" /></td>
  </tr>
);
