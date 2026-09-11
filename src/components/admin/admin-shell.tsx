"use client";

import {
  Bell,
  Building2,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelTop,
  Search,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

const navigation = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Website Content", "/admin/content", PanelTop],
  ["Listings", "/admin/listings", Building2],
  ["Enquiries", "/admin/enquiries", Inbox],
  ["Site Settings", "/admin/settings", Settings],
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      <aside className={menuOpen ? "admin-sidebar is-open" : "admin-sidebar"}>
        <div className="admin-sidebar-brand">
          <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)}>
            <span>R</span>
            <strong>RentDeer</strong>
          </Link>
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="admin-sidebar-label">Workspace</div>
        <nav aria-label="Admin navigation">
          {navigation.map(([label, href, Icon]) => {
            const active =
              pathname === href ||
              (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));

            return (
              <Link
                className={active ? "is-active" : ""}
                href={href}
                key={href}
                onClick={() => setMenuOpen(false)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" target="_blank">
            <ExternalLink aria-hidden="true" />
            View website
          </Link>
          <Link href="/admin">
            <LogOut aria-hidden="true" />
            Sign out
          </Link>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close admin navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            aria-label="Open admin navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu aria-hidden="true" />
          </button>
          <div className="admin-search">
            <Search aria-hidden="true" />
            <input aria-label="Search admin" placeholder="Search anything..." />
          </div>
          <div className="admin-topbar-actions">
            <button type="button" aria-label="View notifications">
              <Bell aria-hidden="true" />
              <span className="admin-notification-dot" />
            </button>
            <div className="admin-user">
              <span>MA</span>
              <div>
                <strong>Mohd Adam</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
