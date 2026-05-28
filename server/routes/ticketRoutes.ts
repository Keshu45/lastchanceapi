import { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicketStats,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController';

const router = Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/stats', getTicketStats);
router.patch('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router;
