"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import { ArrowUpDown, GripVertical } from "lucide-react"
import type { ColumnConfig } from "@/hooks/use-column-config"

interface DraggableTableHeaderProps {
  column: ColumnConfig
  index: number
  onSort: (key: string) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
  sortField: string
  sortDirection: "asc" | "desc"
  isDragging: boolean
}

export default function DraggableTableHeader({
  column,
  index,
  onSort,
  onDragStart,
  onDragOver,
  onDrop,
  sortField,
  sortDirection,
  isDragging,
}: DraggableTableHeaderProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"
    onDragStart(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(true)
    onDragOver(e, index)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    onDrop(e, index)
  }

  return (
    <TableHead
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        cursor-move select-none transition-all duration-200
        ${dragOver ? "bg-blue-100 border-l-4 border-blue-500" : ""}
        ${isDragging ? "opacity-50" : ""}
        ${column.key === "name" ? "" : column.key === "visits" ? "text-right" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <Button
         
          onClick={() => onSort(column.key)}
          className="h-auto p-0 font-semibold bg-transparent text-black shadow-none hover:bg-slate-100 flex items-center gap-2"
        >
          {column.label}
          {sortField === column.key && (
            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
          )}
        </Button>
      </div>
    </TableHead>
  )
}
