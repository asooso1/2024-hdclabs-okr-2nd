import { useState, useEffect } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { User } from "@/lib/api/types";
import { userApi } from "@/lib/api/users";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User['user'] | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userApi.getUser(localStorage.getItem('userId') || '');
        setUser(userData.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  const maskPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '';
    
    // 숫자만 추출
    const numbers = phone.replace(/[^0-9]/g, '');
    
    // 전화번호 형식이 맞는지 확인
    if (numbers.length !== 11) return phone;

    // 마스킹 처리
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
  };

  const getInitial = (name: string | undefined) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const getRoleText = (role: string | undefined) => {
    if (!role) return '';
    return role === 'MANAGER' ? '관리자' : '작업자';
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="block relative lg:hidden flex items-center gap-4">
      <span className="block text-right lg:hidden max-w-xs overflow-hidden">
        <span className="block text-sm font-medium text-black dark:text-white">
          {user?.name}
        </span>
        <span className="block text-xs">
          {user && `${getRoleText(user.role)} (${maskPhoneNumber(user.phoneNumber)})`}
        </span>
      </span>
      <span className="h-12 w-12 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 flex items-center justify-center text-white">
        {user && getInitial(user.name)}
      </span>
    </ClickOutside>
  );
};

export default DropdownUser;
