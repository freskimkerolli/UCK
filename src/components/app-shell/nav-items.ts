import {
  Home,
  Compass,
  Landmark,
  Users2,
  MessageCircle,
  Bell,
  Bookmark,
  LayoutDashboard,
  Settings,
  Image as ImageIcon,
  FileText,
  Mic,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Translation key within the "nav" messages namespace. */
  labelKey: string;
  icon: LucideIcon;
}

export const ARCHIVE_SUBMENU: NavItem[] = [
  { href: "/archive?type=PHOTO", labelKey: "archivePhotos", icon: ImageIcon },
  { href: "/archive?type=DOCUMENT", labelKey: "archiveDocuments", icon: FileText },
  { href: "/archive?type=TESTIMONY", labelKey: "archiveTestimonies", icon: Mic },
  { href: "/archive?type=EVENT_RECORD", labelKey: "archiveTimeline", icon: CalendarClock },
];

export const SIDEBAR_MAIN: NavItem[] = [
  { href: "/home", labelKey: "kryefaqja", icon: Home },
  { href: "/archive", labelKey: "archive", icon: Landmark },
  { href: "/explore", labelKey: "explore", icon: Compass },
  { href: "/communities", labelKey: "communities", icon: Users2 },
  { href: "/messages", labelKey: "messages", icon: MessageCircle },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  { href: "/saved", labelKey: "saved", icon: Bookmark },
];

export const SIDEBAR_ADMIN: NavItem[] = [
  { href: "/admin", labelKey: "adminDashboard", icon: LayoutDashboard },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/home", labelKey: "bottomKreu", icon: Home },
  { href: "/explore", labelKey: "explore", icon: Compass },
  { href: "/communities", labelKey: "bottomZonat", icon: Users2 },
  { href: "/messages", labelKey: "bottomBisedat", icon: MessageCircle },
];
