import Joi from 'joi';

export const ticketSchema = Joi.object({
  subject: Joi.string().required(),
  description: Joi.string().required(),
  customerEmail: Joi.string().email().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required()
});

export const ticketUpdateSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').required()
});
