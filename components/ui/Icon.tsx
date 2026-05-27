"use client"

import React from "react"
import type { IconType } from "react-icons"
import {
  LuArrowLeft,
  LuArrowRight,
  LuBell,
  LuCalendar,
  LuCamera,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuCircle,
  LuGift,
  LuLayoutDashboard,
  LuLayers,
  LuLogOut,
  LuMail,
  LuMenu,
  LuPencil,
  LuPhone,
  LuPlus,
  LuScanLine,
  LuSearch,
  LuSettings,
  LuStar,
  LuUsers,
  LuX,
} from "react-icons/lu"
import { TbDental } from "react-icons/tb"

const ICON_MAP: Record<string, IconType> = {
  "scan":      LuScanLine,
  "dash":      LuLayoutDashboard,
  "users":     LuUsers,
  "tiers":     LuLayers,
  "gift":      LuGift,
  "tooth":     TbDental,
  "search":    LuSearch,
  "plus":      LuPlus,
  "chev-d":    LuChevronDown,
  "chev-r":    LuChevronRight,
  "check":     LuCheck,
  "x":         LuX,
  "bell":      LuBell,
  "settings":  LuSettings,
  "dot":       LuCircle,
  "arrow-r":   LuArrowRight,
  "arrow-l":   LuArrowLeft,
  "cam":       LuCamera,
  "edit":      LuPencil,
  "phone":     LuPhone,
  "mail":      LuMail,
  "calendar":  LuCalendar,
  "star":      LuStar,
  "logout":    LuLogOut,
  "menu":      LuMenu,
}

interface IconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.5 }: IconProps) {
  const Comp = ICON_MAP[name] ?? LuCircle
  return (
    <Comp
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={{ display: "block", flexShrink: 0 }}
    />
  )
}
