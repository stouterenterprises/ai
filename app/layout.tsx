import type { ReactNode } from "react";
import "./styles.css";

export const metadata = {
  title: "Nimbus Support Portal",
  description: "Intercom-style support portal powered by Supabase"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <header className="site-header">
            <div>
              <p className="eyebrow">Nimbus Support</p>
              <h1>AI Support Portal</h1>
            </div>
            <nav>
              <a href="/help">Help Center</a>
              <a href="/widget">Widget</a>
              <a href="/portal">Customer Portal</a>
              <a href="/agent">Agent Inbox</a>
              <a href="/admin">Admin</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
