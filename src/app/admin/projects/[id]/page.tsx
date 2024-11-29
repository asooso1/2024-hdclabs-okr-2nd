"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { projectApi } from "@/lib/api/projects";
import { toast } from "react-toastify";
import Loader from "@/components/common/Loader";
import StaticMap from "@/components/Maps/StaticMap";
import Link from "next/link";

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

const ProjectDetailPage = () => {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const response = await projectApi.getProject(localStorage.getItem('userId') || '', params.id as string);
        setProject(response);
      } catch (error) {
        console.error("프로젝트 상세 정보 가져오기 실패:", error);
        toast.error("프로젝트 정보를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [params.id]);

  if (loading) return <Loader />;
  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="프로젝트 상세" />
        <Link href={`/admin/projects/${params.id}/edit`}>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90">
            프로젝트 수정
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
        {/* 프로젝트 정보 */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              프로젝트 정보
            </h3>
          </div>
          <div className="p-6.5">
            <div className="mb-4.5">
              <h4 className="mb-3 text-xl font-semibold text-black dark:text-white">
                {project.name}
              </h4>
            </div>
            <div className="mb-4">
              <p className="mb-2">
                <span className="font-medium">공종:</span> {project.workType}
              </p>
              <p className="mb-2">
                <span className="font-medium">주소:</span> {project.address}
              </p>
              <p className="mb-2">
                <span className="font-medium">작업 기간:</span>{" "}
                {new Date(project.from).toLocaleDateString()} ~{" "}
                {new Date(project.to).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">작업 내용:</span> {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* 지도 */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              작업 위치
            </h3>
          </div>
          <div className="p-6.5">
            <div className="h-[400px] w-full">
              <StaticMap 
                lat={project.latitude} 
                lng={project.longitude}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 작업자 현황 테이블 */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            작업자 현황
          </h3>
        </div>
        <div className="p-6.5">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    이름
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    작업 일정
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white text-center">
                    출근
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white text-center">
                    퇴근
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white text-center">
                    작업확인서
                  </th>
                </tr>
              </thead>
              <tbody>
                {project.projectStatuses && project.projectStatuses.length > 0 ? (
                  project.projectStatuses.map((status, index) => (
                    <tr key={index}>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">{status.userName || '-'}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">{status.schedule}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        {status.before ? (
                          <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                            완료
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                            미완료
                          </span>
                        )}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        {status.after ? (
                          <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                            완료
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                            미완료
                          </span>
                        )}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        {status.confirmation ? (
                          <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                            완료
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                            미완료
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">등록된 작업자가 없습니다.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProjectDetailPage; 