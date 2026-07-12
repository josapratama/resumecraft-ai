import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  DragOverlay,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DraggableListProps<T extends { id: number }> {
  items: T[];
  onReorder: (newOrder: number[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  /** Unique id prefix to avoid collision when multiple lists are on screen */
  droppableId: string;
}

// ─── Single sortable row ──────────────────────────────────────────────────────

interface SortableItemProps<T extends { id: number }> {
  item: T;
  index: number;
  droppableId: string;
  renderItem: (item: T, index: number) => ReactNode;
  /** When true, renders a transparent placeholder instead of full content */
  isOverlay?: boolean;
}

function SortableItem<T extends { id: number }>({
  item,
  index,
  droppableId,
  renderItem,
  isOverlay = false,
}: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${droppableId}-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // When this item is being dragged, render a ghost (invisible placeholder)
  // so the list doesn't collapse. The actual drag preview is in DragOverlay.
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 p-3 border border-dashed border-gray-300 rounded bg-gray-50 opacity-50"
        aria-hidden
      >
        <GripVertical className="w-5 h-5 text-gray-300" />
        <div className="flex-1 h-8" />
      </div>
    );
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={`flex items-center gap-3 p-3 border border-gray-300 rounded transition-shadow ${
        isOverlay ? "shadow-2xl bg-white rotate-1 scale-[1.02]" : "bg-white"
      }`}
    >
      {/* Drag handle — only this element activates drag, not the whole row */}
      <button
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
        type="button"
        aria-label="Drag to reorder"
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        tabIndex={isOverlay ? -1 : 0}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1">{renderItem(item, index)}</div>
    </div>
  );
}

// ─── List container ───────────────────────────────────────────────────────────

export default function DraggableList<T extends { id: number }>({
  items,
  onReorder,
  renderItem,
  droppableId,
}: DraggableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag activates — prevents accidental drags
      // when the user just clicks a button inside the row.
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // dnd-kit needs stable string ids
  const sortableIds = items.map(item => `${droppableId}-${item.id}`);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(active.id as string);
    const newIndex = sortableIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered.map(item => item.id));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Find the item currently being dragged for the overlay
  const activeItem = activeId
    ? items.find(item => `${droppableId}-${item.id}` === activeId)
    : null;
  const activeIndex = activeItem ? items.indexOf(activeItem) : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={sortableIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              droppableId={droppableId}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>

      {/* DragOverlay renders into a portal at the document root — escapes
          any overflow-hidden containers and always stays on top. */}
      <DragOverlay>
        {activeItem ? (
          <SortableItem
            item={activeItem}
            index={activeIndex}
            droppableId={droppableId}
            renderItem={renderItem}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
