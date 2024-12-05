import Image from "next/image";
import { useState } from "react";
import Link from 'next/link';
import { Project } from '@/lib/api/types';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';

interface TableTwoProps {
  projects: Project[];
  loading: boolean;
}

const AdminProject = ({ projects, loading }: TableTwoProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    workType: '',
    address: '',
    description: '',
    userName: ''
  });

  const handleFilterChange = (key: keyof typeof searchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeSelect = (days: number) => {
    const date = new Date();
    if (days > 0) {
      date.setDate(date.getDate() - days);
    }
    setSelectedDate(date);
  };

  const filteredProjects = projects.filter(project => {
    // 날짜 필터링
    if (selectedDate) {
      const projectStart = new Date(project.from);
      const projectEnd = new Date(project.to);
      projectStart.setHours(0, 0, 0, 0);
      projectEnd.setHours(23, 59, 59, 999);
      const checkDate = new Date(selectedDate);
      checkDate.setHours(0, 0, 0, 0);
      
      if (!(checkDate >= projectStart && checkDate <= projectEnd)) return false;
    }

    // 텍스트 필터링
    const matchName = project.name?.toLowerCase().includes(searchFilters.name.toLowerCase()) ?? true;
    const matchWorkType = project.workType?.toLowerCase().includes(searchFilters.workType.toLowerCase()) ?? true;
    const matchAddress = project.address?.toLowerCase().includes(searchFilters.address.toLowerCase()) ?? true;
    const matchDescription = project.description?.toLowerCase().includes(searchFilters.description.toLowerCase()) ?? true;
    const matchUserName = project.projectStatuses?.some(status => 
      status.userName?.toLowerCase().includes(searchFilters.userName.toLowerCase())
    ) ?? true;

    return matchName && matchWorkType && matchAddress && matchDescription && matchUserName;
  });

  const renderLoading = () => (
    <div className="rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          프로젝트 목록
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
          <p className="font-medium">작 참여자</p>
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
    <div className="rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-boxdark">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
            프로젝트 목록
          </h4>
          <Link href="/admin/projects/add">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-blue-600">
              프로젝트 추가
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">날짜 선택</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                locale={ko}
                dateFormat="yyyy-MM-dd"
                className="w-full sm:w-auto px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <div className="grid grid-cols-3 sm:flex gap-2">
                {[
                  { label: '오늘', days: 0 },
                  { label: '1주일', days: 7 },
                  { label: '1개월', days: 30 },
                  { label: '3개월', days: 90 },
                  { label: '6개월', days: 180 },
                ].map(({ label, days }) => (
                  <button
                    key={days}
                    onClick={() => handleDateRangeSelect(days)}
                    className="px-2 sm:px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 whitespace-nowrap"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">프로젝트명</label>
              <input
                type="text"
                placeholder="프로젝트명 검색..."
                value={searchFilters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">작업종류</label>
              <input
                type="text"
                placeholder="작업종류 검색..."
                value={searchFilters.workType}
                onChange={(e) => handleFilterChange('workType', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">작업 위치</label>
              <input
                type="text"
                placeholder="작업 위치 검색..."
                value={searchFilters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">작업 참여자</label>
              <input
                type="text"
                placeholder="작업 참여자 검색..."
                value={searchFilters.userName}
                onChange={(e) => handleFilterChange('userName', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="overflow-hidden border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            <div className="col-span-6 md:col-span-3">프로젝트명</div>
            <div className="col-span-3 md:col-span-2">작업종류</div>
            <div className="col-span-3 md:col-span-2">작업 기간</div>
            <div className="hidden md:block md:col-span-2">작업 위치</div>
            <div className="hidden md:block md:col-span-2">비고</div>
            <div className="hidden md:block md:col-span-1">참여자</div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/admin/projects/${project.id}`}>
                <div className="grid grid-cols-12 items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="col-span-6 md:col-span-3 font-medium text-gray-900 dark:text-white">
                    {project.name || '-'}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {project.workType || '-'}
                    </span>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="md:hidden">
                      {new Date(project.from).toLocaleDateString().slice(5)}
                      {' ~ '}
                      {new Date(project.to).toLocaleDateString().slice(5)}
                    </span>
                    <span className="hidden md:block">
                      {new Date(project.from).toLocaleDateString()}
                      <br />
                      {new Date(project.to).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm text-gray-500 dark:text-gray-400">
                    {project.address || '-'}
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm text-gray-500 dark:text-gray-400">
                    {project.description || '-'}
                  </div>
                  <div className="hidden md:block md:col-span-1">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {project.projectStatuses?.length || 0}명
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProject;
