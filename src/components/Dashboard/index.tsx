"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import ChartOne from "../Charts/ChartOne";
import ChartTwo from "../Charts/ChartTwo";
import CardDataStats from "../CardDataStats";
import { adminApi } from "@/lib/api/admin";
import { AttendanceDashboard, User, WorkCount } from "@/lib/api/types";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ko } from "date-fns/locale";
import { Tooltip } from "../Tooltip";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';

const StaticMap = dynamic(() => import("@/components/Maps/StaticMap"), {
  ssr: false,
});

// const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
//   ssr: false,
// });

interface UserInfo {
  id: string;
  name: string;
  phoneNumber: string;
  cost: number;
  projectCount: number;
}

// workChart 데이터를 변환하는 함수 추가
function transformChartData(workChart: Record<string, { total: number; done: number }>) {
  // 날짜를 오름차순으로 정렬
  const sortedDates = Object.keys(workChart).sort();
  
  return {
    categories: sortedDates.map(date => format(new Date(date), 'MM/dd')),
    series: [
      {
        name: '전체 작업',
        data: sortedDates.map(date => workChart[date].total)
      },
      {
        name: '완료된 작업',
        data: sortedDates.map(date => workChart[date].done)
      }
    ]
  };
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AttendanceDashboard[]>([]);
  const [userCosts, setUserCosts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    startDate: '2024-12-01',
    endDate: '2025-01-31'
  });
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
  const [workCount, setWorkCount] = useState<WorkCount | null>(null);
  const [workChart, setWorkChart] = useState<any| null>(null);
  // targetStartDate: {total?: number; done?: number; "total-done"?: number};
  // targetEndDate: {total?: number; done?: number; "total-done"?: number};

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashboardResponse, usersResponse] = await Promise.all([
          adminApi.getAttendanceDashboard(
            'DAILY',
            dateRange.startDate,
            dateRange.endDate
          ),
          adminApi.searchUsers('')
        ]);

        setDashboardData(dashboardResponse);

        // 사용자별 정보 매핑
        const userInfo = usersResponse.reduce((acc, user) => {
          // 프로젝트 수 계산
          const projectCount = dashboardResponse.filter(project => 
            project.users.some(u => u.userId === user.id)
          ).length;

          return {
            ...acc,
            [user.id]: {
              id: user.id,
              name: user.name,
              phoneNumber: user.phoneNumber || '-',
              cost: user.cost || 0,
              projectCount
            }
          };
        }, {} as Record<string, UserInfo>);
        
        setUserInfoMap(userInfo);
        setUserCosts(usersResponse.reduce((acc, user) => ({
          ...acc,
          [user.id]: user.cost || 0
        }), {}));
      } catch (error) {
        console.error("데이터 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  useEffect(() => {
    const fetchWorkData = async () => {
      try {
        // 오늘 날짜 기준으로 데이터 조회
        const today = format(new Date(), 'yyyy-MM-dd');
        const workCountResponse = await adminApi.getWorkCount(today);
        setWorkCount(workCountResponse);

        // 차트 데이터용 날짜 범위 (예: 최근 7일)
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');
        const workChartResponse = await adminApi.getWorkChart(eachDayOfInterval({
          start: new Date(startDate),
          end: new Date(endDate)
        }).map(date => format(date, 'yyyy-MM-dd')));
        setWorkChart(transformChartData(workChartResponse));
      } catch (error) {
        console.error("작업 데이터 조회 실패:", error);
      }
    };

    fetchWorkData();
  }, []);

  // 프로젝트별 통계 계산 함수 수정
  const calculateProjectStats = (project: AttendanceDashboard) => {
    return project.users.map(user => {
      const stats = {normal: user.normals, abnormal: user.absents}

      // 일별 비용 계산
      const dailyCost = (stats.normal) * (userCosts[user.userId] || 0);

      return {
        userId: user.userId,
        userName: user.userName,
        ...stats,
        total: stats.normal + stats.abnormal,
        cost: dailyCost
      };
    });
  };

  // 프로젝트 클릭 핸들러 추가
  const handleProjectClick = (projectId: string) => {
    router.push(`/admin/projects/${projectId}`);
  };

  const handleExcelDownload = () => {
    // 엑셀 데이터 준비
    const excelData = dashboardData.flatMap(project => {
      const stats = calculateProjectStats(project);
      
      // 프로젝트별 데이터 행들
      const projectRows = stats.map(stat => ({
        '프로젝트명': project.projectName,
        '작업자': stat.userName,
        '연락처': userInfoMap[stat.userId]?.phoneNumber || '-',
        '작업계획': stat.total,
        '정상': stat.normal,
        '이상': stat.abnormal,
        '비용': stat.cost,
      }));

      // 프로젝트 소계 행 추가
      const projectTotal = stats.reduce(
        (acc, stat) => ({
          normal: acc.normal + stat.normal,
          abnormal: acc.abnormal + stat.abnormal,
          total: acc.total + stat.total,
          cost: acc.cost + stat.cost
        }),
        { normal: 0, abnormal: 0, total: 0, cost: 0 }
      );

      projectRows.push({
        '프로젝트명': `${project.projectName} (소계)`,
        '작업자': '',
        '연락처': '',
        '작업계획': projectTotal.total,
        '정상': projectTotal.normal,
        '이상': projectTotal.abnormal,
        '비용': projectTotal.cost,
      });

      return projectRows;
    });

    // 총계 행 추가
    const grandTotal = dashboardData.reduce((acc, project) => {
      const stats = calculateProjectStats(project);
      const projectTotal = stats.reduce(
        (acc, stat) => ({
          total: acc.total + stat.total,
          normal: acc.normal + stat.normal,
          abnormal: acc.abnormal + stat.abnormal,
          cost: acc.cost + stat.cost
        }),
        { normal: 0, abnormal: 0, total: 0, cost: 0 }
      );

      return {
        total: acc.total + projectTotal.total,
        normal: acc.normal + projectTotal.normal,
        abnormal: acc.abnormal + projectTotal.abnormal,
        cost: acc.cost + projectTotal.cost
      };
    }, { total: 0, normal: 0, abnormal: 0, cost: 0 });

    excelData.push({
      '프로젝트명': '총계',
      '작업자': '',
      '연락처': '',
      '작업계획': grandTotal.total,
      '정상': grandTotal.normal,
      '이상': grandTotal.abnormal,
      '비용': grandTotal.cost,
    });

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 열 너비 설정
    const columnWidths = [
      { wch: 20 }, // 프로젝트명
      { wch: 15 }, // 작업자
      { wch: 15 }, // 연락처
      { wch: 10 }, // 작업계
      { wch: 10 }, // 정상
      { wch: 10 }, // 이상
      { wch: 15 }, // 비용
    ];
    ws['!cols'] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '작업현황');

    // 파일명 생성 (현재 날짜 포함)
    const today = new Date();
    const fileName = `작업현황_${format(today, 'yyyy-MM-dd')}.xlsx`;

    // 엑셀 파일 다운로드
    XLSX.writeFile(wb, fileName);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="오늘 작업 예정 건수"
          total={`${workCount?.total || 0}건`}
          rate="-"
        >
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="16"
            viewBox="0 0 22 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"
              fill=""
            />
            <path
              d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        <CardDataStats
          title="출근 완료 작업"
          total={`${workCount?.before || 0}건`}
          rate="-"
        >
          {" "}
          <svg
            className="fill-primary dark:fill-white"
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z"
              fill=""
            />
            <path
              d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.2937 19.4562 4.2937 18.9406C4.2937 18.425 4.7062 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z"
              fill=""
            />
            <path
              d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937C0.237478 7.49374 0.237478 7.49374 0.237478 7.52812L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19999 17.0125 2.16562 17.0812 2.16562H18.9375C19.35 2.16562 19.7281 1.82187 19.7281 1.37499C19.7281 0.928119 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9531 12.8219 13.5062 13.2 12.9906 13.2H3.7781L1.92185 7.56249H14.7094L14.0219 12.3062Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        <CardDataStats
          title="퇴근 완료 작업"
          total={`${workCount?.after || 0}건`}
          rate="-"
        >
          {" "}
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
              fill=""
            />
            <path
              d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        <CardDataStats
          title="작업 확인서 등록"
          total={`${workCount?.confirmation || 0}건`}
          rate="-"
        >
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
              fill=""
            />
            <path
              d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
              fill=""
            />
            <path
              d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z"
              fill=""
            />
          </svg>
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-12 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-1 md:col-span-6">
          <ChartOne data={workChart} />
        </div>
        <div className="col-span-1 md:col-span-6">
          <ChartTwo data={workChart} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              프로젝트별 작업 현황
            </h3>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                  조회기간
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-1 dark:bg-meta-4">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 transition-colors focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:focus:border-primary sm:w-auto"
                    disabled={isLoading}
                  />
                  <span className="text-gray-500 dark:text-gray-400">~</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 transition-colors focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:focus:border-primary sm:w-auto"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                onClick={handleExcelDownload}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="whitespace-nowrap">엑셀 다운로드</span>
              </button>
            </div>
          </div>

          <div className="relative -mx-4 overflow-x-auto sm:-mx-6">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-boxdark/50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            )}
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap bg-gray-50 px-4 py-5 text-left first:rounded-tl-lg last:rounded-tr-lg dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        프로젝트
                      </span>
                    </th>
                    <th className="whitespace-nowrap bg-gray-50 px-4 py-5 text-left dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        작업자
                      </span>
                    </th>
                    <th className="whitespace-nowrap bg-gray-50 px-4 py-5 text-center dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        작업계획
                      </span>
                    </th>
                    <th className="whitespace-nowrap bg-gray-50 px-4 py-5 text-center dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        정상
                      </span>
                    </th>
                    <th className="whitespace-nowrap bg-gray-50 px-4 py-5 text-center dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        이상
                      </span>
                    </th>
                    <th className="whitespace-nowrap bg-gray-50 px-4 py-5 text-right dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        비용
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.map((project) => {
                    const stats = calculateProjectStats(project);
                    const projectTotal = stats.reduce(
                      (acc, stat) => ({
                        normal: acc.normal + stat.normal,
                        abnormal: acc.abnormal + stat.abnormal,
                        total: acc.total + stat.total,
                        cost: acc.cost + stat.cost,
                      }),
                      { normal: 0, abnormal: 0, total: 0, cost: 0 },
                    );

                    return (
                      <React.Fragment key={project.projectId}>
                        {stats.map((stat, index) => (
                          <tr
                            key={`${project.projectId}-${stat.userId}`}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-strokedark dark:hover:bg-meta-4/50"
                          >
                            {index === 0 && (
                              <td
                                rowSpan={stats.length + 1}
                                className="px-4 py-5 align-top"
                              >
                                <button
                                  onClick={() =>
                                    handleProjectClick(project.projectId)
                                  }
                                  className="group flex items-center gap-1 font-medium text-black transition-colors hover:text-primary focus:outline-none dark:text-white dark:hover:text-primary"
                                >
                                  <span>{project.projectName}</span>
                                  <svg
                                    className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </button>
                              </td>
                            )}
                            <td className="px-4 py-5">
                              <Tooltip
                                content={
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {stat.userName}
                                    </div>
                                    <div className="text-xs text-gray-300">
                                      <div>
                                        연락처:{" "}
                                        {userInfoMap[stat.userId]?.phoneNumber ||
                                          "-"}
                                      </div>
                                      <div>
                                        일일 비용:{" "}
                                        {userInfoMap[
                                          stat.userId
                                        ]?.cost.toLocaleString()}
                                        원
                                      </div>
                                      <div>
                                        참여 프로젝트:{" "}
                                        {userInfoMap[stat.userId]?.projectCount}개
                                      </div>
                                    </div>
                                  </div>
                                }
                              >
                                <span className="cursor-help text-sm font-medium text-black dark:text-white">
                                  {stat.userName}
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-4 py-5 text-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.total}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-center">
                              <span className="inline-flex items-center justify-center rounded-full bg-success/10 px-2.5 py-1 text-sm font-medium text-success">
                                {stat.normal}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-center">
                              <span className="inline-flex items-center justify-center rounded-full bg-danger/10 px-2.5 py-1 text-sm font-medium text-danger">
                                {stat.abnormal}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-right">
                              <span className="text-sm font-medium text-meta-5">
                                {stat.cost.toLocaleString()}원
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-b border-gray-200 bg-gray-50/70 font-medium dark:border-strokedark dark:bg-meta-4/50">
                          <td className="px-4 py-4">소계</td>
                          <td className="px-4 py-4 text-center">
                            {projectTotal.total}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {projectTotal.normal}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {projectTotal.abnormal}
                          </td>
                          <td className="px-4 py-4 text-right text-meta-5">
                            {projectTotal.cost.toLocaleString()}원
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                  {/* 전체 합계 행 */}
                  <tr className="bg-primary/5 font-bold dark:bg-primary/10">
                    <td
                      colSpan={2}
                      className="px-4 py-5 text-black dark:text-white"
                    >
                      총계
                    </td>
                    <td className="px-4 py-5 text-center text-black dark:text-white">
                      {dashboardData.reduce(
                        (acc, project) =>
                          acc +
                          calculateProjectStats(project).reduce(
                            (sum, stat) => sum + stat.total,
                            0,
                          ),
                        0,
                      )}
                    </td>
                    <td className="px-4 py-5 text-center text-success">
                      {dashboardData.reduce(
                        (acc, project) =>
                          acc +
                          calculateProjectStats(project).reduce(
                            (sum, stat) => sum + stat.normal,
                            0,
                          ),
                        0,
                      )}
                    </td>
                    <td className="px-4 py-5 text-center text-danger">
                      {dashboardData.reduce(
                        (acc, project) =>
                          acc +
                          calculateProjectStats(project).reduce(
                            (sum, stat) => sum + stat.abnormal,
                            0,
                          ),
                        0,
                      )}
                    </td>
                    <td className="px-4 py-5 text-right font-bold text-meta-5">
                      {dashboardData
                        .reduce(
                          (acc, project) =>
                            acc +
                            calculateProjectStats(project).reduce(
                              (sum, stat) => sum + stat.cost,
                              0,
                            ),
                          0,
                        )
                        .toLocaleString()}
                      원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
