"use client";

import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartData {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

interface NewChartProps {
  data: ChartData | null;
  type?: "area" | "bar";
  title?: string;
  height?: number;
}

const defaultOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 350,
    toolbar: { show: false },
    fontFamily: "Pretendard, sans-serif",
    zoom: { enabled: false },
  },
  colors: ["#3C50E0", "#80CAEE"],
  stroke: {
    curve: "smooth",
    width: 2,
  },
  dataLabels: { enabled: false },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3C50E0", "#80CAEE"],
    strokeWidth: 2,
  },
  grid: {
    borderColor: "#e0e6ed",
    strokeDashArray: 5,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: "category",
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    tickAmount: 5,
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    offsetY: -10,
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: { height: 300 },
      },
    },
  ],
};

export function NewChart({ data, type = "area", title, height = 350 }: NewChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse">차트 로딩중...</div>
        </div>
      </div>
    );
  }

  const options: ApexOptions = {
    ...defaultOptions,
    chart: {
      ...defaultOptions.chart,
      type,
      height,
    },
    xaxis: {
      ...defaultOptions.xaxis,
      categories: data?.categories || [],
    },
  };

  const series = data?.series || [
    {
      name: "전체 작업",
      data: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "완료된 작업",
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  return (
    <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      {title && (
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h4>
        </div>
      )}
      
      <div className="flex flex-wrap items-start gap-3 mb-4">
        {series.map((item, index) => (
          <div key={item.name} className="flex items-center">
            <span 
              className="mr-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: defaultOptions.colors?.[index] }}
            />
            <span className="text-sm font-medium dark:text-white">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      <div className="-mx-4">
        <ReactApexChart
          options={options}
          series={series}
          type={type}
          height={height}
          width="100%"
        />
      </div>
    </div>
  );
} 