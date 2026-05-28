import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  subject: string;
  description: string;
  customerEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt: Date | null;
}

const TicketSchema: Schema = new Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  customerEmail: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);
