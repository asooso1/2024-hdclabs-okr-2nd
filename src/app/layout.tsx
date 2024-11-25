import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React from "react";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | HDCLABS 근태관리시스템',
    default: 'HDCLABS 근태관리시스템',
  },
  description: "HDCLABS 근태관리시스템",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

import RootLayoutClient from './layout.client';
const kakaoMapApiKey = process.env.KAKAO_JAVASCRIPT_KEY;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <Script
          strategy="beforeInteractive"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&libraries=services&autoload=false`}
        />
      </head>
      <body>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <RootLayoutClient>{children}</RootLayoutClient>
        </div>
      </body>
    </html>
  );
}
