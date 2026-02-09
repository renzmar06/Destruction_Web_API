import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MoreHorizontal, 
  Plus, 
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';

export default function PipelineBoard({ 
  pipeline, 
  deals, 
  customers,
  onDealMove,
  onDealClick,
  onAddDeal
}) {
  const getCustomer = (customerId) => 
    customers.find(c => c.id === customerId);

  const getDealsByStage = (stageId) => 
    deals.filter(d => d.stage_id === stageId);

  const getStageTotal = (stageId) => 
    getDealsByStage(stageId).reduce((sum, d) => sum + (d.value || 0), 0);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const dealId = result.draggableId;
    const newStageId = result.destination.droppableId;
    
    onDealMove(dealId, newStageId);
  };

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Select a pipeline to view deals
      </div>
    );
  }

  const sortedStages = [...(pipeline.stages || [])].sort((a, b) => a.order - b.order);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 overflow-y-auto">
        {sortedStages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const stageTotal = getStageTotal(stage.id);

          return (
            <div 
              key={stage.id} 
              className="flex-shrink-0 w-80"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stage.color || '#94a3b8' }}
                  />
                  <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stageDeals.length}
                  </Badge>
                </div>
                <span className="text-sm text-slate-500">
                  ${stageTotal.toLocaleString()}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-3 min-h-[200px] p-2 rounded-xl transition-colors",
                      snapshot.isDraggingOver ? "bg-blue-50" : "bg-slate-50"
                    )}
                  >
                    {stageDeals.map((deal, index) => {
                      const customer = getCustomer(deal.customer_id);

                      return (
                        <Draggable 
                          key={deal._id || deal.id} 
                          draggableId={String(deal._id || deal.id)} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onDealClick(deal)}
                              className={cn(
                                "bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-pointer",
                                "hover:shadow-md transition-all",
                                snapshot.isDragging && "shadow-lg rotate-2"
                              )}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-medium text-slate-900 line-clamp-1">
                                  {deal.title}
                                </h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>

                              {customer && (
                                <div className="flex items-center gap-2 mb-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={customer.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                      {customer.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-slate-600 truncate">
                                    {customer.name}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                                  <DollarSign className="w-4 h-4" />
                                  {deal.value?.toLocaleString() || 0}
                                </div>
                                {deal.expected_close_date && (
                                  <div className="flex items-center gap-1 text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-xs">
                                      {format(new Date(deal.expected_close_date), 'MMM d')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {deal.probability && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-500">Probability</span>
                                    <span className="text-slate-700">{deal.probability}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                      style={{ width: `${deal.probability}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {/* Add Deal Button */}
                    <button
                      onClick={() => onAddDeal(stage.id)}
                      className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add Deal</span>
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}