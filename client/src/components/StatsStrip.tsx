import React from 'react';
import { TicketStats } from '../types';

export const StatsStrip = ({ stats }: { stats: TicketStats | null }) => {
  if (!stats) return <div className="h-16 animate-pulse bg-gray-100 rounded-lg" />;

  return (
    <div className="flex gap-4 p-4 mb-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">Open</p>
        <p className="text-2xl font-semibold text-gray-900">{stats.byStatus.open}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">In Progress</p>
        <p className="text-2xl font-semibold text-blue-600">{stats.byStatus.in_progress}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">Resolved</p>
        <p className="text-2xl font-semibold text-green-600">{stats.byStatus.resolved}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">Closed</p>
        <p className="text-2xl font-semibold text-gray-400">{stats.byStatus.closed}</p>
      </div>
      <div className="flex-1 pl-4 border-l border-red-100 bg-red-50 -my-4 -mr-4 p-4 rounded-r-xl">
        <p className="text-sm text-red-600 font-medium">Breached SLA</p>
        <p className="text-2xl font-semibold text-red-600">{stats.breachedCount}</p>
      </div>
    </div>
  );
};
