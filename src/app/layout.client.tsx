"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // URL 쿼리 파라미터 체크 및 저장
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    if (userId) {
      localStorage.setItem('userId', userId);
    }
    if (projectId) {
      localStorage.setItem('projectId', projectId);
    }

    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {loading ? <Loader /> : children}
    </div>
  );
} 