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
// 사용자 검색을 위한 API 호출 함수
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
        value: user.id,
        label: user.name
      }));
    } catch (error) {
      console.error('사용자 검색 중 오류 발생:', error);
      cachedUsers = [{value:'123', label:'테스트'}];
      // return [];
      return cachedUsers;
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

const AddProject = () => {
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
    console.log(recommendedDates);
  }, [recommendedDates]);

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
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }
    try {
      const projectData = {
        managerId: localStorage.getItem('userId'),
        name: projectName,
        description: description,
        workType: workType,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        from: startDate ? startDate.toISOString().split('T')[0] : '',
        to: endDate ? endDate.toISOString().split('T')[0] : '',
        locationDetail: location.detailAddress,
        preferences: recommendedDates.map(date => date.toISOString().split('T')[0]),
        userIds: selectedUsers.map((user: any) => user.value)
      };

      console.log(projectData);
      // await projectApi.createProject(projectData);
      // 성공 처리
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

  // TODO: 유저 추가 로직 수정
  const handleAddUser = async () => {
    try {
      const managerId = localStorage.getItem('userId');
      if (!managerId) {
        throw new Error('관리자 ID를 찾을 수 없습니다');
      }

      const response = await adminApi.createUser({
        ...newUser,
        role: 'WORKER'
      });
      console.log(cachedUsers)
      if (cachedUsers) {
        cachedUsers = await searchUsers('');
      }

      setSelectedUsers(prev => [...prev, {
        value: response.id,
        label: response.name
      }]);

      setIsAddUserModalOpen(false);
      setNewUser({ name: '', phoneNumber: '', cost: 0 });
      
    } catch (error) {
      console.error('유저 추가 실패:', error);
    }
  };

  const loadOptions = async (inputValue: string) => {
    const users = await searchUsers(inputValue);
    return [
      ...users,
      {
        value: 'add-user',
        label: '+ 새로운 유저 추가',
        isAddOption: true
      }
    ];
  };

  return (
      <DefaultLayout>
        <Breadcrumb pageName="프로젝트 등록" />

        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  프로젝트명
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="프로젝트명을 입력하세요"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  공종
                </label>
                <input
                  type="text"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  placeholder="작업종류를 입력하세요"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-4.5 w-full">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  프로젝트 기간
                </label>
                <div className="flex gap-4 w-full">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    locale={ko}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작일"
                    className="w-full grow rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    minDate={startDate || undefined}
                    locale={ko}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="마감일"
                    className="w-full grow rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  업무내용
                </label>
                <textarea
                  rows={4}
                  placeholder="업무내용을 입력하세요"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}

                ></textarea>
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  담당 인원
                </label>
                <AsyncSelect
                  isMulti
                  closeMenuOnSelect={false}
                  onChange={(selected: any) => {
                    if (selected) {
                      const addUserOption = selected.find((option: any) => option.isAddOption);
                      if (addUserOption) {
                        // 추가 옵션 제거
                        const filteredSelection = selected.filter((option: any) => !option.isAddOption);
                        setSelectedUsers(filteredSelection);
                        // 모달 열기
                        setIsAddUserModalOpen(true);
                      } else {
                        setSelectedUsers(selected);
                      }
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  placeholder="담당자를 선택해주세요 (복수선택 가능)"
                  cacheOptions
                  defaultOptions={true}
                  loadOptions={loadOptions}
                  isSearchable
                  noOptionsMessage={() => '검색어를 입력해주세요'}
                  className="react-select-container dark:bg-form-input"
                  classNamePrefix="react-select"
                />
              </div>

              {/* <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  작업기간 (일)
                </label>
                <input
                  type="number"
                  placeholder="작업기간을 입력하세요"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
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
                      className="rounded bg-primary bg-opacity-10 px-3 py-1 text-sm text-primary dark:text-whiten"
                    >
                      {date.toLocaleDateString('ko-KR')}
                      <button
                        type="button"
                        className="ml-2 text-xs"
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
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  작업 위치
                </label>
                
                <div className="mb-3">
                  <KakaoMap 
                    onLocationSelect={handleLocationSelect}
                    useCurrentLocation={true}
                  />
                </div>
                <input
                  type="text"
                  value={location.address}
                  readOnly
                  placeholder="주소검색 후 장소를 선택하세요"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary mb-3"
                />
                <input
                  type="text"
                  value={location.detailAddress}
                  onChange={handleDetailAddressChange}
                  placeholder="상세주소를 입력하세요"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                프로젝트 등록
              </button>
            </div>
          </form>
        </div>

        {isAddUserModalOpen && (
          <Modal title="새로운 유저 추가" onClose={() => setIsAddUserModalOpen(false)}>
            <div className="p-4">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">이름</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">전화번호</label>
                <input
                  type="tel"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">일당</label>
                <input
                  type="number"
                  value={newUser.cost}
                  onChange={(e) => setNewUser(prev => ({ ...prev, cost: Number(e.target.value) }))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-white"
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
