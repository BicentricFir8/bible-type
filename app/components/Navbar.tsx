
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const links = [
  { label: "Start Race", href: "/", icon: "🏁" },
  { label: "Garage", href: "/garage", icon: "🚗" },
  { label: "Shop", href: "/shop", icon: "🛒" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCoins() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("player_progress")
        .select("coins")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled && !error && data) {
        setCoins(data.coins);
      }
    }

    loadCoins();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <nav style={styles.nav}>
      <Link href="/" style={styles.logo}>
        <span style={styles.logoIcon}>B</span>
        <span>BIBLE TYPE</span>
      </Link>

      <div style={styles.links}>
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              style={{
                ...styles.link,
                ...(active ? styles.activeLink : {}),
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div style={styles.coins}>
        <span style={styles.coinIcon}>C</span>
        <strong>
          {coins === null ? "—" : coins.toLocaleString()}
        </strong>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    padding: "16px 24px",
    background: "#111c30",
    borderBottom: "1px solid #26364f",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#facc15",
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: 900,
    letterSpacing: "1px",
    whiteSpace: "nowrap",
  },
  logoIcon: {
    display: "grid",
    placeItems: "center",
    width: "32px",
    height: "32px",
    background: "#facc15",
    color: "#111827",
    borderRadius: "8px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 12px",
    borderRadius: "9px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  activeLink: {
    background: "#facc15",
    color: "#111827",
  },
  coins: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    border: "1px solid #475569",
    borderRadius: "10px",
    color: "#f8fafc",
    whiteSpace: "nowrap",
  },
  coinIcon: {
    display: "grid",
    placeItems: "center",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#facc15",
    color: "#111827",
    fontWeight: 900,
  },
};

