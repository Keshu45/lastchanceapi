import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Ticket } from '../types';
import { AlertCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const priorityColors = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const formatAge = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

interface Props {
  ticket: Ticket;
  index: number;
}

export const TicketCard = ({ ticket, index }: Props) => {
  return (
    <Draggable 
      draggableId={ticket._id} 
      index={index}
      isDragDisabled={false}
      disableInteractiveElementBlocking={false}
      shouldRespectForcePress={false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx(
            "p-4 mb-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow",
            snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500 ring-opacity-20" : "hover:shadow-md",
            ticket.slaBreached && ticket.status !== 'closed' && "border-l-4 border-l-red-500"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={clsx(
              "px-2 py-1 text-xs font-semibold rounded-full border",
              priorityColors[ticket.priority]
            )}>
              {ticket.priority.toUpperCase()}
            </span>
            {ticket.slaBreached && (
              <span className="text-red-500" title="SLA Breached">
                <AlertCircle className="w-4 h-4" />
              </span>
            )}
          </div>
          
          <h4 className="text-sm font-medium text-gray-900 mb-1 leading-snug break-words">
            {ticket.subject}
          </h4>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {ticket.description}
          </p>

          <div className="flex items-center text-xs text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            <span>Age: {formatAge(ticket.ageMinutes)}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};
