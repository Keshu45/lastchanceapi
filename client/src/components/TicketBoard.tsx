import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { TicketCard } from './TicketCard';
import { Ticket, Status } from '../types';

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved']
};

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'open', title: 'Open' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
  { id: 'closed', title: 'Closed' }
];

interface Props {
  tickets: Ticket[];
  onStatusChange: (ticketId: string, newStatus: Status) => void;
}

export const TicketBoard = ({ tickets, onStatusChange }: Props) => {
  const [errorMsg, setErrorMsg] = useState('');

  const onDragEnd = (result: DropResult) => {
    setErrorMsg('');
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const sourceStatus = source.droppableId as Status;
    const destStatus = destination.droppableId as Status;

    if (!ALLOWED_TRANSITIONS[sourceStatus].includes(destStatus)) {
      setErrorMsg(`Cannot move ticket from ${sourceStatus.replace('_', ' ')} directly to ${destStatus.replace('_', ' ')}`);
      setTimeout(() => setErrorMsg(''), 3000);
      return; 
    }

    onStatusChange(draggableId, destStatus);
  };

  return (
    <div>
      {errorMsg && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity">
          {errorMsg}
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
          {COLUMNS.map(column => {
            const columnTickets = tickets.filter(t => t.status === column.id);

            return (
              <div key={column.id} className="flex flex-col flex-1 min-w-[280px] bg-slate-50 rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100/50 rounded-t-xl">
                  <h3 className="font-semibold text-slate-700">{column.title}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {columnTickets.length}
                  </span>
                </div>
                
                <Droppable 
                  droppableId={column.id}
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                  direction="vertical"
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 overflow-y-auto transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                    >
                      {columnTickets.map((ticket, index) => (
                        <TicketCard key={ticket._id} ticket={ticket} index={index} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
