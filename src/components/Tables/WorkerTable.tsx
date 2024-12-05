import Image from "next/image";
import { useState } from "react";
import Link from 'next/link';

interface Project {
  createdAt: string;
  updatedAt: string;
  id: string;
  name: string;
  description: string;
  workType: string;
  address: string;
  latitude: number;
  longitude: number;
  from: string;
  to: string;
  projectStatuses?: {
    userId: string;
    userName: string | null;
    schedule: string;
    before: string | null;
    after: string | null;
    confirmation: string | null;
  }[];
}

interface TableTwoProps {
  projects: Project[];
  loading: boolean;
}


const WorkerTable = ({ projects, loading }: TableTwoProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleRowClick = (projectId: string) => {
    setExpandedRow(expandedRow === projectId ? null : projectId);
  };

  const renderLoading = () => (
    <div className="bg-white border rounded-lg border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="grid grid-cols-6 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5 gap-6">
        <div className="flex items-center col-span-2">
          <p className="font-medium">프로젝트명</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업종류</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">비고</p>
        </div>
        <div className="flex items-center col-span-1 hidden md:block">
          <p className="font-medium">작업 위치</p>
        </div>
        <div className="flex items-center col-span-1 hidden md:block">
          <p className="font-medium">작업 기간</p>
        </div>
        <div className="flex items-center col-span-1 hidden md:block">
          <p className="font-medium">작업 참여자</p>
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5 gap-6">
          <div className="flex items-center col-span-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex items-center col-span-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) return renderLoading();

  return (
    <div className="bg-white border rounded-lg border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="grid grid-cols-6 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5 gap-1">
        <div className="flex items-center col-span-3">
          <p className="font-medium">프로젝트명</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업종류</p>
        </div>
        <div className="flex items-center col-span-2">
          <p className="font-medium">작업 기간</p>
        </div>
        <div className="flex items-center col-span-2">
          <p className="font-medium">출근 예정일</p>
        </div>
        <div className="flex items-center col-span-2 hidden md:block">
          <p className="font-medium">작업 위치</p>
        </div>
        <div className="flex items-center col-span-2 hidden md:block">
          <p className="font-medium">비고</p>
        </div>
      </div>

      {projects.map((project) => (
        <div key={project.id}>
          <Link href={`/worker/calendar?projectId=${project.id}&userId=${localStorage.getItem('userId')}&type=accept`}>
            <div
              onClick={() => {}}
              className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 gap-1"
            >
              <div className="flex items-center col-span-3">
                <p className="text-sm text-black dark:text-white">{project.name || '-'}</p>
              </div>
              <div className="flex items-center col-span-1">
                <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">{project.workType || '-'}</span>
              </div>
              <div className="flex items-center col-span-2">
                <p className="text-sm text-black dark:text-white">{new Date(project.from).toLocaleDateString()} <br className="block md:hidden" />~ {new Date(project.to).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center col-span-2">
                <p className="text-sm text-black dark:text-white">
                  {project.projectStatuses?.find(
                    status => status.userId === localStorage.getItem('userId')
                  )?.schedule 
                    ? new Date(project.projectStatuses.find(
                        status => status.userId === localStorage.getItem('userId')
                      )!.schedule).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              <div className="flex items-center col-span-2 hidden md:block">
                <p className="text-sm text-black dark:text-white">{project.address || '-'}</p>
              </div>
              {/* <div className="flex items-center col-span-2 hidden md:block">
                <p className="text-sm text-black dark:text-white">{project.projectStatuses?.length === 1 ? `${project.projectStatuses[0].userName}` : project.projectStatuses?.map((status) => status.userName).join(', ') || '-'}</p>
              </div> */}
              <div className="flex items-center col-span-2 hidden md:block">
                <p className="text-sm text-black dark:text-white">{project.description || '-'}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default WorkerTable;
