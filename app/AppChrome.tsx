"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";
import { InstallAppButton } from "./InstallAppButton";
import { useSavedEvents } from "./appState";

const destinations = [
  { href: "/", label: "Home", mark: "H" },
  { href: "/schedule/", label: "Schedule", mark: "S" },
  { href: "/saved/", label: "Saved", mark: "★" },
  { href: "/settings/", label: "Settings", mark: "⚙" },
];

function currentPath(pathname: string) {
  return pathname.replace(/^\/fight-list(?=\/|$)/, "") || "/";
}

function isCurrent(pathname: string, href: string) {
  const path = currentPath(pathname);
  return href === "/" ? path === "/" : path.startsWith(href.replace(/\/$/, ""));
}

export function AppHeader() {
  const pathname = usePathname();
  const { savedIds } = useSavedEvents();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Fight List home">
        <BrandMark />
        <strong>Fight List</strong>
      </Link>
      <nav className="desktop-navigation" aria-label="Primary navigation">
        {destinations.map((destination) => (
          <Link
            key={destination.href}
            className={isCurrent(pathname, destination.href) ? "nav-active" : ""}
            href={destination.href}
            aria-current={
              isCurrent(pathname, destination.href) ? "page" : undefined
            }
          >
            {destination.label}
            {destination.label === "Saved" && savedIds.length > 0
              ? ` (${savedIds.length})`
              : ""}
          </Link>
        ))}
        <InstallAppButton />
      </nav>
    </header>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { savedIds } = useSavedEvents();

  return (
    <nav className="bottom-navigation" aria-label="App navigation">
      {destinations.map((destination) => {
        const active = isCurrent(pathname, destination.href);
        return (
          <Link
            key={destination.href}
            className={active ? "is-active" : ""}
            href={destination.href}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true">{destination.mark}</span>
            <strong>{destination.label}</strong>
            {destination.label === "Saved" && savedIds.length > 0 && (
              <small>{savedIds.length}</small>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppFooter() {
  return (
    <footer className="site-footer">
      <strong>Fight List</strong>
      <p>Times and cards can change. Confirm details before the event starts.</p>
      <a
        href="https://github.com/Keshawn7B/fight-list"
        target="_blank"
        rel="noreferrer"
      >
        Source on GitHub
      </a>
    </footer>
  );
}
