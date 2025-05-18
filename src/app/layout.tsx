'use client'; // ← This must be the first line

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Jotty - Task Management</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />
        <style>
          {`
            .font-script {
              font-family: 'Dancing Script', cursive;
            }
          `}
        </style>
      </head>
      <body className="bg-yellow-50">
        {isClient ? children : <div className="flex items-center justify-center min-h-screen">Loading...</div>}
      </body>
    </html>
  );
}
