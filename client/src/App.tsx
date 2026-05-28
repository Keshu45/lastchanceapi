import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Ticket, TicketStats, Status } from './types';
import { TicketBoard } from './components/TicketBoard';
import { StatsStrip } from './components/StatsStrip';
import { CreateTicketModal } from './components/CreateTicketModal';
import { Plus } from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [breachedFilter, setBreachedFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (priorityFilter) params.append('priority', priorityFilter);
      if (breachedFilter) params.append('breached', 'true');

      const [ticketsRes, statsRes] = await Promise.all([
        api.get('/tickets', { params }),
        api.get('/tickets/stats')
      ]);

      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityFilter, breachedFilter]);

  const handleStatusChange = async (ticketId: string, newStatus: Status) => {
    // Optimistic update
    const previousTickets = [...tickets];
    setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));

    try {
      const { data } = await api.patch(`/tickets/${ticketId}`, { status: newStatus });
      // Update with server computed fields (age, resolvedAt, breached)
      setTickets(current => current.map(t => t._id === ticketId ? data : t));
      // Refresh stats in background
      api.get('/tickets/stats').then(res => setStats(res.data));
    } catch (error) {
      alert('Failed to update ticket status. Ensuring transition rules are met.');
      setTickets(previousTickets); // Revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">DeskFlow Triage</h1>
            <p className="text-gray-500 text-sm">Manage support tickets and SLAs</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* Stats */}
        <StatsStrip stats={stats} />

        {/* Filters */}
        <div className="flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600 px-2">Filters:</span>
          <select
            className="form-select text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0"
              checked={breachedFilter}
              onChange={(e) => setBreachedFilter(e.target.checked)}
            />
            Breached SLA Only
          </label>
        </div>

        {/* Board */}
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <TicketBoard 
                tickets={tickets} 
                onStatusChange={handleStatusChange} 
            />
        )}
        
      </div>

      {isModalOpen && (
        <CreateTicketModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
