export const metadata = {
  title: "NT TECH INNOVATION — Coming Soon",
  description: "Official coming soon page for NT TECH INNOVATION."
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
