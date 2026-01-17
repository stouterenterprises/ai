import type { ReactNode } from "react";
import { SessionProvider } from "@/components/session-provider";
import { AuthNav } from "@/components/auth-nav";
import "./styles.css";

export const metadata = {
  title: "Nimbus Support Portal",
  description: "Intercom-style support portal powered by MySQL"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="page">
            <header className="site-header">
              <div className="site-brand">
                <p className="eyebrow">Nimbus Support</p>
                <h1>AI Support Portal</h1>
              </div>
              <input
                className="nav-toggle"
                type="checkbox"
                id="nav-toggle"
                aria-label="Toggle navigation"
              />
              <label className="nav-toggle-label" htmlFor="nav-toggle">
                Menu
              </label>
              <nav className="site-nav">
                <a href="/help">Help Center</a>
                <a href="/widget">Widget</a>
                <a href="/portal">Customer Portal</a>
                <a href="/agent">Agent Inbox</a>
                <a href="/admin">Admin</a>
                <AuthNav />
              </nav>
            </header>
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
