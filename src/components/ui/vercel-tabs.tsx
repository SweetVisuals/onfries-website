"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoverStyle, setHoverStyle] = useState({ left: "0px", width: "0px", top: "0px" })
    const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px", top: "0px" })
    const tabRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex]
        if (hoveredElement) {
          const { offsetLeft, offsetWidth, offsetTop } = hoveredElement
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
            top: `${offsetTop}px`,
          })
        }
      }
    }, [hoveredIndex])
  
    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        const { offsetLeft, offsetWidth, offsetTop } = activeElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
          top: `${offsetTop + 30}px`,
        })
      }
    }, [activeIndex])

    useEffect(() => {
      requestAnimationFrame(() => {
        const firstElement = tabRefs.current[0]
        if (firstElement) {
          const { offsetLeft, offsetWidth, offsetTop } = firstElement
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
            top: `${offsetTop + 30}px`,
          })
        }
      })
    }, [])

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        <div className="relative">
          {/* Hover Highlight */}
           <div
             className="absolute h-[30px] transition-all duration-300 ease-out bg-primary/10 dark:bg-primary/20 rounded-[6px] flex items-center"
             style={{
               ...hoverStyle,
               opacity: hoveredIndex !== null ? 1 : 0,
             }}
           />

           {/* Active Indicator */}
           <div
             className="hidden md:block absolute bottom-[-6px] h-[2px] bg-primary transition-all duration-300 ease-out"
             style={activeStyle}
           />

          {/* Tabs */}
           <div className="relative flex space-x-1 md:space-x-[6px] items-center justify-center overflow-x-auto">
             {tabs.map((tab, index) => (
               <div
                 key={tab.id}
                 ref={(el) => (tabRefs.current[index] = el)}
                 className={cn(
                   "px-2 md:px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] flex-shrink-0",
                   index === activeIndex
                     ? "text-[#0e0e10] dark:text-white"
                     : "text-[#0e0f1199] dark:text-[#ffffff99]"
                 )}
                 onMouseEnter={() => setHoveredIndex(index)}
                 onMouseLeave={() => setHoveredIndex(null)}
                 onClick={() => {
                   setActiveIndex(index)
                   onTabChange?.(tab.id)
                 }}
               >
                 <div className="text-xs md:text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                   {tab.label}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

export { Tabs }