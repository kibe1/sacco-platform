import type { Metadata } from "next";
import "./styles.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SACCO Member Portal",
  description: "Member self-service portal for the SACCO platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("sacco-member-theme")||((window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light");document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}`
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
