"use client";

import { ApexOptions } from "apexcharts";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 335,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
            columnWidth: "25%",
          },
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 0,
      columnWidth: "25%",
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    show: true,
    borderColor: "#E2E8F0",
    strokeDashArray: 5,
    xaxis: {
      lines: {
        show: false
      }
    },
  },
  xaxis: {
    categories: ["M", "T", "W", "T", "F", "S", "S"],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: function (value) {
        return Math.round(value).toString();
      }
    }
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontFamily: "Satoshi",
    fontWeight: 500,
    fontSize: "14px",
    markers: {
      size: 5,
    },
  },
  fill: {
    opacity: 1,
  },
};

interface ChartThreeProps {
  data: any | null;
}

const ChartThree: React.FC<ChartThreeProps> = ({ data }) => {
  let series = [
    {
      name: "전체 작업",
      data: [23, 11, 22, 27, 13, 22, 37],
    },
    {
      name: "완료된 작업",
      data: [30, 25, 36, 30, 45, 35, 64],
    },
  ];

  if (data) {
    series = data?.series;
    if (options.xaxis) {
      options.xaxis.categories = data?.categories;
    }
  }

  return (
    <div className="col-span-12 rounded-lg border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            이번주 작업 현황
          </h4>
        </div>
      </div>

      <div>
        <div id="chartThree" className="-mb-9 -ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartThree;
