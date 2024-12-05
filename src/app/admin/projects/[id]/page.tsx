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
import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";

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
  projectStatuses?: ProjectStatus[];
}

interface ProjectStatus {
  userId: string;
  userName: string | null;
  schedule: string;
  before: string | null;
  after: string | null;
  confirmation: string | null;
}

interface UserSummary {
  userId: string;
  userName: string;
  beforeCount: number;
  afterCount: number;
  confirmationCount: number;
}

const ProjectDetailPage = () => {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [filteredStatuses, setFilteredStatuses] = useState<ProjectStatus[]>([]);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const response = await projectApi.getProject(localStorage.getItem('userId') || '', params.id as string);
        setProject(response as Project);
      } catch (error) {
        console.error("프로젝트 상세 정보 가져오기 실패:", error);
        toast.error("프로젝트 정보를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [params.id]);

  useEffect(() => {
    if (!project?.projectStatuses) return;

    const filteredData = project.projectStatuses.filter(status => {
      const statusDate = new Date(status.schedule);
      return statusDate >= new Date(dateRange.from) && statusDate <= new Date(dateRange.to);
    });

    // 사용자별 통계 계산
    const summaries: UserSummary[] = [];
    const userMap = new Map<string, UserSummary>();

    filteredData.forEach(status => {
      if (!status.userId || !status.userName) return;

      if (!userMap.has(status.userId)) {
        userMap.set(status.userId, {
          userId: status.userId,
          userName: status.userName,
          beforeCount: 0,
          afterCount: 0,
          confirmationCount: 0,
        });
      }

      const summary = userMap.get(status.userId)!;
      if (status.before) summary.beforeCount++;
      if (status.after) summary.afterCount++;
      if (status.confirmation) summary.confirmationCount++;
    });

    setUserSummaries(Array.from(userMap.values()));
    
    // 선택된 사용자의 상세 현황 필터링
    if (selectedUser) {
      setFilteredStatuses(
        filteredData.filter(status => status.userId === selectedUser)
      );
    }
  }, [project, dateRange, selectedUser]);

  if (loading) return <Loader />;
  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="프로젝트 상세" />
        {/* <Link href={`/admin/projects/${params.id}/edit`}>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90">
            프로젝트 수정
          </button>
        </Link> */}
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-default overflow-hidden mb-6">
            <div className="relative h-40 bg-gradient-to-r from-primary/90 to-primary">
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              <div className="absolute bottom-6 left-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 text-sm font-medium bg-white text-primary rounded-full">
                    {project.workType}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {project.name}
                </h1>
                <div className="flex items-center text-white/90">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">{project.address}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                      작업 기간
                    </h3>
                    <div className="flex items-center text-black dark:text-white">
                      <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium">
                        {new Date(project.from).toLocaleDateString()} ~ {new Date(project.to).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                      작업 내용
                    </h3>
                    <p className="font-medium text-black dark:text-white">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="h-full min-h-[200px] rounded-lg overflow-hidden">
                  <StaticMap
                    lat={project.latitude}
                    lng={project.longitude}
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 날짜 필터 */}
        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="border rounded-lg px-4 py-2"
          />
          <span className="self-center">~</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="border rounded-lg px-4 py-2"
          />
        </div>

        {/* 사용자별 통계 테이블 */}
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-default mb-6">
          <div className="border-b border-stroke p-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              작업자별 통계
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="p-4 font-medium text-black dark:text-white">이름</th>
                  <th className="p-4 font-medium text-black dark:text-white">출근</th>
                  <th className="p-4 font-medium text-black dark:text-white">퇴근</th>
                  <th className="p-4 font-medium text-black dark:text-white">작업확인서</th>
                </tr>
              </thead>
              <tbody>
                {userSummaries.map((summary) => (
                  <tr
                    key={summary.userId}
                    onClick={() => setSelectedUser(summary.userId)}
                    className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4 
                      ${selectedUser === summary.userId ? 'bg-gray-100 dark:bg-meta-4' : ''}`}
                  >
                    <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                      {summary.userName}
                    </td>
                    <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                      {summary.beforeCount}
                    </td>
                    <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                      {summary.afterCount}
                    </td>
                    <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                      {summary.confirmationCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 선택된 작업자의 상세 현황 */}
        {selectedUser && (
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-default">
            <div className="border-b border-stroke p-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                작업자 상세 현황
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="p-4 font-medium text-black dark:text-white">날짜</th>
                    <th className="p-4 font-medium text-black dark:text-white">출근</th>
                    <th className="p-4 font-medium text-black dark:text-white">퇴근</th>
                    <th className="p-4 font-medium text-black dark:text-white">작업확인서</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStatuses.map((status, index) => (
                    <tr key={index}>
                      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                        {format(new Date(status.schedule), 'yyyy-MM-dd')}
                      </td>
                      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                        {status.before ? '완료' : '-'}
                      </td>
                      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                        {status.after ? '완료' : '-'}
                      </td>
                      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
                        {status.confirmation ? '완료' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ProjectDetailPage; 