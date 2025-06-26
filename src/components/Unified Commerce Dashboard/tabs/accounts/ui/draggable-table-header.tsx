"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowUpDown, GripVertical } from "lucide-react"

// Type definitions
interface ColumnConfig {
  key: string
  label: string
  width?: number
}

interface DraggableTableHeaderProps {
  column: ColumnConfig
  index: number
  onSort: (key: string) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onResize?: (index: number, width: number) => void
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
  onResize,
  sortField,
  sortDirection,
  isDragging,
}: DraggableTableHeaderProps) {
  const [dragOver, setDragOver] = useState<false | 'left' | 'right'>(false)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const headerRef = useRef<HTMLTableCellElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)

  // Handle resize mouse events
  useEffect(() => {
    if (!isResizing) return

    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Use requestAnimationFrame for smooth updates
      animationFrameId = requestAnimationFrame(() => {
        if (!headerRef.current) return
        // Calculate new width based on mouse movement
        // Moving left (negative delta) makes it smaller, moving right makes it bigger
        const delta = e.clientX - startX
        const newWidth = Math.max(80, startWidth + delta)
        headerRef.current.style.width = `${newWidth}px`
        if (onResize) {
          onResize(index, newWidth)
        }
      })
    }

    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, startX, startWidth, index, onResize])

  const handleGripMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(headerRef.current?.offsetWidth || 150)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleDragStart = (e: React.DragEvent) => {
    // Only allow dragging if not clicking on the grip
    if (gripRef.current?.contains(e.target as Node)) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData('text/plain', index.toString())
    onDragStart(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    
    // Visual feedback for drop zone
    const rect = headerRef.current?.getBoundingClientRect()
    if (rect) {
      const midpoint = rect.left + rect.width / 2
      const isLeftHalf = e.clientX < midpoint
      setDragOver(isLeftHalf ? 'left' : 'right')
    }
    
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
    <th
      ref={headerRef}
      draggable={!isResizing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative h-10 px-2 text-left align-middle font-medium text-gray-700
        select-none transition-all duration-200 cursor-pointer
        ${dragOver === 'left' ? "border-l-4 border-blue-500" : ""}
        ${dragOver === 'right' ? "border-r-4 border-blue-500" : ""}
        ${isDragging ? "opacity-50" : ""}
        ${column.key === "visits" || column.key === "value" ? "text-right" : ""}
        hover:bg-gray-50
      `}
      style={{ width: column.width || 'auto', minWidth: '80px' }}
    >
      <div className="flex items-center gap-2 pr-4">
        <div
          ref={gripRef}
          onMouseDown={handleGripMouseDown}
          className="cursor-col-resize p-1 -m-1 hover:bg-gray-200 rounded transition-colors duration-150"
          title="Drag to resize column"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <button
          onClick={() => onSort(column.key)}
          className="flex items-center gap-2 font-semibold hover:text-gray-900 transition-colors duration-150 cursor-pointer"
        >
          {column.label}
          {sortField === column.key && (
            <ArrowUpDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                sortDirection === "desc" ? "rotate-180" : ""
              }`} 
            />
          )}
        </button>
      </div>
      
      {/* Resize handle on the right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 w-0.5 cursor-col-resize hover:bg-blue-400 bg-transparent transition-colors duration-150 hover:w-1"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsResizing(true)
          setStartX(e.clientX)
          setStartWidth(headerRef.current?.offsetWidth || 150)
          document.body.style.cursor = 'col-resize'
          document.body.style.userSelect = 'none'
        }}
      />
    </th>
  )
}