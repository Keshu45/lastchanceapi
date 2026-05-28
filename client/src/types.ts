export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  customerEmail: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  resolvedAt: string | null;
  ageMinutes: number;
  slaBreached: boolean;
}

export interface TicketStats {
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  breachedCount: number;
}
