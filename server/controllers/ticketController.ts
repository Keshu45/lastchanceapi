import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket';
import { ticketSchema, ticketUpdateSchema } from '../validators/ticketValidator';
import { calculateDerivedFields } from '../utils/slaCalculator';

const allowedTransitions = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved']
};

const checkDB = () => mongoose.connection.readyState === 1;

export const createTicket = async (req: Request, res: Response): Promise<any> => {
  if (!checkDB()) return res.status(503).json({ error: 'MongoDB not configured. Add MONGODB_URI to variables.' });
  try {
    const { error } = ticketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { subject, description, customerEmail, priority } = req.body;
    let ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();
    
    // Add computed fields
    return res.status(201).json(calculateDerivedFields(ticket));
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<any> => {
  if (!checkDB()) return res.json([]);
  try {
    const { status, priority, breached } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    
    // Compute derived fields for all tickets
    const computedTickets = tickets.map(calculateDerivedFields);

    // Apply breached filter AFTER calculation if requested
    if (breached === 'true') {
      const filtered = computedTickets.filter(t => t.slaBreached);
      return res.json(filtered);
    }

    return res.json(computedTickets);
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<any> => {
  if (!checkDB()) return res.status(503).json({ error: 'MongoDB not configured.' });
  try {
    const { id } = req.params;
    const { error } = ticketUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newStatus = req.body.status as 'open' | 'in_progress' | 'resolved' | 'closed';
    
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const currentStatus = ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed';

    // Validate transition
    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({ 
        error: `Invalid transition from ${currentStatus} to ${newStatus}` 
      });
    }

    ticket.status = newStatus;
    
    // Manage resolvedAt
    if (newStatus === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (currentStatus === 'resolved' && newStatus !== 'resolved') {
      ticket.resolvedAt = null;
    }

    await ticket.save();
    return res.json(calculateDerivedFields(ticket));
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' });
  }
};

export const deleteTicket = async (req: Request, res: Response): Promise<any> => {
  if (!checkDB()) return res.status(503).json({ error: 'MongoDB not configured.' });
  try {
    const { id } = req.params;
    const deleted = await Ticket.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Ticket not found' });
    return res.json({ message: 'Ticket deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' });
  }
};

export const getTicketStats = async (req: Request, res: Response): Promise<any> => {
  if (!checkDB()) {
    return res.json({
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
      breachedCount: 0
    });
  }
  try {
    const allTickets = await Ticket.find();
    
    const stats = {
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
      breachedCount: 0
    };

    allTickets.forEach(t => {
      const computed = calculateDerivedFields(t);
      stats.byStatus[t.status as keyof typeof stats.byStatus]++;
      stats.byPriority[t.priority as keyof typeof stats.byPriority]++;
      if (computed.slaBreached && (t.status === 'open' || t.status === 'in_progress')) {
        stats.breachedCount++;
      }
    });

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' });
  }
};
