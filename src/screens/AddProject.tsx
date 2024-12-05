'use client';

import { MouseEvent, KeyboardEvent, Suspense } from 'react';
import { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import AsyncSelect from 'react-select/async';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { User } from '@/lib/api/types';
import dynamic from 'next/dynamic';
import { projectApi } from '@/lib/api/projects';
import Modal from '@/components/Modal';
import { components } from 'react-select';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/api/types';

let cachedUsers: { value: string; label: string }[] | null = null;

const searchUsers = async (inputValue: string) => {

  if (!cachedUsers) {
    const userId = localStorage.getItem('userId');
    try {
      if (!userId) {
        throw new Error('사용자 ID를 찾을 수 없습니다');
      }
      const response = await adminApi.searchUsers(userId);
      if (!response) {
        throw new Error('사용자 검색에 실패했습니다');
      }
      cachedUsers = response.map((user: User) => ({
        value: user.id.toString(),
        label: user.name
      }));
    } catch (error) {
      console.error('사용자 검색 중 오류 발생:', error);
      return [];
    }
  }
  const filteredUsers = cachedUsers.filter((user) => user.label.includes(inputValue));
  if (inputValue === '' || filteredUsers.length === 0) {
    return cachedUsers;
  }
  return filteredUsers;
};

const KakaoMap = dynamic(() => import('@/components/Maps/KakaoMap'), {
  ssr: false,
});

// 아이콘 컴포넌트들 추가
const ProjectIcon = () => (
  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path fillRule="evenodd" clipRule="evenodd" d="M.75 4A3.25 3.25 0 014 .75h8.844c.865 0 1.695.343 2.306.954l3.896 3.896A3.25 3.25 0 0120 7.906V16A3.25 3.25 0 0116.75 19.25H4A3.25 3.25 0 01.75 16V4zm3.25-1.75a1.75 1.75 0 00-1.75 1.75v12c0 .966.784 1.75 1.75 1.75h12.75A1.75 1.75 0 0018.5 16V7.906a1.75 1.75 0 00-.513-1.237l-3.896-3.896a1.75 1.75 0 00-1.237-.513H4z" fill=""/>
    </g>
  </svg>
);

const WorkTypeIcon = () => (
  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z" fill=""/>
    </g>
  </svg>
);

const CalendarIcon = () => (
  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.72039 1.99922C4.42517 1.99922 4.99622 2.57026 4.99622 3.27505V4.18016H14.9962V3.27505C14.9962 2.57026 15.5673 1.99922 16.2721 1.99922C16.9769 1.99922 17.5479 2.57026 17.5479 3.27505V4.18016H18.1721C19.1795 4.18016 20 4.96205 20 5.96912V16.211C20 17.2181 19.1795 18 18.1721 18H1.82789C0.820428 18 0 17.2181 0 16.211V5.96912C0 4.96205 0.820428 4.18016 1.82789 4.18016H2.45211V3.27505C2.45211 2.57026 3.02316 1.99922 3.72039 1.99922ZM17.5479 6.73244V7.63755C17.5479 8.34234 16.9769 8.91338 16.2721 8.91338C15.5673 8.91338 14.9962 8.34234 14.9962 7.63755V6.73244H4.99622V7.63755C4.99622 8.34234 4.42517 8.91338 3.72039 8.91338C3.02316 8.91338 2.45211 8.34234 2.45211 7.63755V6.73244H1.82789C1.67392 6.73244 1.55211 6.86155 1.55211 7.0157V16.211C1.55211 16.3652 1.67392 16.4943 1.82789 16.4943H18.1721C18.3261 16.4943 18.4479 16.3652 18.4479 16.211V7.0157C18.4479 6.86155 18.3261 6.73244 18.1721 6.73244H17.5479Z" fill=""/>
    </g>
  </svg>
);

const DescriptionIcon = () => (
  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path d="M18.0758 2.8025H1.92422C1.24922 2.8025 0.724219 3.36187 0.724219 4.0025V15.8025C0.724219 16.4775 1.28359 17.0025 1.92422 17.0025H18.0758C18.7508 17.0025 19.2758 16.4431 19.2758 15.8025V4.0025C19.2758 3.32750 18.7164 2.8025 18.0758 2.8025ZM17.7508 4.31875V15.4862H2.24922V4.31875H17.7508Z" fill=""/>
      <path d="M15.4347 7.0025H4.56719C4.22344 7.0025 3.94844 6.72750 3.94844 6.38375C3.94844 6.04000 4.22344 5.76500 4.56719 5.76500H15.4347C15.7785 5.76500 16.0535 6.04000 16.0535 6.38375C16.0535 6.72750 15.7785 7.0025 15.4347 7.0025Z" fill=""/>
      <path d="M15.4347 9.6025H4.56719C4.22344 9.6025 3.94844 9.32750 3.94844 8.98375C3.94844 8.64000 4.22344 8.36500 4.56719 8.36500H15.4347C15.7785 8.36500 16.0535 8.64000 16.0535 8.98375C16.0535 9.32750 15.7785 9.6025 15.4347 9.6025Z" fill=""/>
      <path d="M15.4347 12.2025H4.56719C4.22344 12.2025 3.94844 11.9275 3.94844 11.5838C3.94844 11.2400 4.22344 10.9650 4.56719 10.9650H15.4347C15.7785 10.9650 16.0535 11.2400 16.0535 11.5838C16.0535 11.9275 15.7785 12.2025 15.4347 12.2025Z" fill=""/>
    </g>
  </svg>
);

const LocationIcon = () => (
  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path d="M10.0001 0C6.0501 0 2.8501 3.2 2.8501 7.15C2.8501 12.3875 9.2376 19.4625 9.5126 19.7625C9.7876 20.0875 10.2126 20.0875 10.4876 19.7625C10.7626 19.4625 17.1501 12.3875 17.1501 7.15C17.1501 3.2 13.9501 0 10.0001 0ZM10.0001 10.725C8.0251 10.725 6.4251 9.125 6.4251 7.15C6.4251 5.175 8.0251 3.575 10.0001 3.575C11.9751 3.575 13.5751 5.175 13.5751 7.15C13.5751 9.125 11.9751 10.725 10.0001 10.725Z" fill=""/>
    </g>
  </svg>
);

const AddProject = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [workType, setWorkType] = useState('');
  const [recommendedDates, setRecommendedDates] = useState<Date[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [location, setLocation] = useState({
    latitude: 37.566826,
    longitude: 126.9786567,
    address: '',
    detailAddress: ''
  });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // 유저 추가를 위한 상태
  const [newUser, setNewUser] = useState({
    name: '',
    phoneNumber: '',
    cost: 0
  });

  useEffect(() => {
    const preloadUsers = async () => {
      await searchUsers('');
    };
    preloadUsers();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('현재 위치를 가져오는데 실패했습니다:', error);
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !description || !workType || !location.address || !startDate || !endDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    try {
      const projectData = {
        managerId: localStorage.getItem('userId'),
        name: projectName,
        description: description,
        workType: workType,
        address: location.address + ' ' + location.detailAddress,
        latitude: location.latitude,
        longitude: location.longitude,
        from: startDate ? startDate.toISOString().split('T')[0] : '',
        to: endDate ? endDate.toISOString().split('T')[0] : '',
        preferences: recommendedDates.map(date => date.toISOString().split('T')[0]) as unknown as [],
        userIds: selectedUsers.map((user: any) => user.value)
      };

      const response = await projectApi.createProject(projectData as Partial<Project>);
      if (response.id) {
        router.push(`/admin/projects/${response.id}`);
      }
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      // 에러 처리
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }));
  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(prev => ({
      ...prev,
      detailAddress: e.target.value
    }));
  };

  const handleAddUser = async () => {
    try {
      const managerId = localStorage.getItem('userId');
      if (!managerId) {
        throw new Error('관리자 ID를 찾을 수 없습니다');
      }
      const formattedPhoneNumber = newUser.phoneNumber.replace(/[^0-9]/g, '');
      if (formattedPhoneNumber.length === 11) {
        newUser.phoneNumber = `${formattedPhoneNumber.slice(0, 3)}-${formattedPhoneNumber.slice(3, 7)}-${formattedPhoneNumber.slice(7)}`;
      } else if (formattedPhoneNumber.length === 10) {
        newUser.phoneNumber = `${formattedPhoneNumber.slice(0, 3)}-${formattedPhoneNumber.slice(3, 6)}-${formattedPhoneNumber.slice(6)}`;
      }
      const response = await adminApi.createUser({
        ...newUser,
        role: 'WORKER'
      });

      if (cachedUsers) {
        const newUserOption = {
          value: response.id.toString(),
          label: response.name
        };
        cachedUsers = [...cachedUsers, newUserOption];

        setSelectedUsers(prev => [...prev, newUserOption]);
      }

      setIsAddUserModalOpen(false);
      setNewUser({ name: '', phoneNumber: '', cost: 0 });

    } catch (error) {
      console.error('유저 추가 실패:', error);
    }
  };

  const loadOptions = async (inputValue: string) => {
    const users = await searchUsers(inputValue);
    return [
      {
        value: 'add-user',
        label: '+ 작업자 등록',
        isAddOption: true,
        isFixed: true
      },
      ...(users || [])
    ];
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Enter 키의 기본 동작 방지
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="프로젝트 등록" />

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                프로젝트명
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="프로젝트명을 입력하세요"
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-3">
                  <ProjectIcon />
                </span>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                공종
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  placeholder="작업종류를 입력하세요"
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-3">
                  <WorkTypeIcon />
                </span>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                프로젝트 기간
              </label>
              <div className="relative">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  locale={ko}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="기간 선택"
                  wrapperClassName='w-full'
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-3">
                  <CalendarIcon />
                </span>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                업무내용
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="업무내용을 입력하세요"
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <span className="absolute right-4 top-3">
                  <DescriptionIcon />
                </span>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                작업자
              </label>
              <AsyncSelect
                isMulti
                closeMenuOnSelect={false}
                value={selectedUsers}
                onChange={(selected: any) => {
                  if (!selected) {
                    setSelectedUsers([]);
                    return;
                  }

                  const addUserOption = selected.find((option: any) => option.value === 'add-user');
                  if (addUserOption) {
                    const filteredSelection = selected.filter((option: any) => option.value !== 'add-user');
                    setSelectedUsers(filteredSelection);
                    setIsAddUserModalOpen(true);
                  } else {
                    setSelectedUsers(selected);
                  }
                }}
                placeholder="작업자를 검색 및 선택해주세요 (복수선택 가능)"
                cacheOptions
                defaultOptions={true}
                loadOptions={loadOptions}
                isSearchable
                noOptionsMessage={() => '검색어를 입력해주세요'}
                className="react-select-container dark:bg-form-input"
                classNamePrefix="react-select"
                components={{
                  Option: ({ children, ...props }: any) => {
                    if (props.data.isAddOption) {
                      return (
                        <components.Option {...props}>
                          <div className="text-primary font-medium">{children}</div>
                        </components.Option>
                      );
                    }
                    return <components.Option {...props}>{children}</components.Option>;
                  }
                }}
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                추천 작업시작일
              </label>
              <DatePicker
                selected={recommendedDates[0] || null}
                onChange={(date: Date | null) => {
                  if (!date) return;

                  // 선택된 날짜가 프로젝트 기간 내에 있는지 확인
                  if (startDate && endDate) {
                    if (date < startDate || date > endDate) {
                      alert('프로젝트 기간 내의 날짜만 선택 가능합니다.');
                      return;
                    }
                  }

                  setRecommendedDates(prev => {
                    const dateExists = prev.some(
                      d => d.toDateString() === date.toDateString()
                    );

                    if (dateExists) {
                      return prev.filter(
                        d => d.toDateString() !== date.toDateString()
                      );
                    }
                    return [...prev, date];
                  });
                }}
                inline
                locale={ko}
                dateFormat="yyyy-MM-dd"
                className="w-full"
                highlightDates={recommendedDates}
                minDate={startDate || undefined}
                maxDate={endDate || undefined}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendedDates.map((date, index) => (
                  <span
                    key={index}
                    className="rounded bg-primary bg-opacity-10 px-3 py-1 text-lg text-primary dark:text-whiten"
                  >
                    {date.toLocaleDateString('ko-KR')}
                    <button
                      type="button"
                      className="ml-2 text-lg"
                      onClick={() => {
                        setRecommendedDates(prev =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                작업 위치
              </label>
              <div className="mb-3">
                <KakaoMap
                  onLocationSelect={handleLocationSelect}
                  useCurrentLocation={true}
                />
              </div>
              <div className="relative mb-3">
                <input
                  type="text"
                  value={location.address}
                  readOnly
                  placeholder="주소검색 후 장소를 선택하세요"
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-3">
                  <LocationIcon />
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={location.detailAddress}
                  onChange={handleDetailAddressChange}
                  placeholder="상세주소를 입력하세요"
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-3">
                  <LocationIcon />
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-white"
            >
              등록
            </button>
          </div>
        </form>
      </div>
      {isAddUserModalOpen && (
        <Modal title="작업자 등록" onClose={() => setIsAddUserModalOpen(false)}>
          <div className="p-4">
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">이름</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">전화번호</label>
              <input
                type="tel"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">일당</label>
              <input
                type="text"
                value={newUser.cost}
                onChange={(e) => setNewUser(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-xl bg-gray-200 px-4 py-2 font-medium text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddUser}
                className="rounded-xl bg-primary px-4 py-2 font-medium text-white"
              >
                추가
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DefaultLayout>
  );
};

export default AddProject;
