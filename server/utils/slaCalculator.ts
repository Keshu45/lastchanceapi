export const SLA_TARGETS = {
  urgent: 60,
  high: 60 * 4,
  medium: 60 * 24,
  low: 60 * 72,
};

export const calculateDerivedFields = (ticket: any) => {
  const now = new Date();
  const created = new Date(ticket.createdAt);
  const end = ticket.resolvedAt ? new Date(ticket.resolvedAt) : now;

  const ageMs = end.getTime() - created.getTime();
  const ageMinutes = Math.floor(ageMs / 60000);

  const targetMinutes = SLA_TARGETS[ticket.priority as keyof typeof SLA_TARGETS];
  let slaBreached = false;

  if (!ticket.resolvedAt) {
    // Unresolved beyond target
    slaBreached = ageMinutes > targetMinutes;
  } else {
    // Resolved after target
    slaBreached = ageMinutes > targetMinutes;
  }

  // Determine standard object representation from Mongoose document
  const ticketObj = ticket._id ? (typeof ticket.toObject === 'function' ? ticket.toObject() : ticket) : ticket;

  return {
    ...ticketObj,
    ageMinutes,
    slaBreached
  };
};
