import Image from "next/image";
import { useState } from "react";
import Link from 'next/link';
import { Project } from '@/lib/api/types';

interface TableTwoProps {
  projects: Project[];
  loading: boolean;
}

const AdminProject = ({ projects, loading }: TableTwoProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleRowClick = (projectId: string) => {
    setExpandedRow(expandedRow === projectId ? null : projectId);
  };

  const renderLoading = () => (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          진행중인 프로젝트
        </h4>
      </div>
      <div className="grid grid-cols-9 gap-6 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">프로젝트명</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">작업종류</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">비고</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">작업 위치</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">작업 기간</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">작업 참여자</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">작업내용</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">작업내용</p>
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-9 gap-6 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5"
        >
          <div className="col-span-3 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-2 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-1 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-1 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-1 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-1 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-1 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
          <div className="col-span-1 flex animate-pulse items-center">
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) return renderLoading();

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5 flex justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white flex items-center">
          진행중인 프로젝트
        </h4>

        <Link href="/admin/projects/add">
          <button className="rounded bg-blue-500 px-4 py-2 text-white">
            프로젝트 추가
          </button>
        </Link>
      </div>

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
        <div className="flex items-center col-span-2 hidden md:block">
          <p className="font-medium">비고</p>
        </div>
        <div className="flex items-center col-span-2 hidden md:block">
          <p className="font-medium">작업 위치</p>
        </div>
        <div className="flex items-center col-span-2 hidden md:block">
          <p className="font-medium">작업 참여자</p>
        </div>
      </div>

      {projects.map((project) => (
        <div key={project.id}>
          <Link href={`/admin/projects/${project.id}`}>
            <div
              onClick={() => { }}
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
              <div className="flex items-center col-span-2 hidden md:block">
                <p className="text-sm text-black dark:text-white">{project.description || '-'}</p>
              </div>
              <div className="flex items-center col-span-2 hidden md:block">
                <p className="text-sm text-black dark:text-white">{project.address || '-'}</p>
              </div>
              <div className="flex items-center col-span-2 hidden md:block">
                <p className="text-sm text-black dark:text-white">{project.projectStatuses?.length === 1 ? `${project.projectStatuses[0].userName}` : project.projectStatuses?.map((status) => status.userName).join(', ') || '-'}</p>
              </div>
            </div>
          </Link>

          {expandedRow === project.id && (
            <div className="border-t border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="py-2 text-center">작업자</th>
                        <th className="py-2 text-center">작업 일정</th>
                        <th className="py-2 text-center">출근</th>
                        <th className="py-2 text-center">퇴근</th>
                        <th className="py-2 text-center">작업확인서</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.projectStatuses &&
                      project.projectStatuses.length > 0 ? (
                        project.projectStatuses.map((status, index) => (
                          <tr
                            key={index}
                            className="border-t border-stroke dark:border-strokedark"
                          >
                            <td className="py-2 text-center">
                              {status.userName || "-"}
                            </td>
                            <td className="py-2 text-center">
                              {status.schedule}
                            </td>
                            <td className="py-2 text-center">
                              {status.before !== null ? "v" : "-"}
                            </td>
                            <td className="py-2 text-center">
                              {status.after !== null ? "v" : "-"}
                            </td>
                            <td className="py-2 text-center">
                              {status.confirmation !== null ? "v" : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border-t border-stroke py-2 text-center text-gray-500 dark:border-strokedark">
                            등록된 작업자 정보가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminProject;
