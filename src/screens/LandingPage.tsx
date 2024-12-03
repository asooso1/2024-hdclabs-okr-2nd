"use client";
import { Metadata } from "next";
import React, { useState } from "react";
import GradientBg from "@/components/main/gradient-bg";
import { useRouter } from "next/navigation";

export const metadata: Metadata = {
  title: {
    template: "%s | HDCLABS 근태관리시스템",
    default: "HDCLABS 근태관리시스템",
  },
  description: "HDCLABS 근태관리시스템",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function LandingLayout() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("userId", data.userId);
      router.push("/admin/dashboard");
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="w-full flex min-h-screen bg-white">
        <div className={`relative hidden w-1/2 lg:block`}>
          <GradientBg className="absolute left-0 top-0 h-full w-full" />
        </div>

        <div className="w-full lg:w-1/2">
          <div className="relative flex h-full items-center justify-center">
            <section className="w-full px-5 pb-10 text-gray-800 sm:w-4/6 sm:px-0 md:w-3/6 lg:w-4/6 xl:w-3/6">
              <div className="flex flex-col items-start justify-center pr-2 sm:mt-0">
                <h2 className="inter mt-2 text-5xl font-bold leading-tight">
                  <img
                    src={"/images/logo/logo.svg"}
                    className=" h-10 w-40"
                    alt="logo"
                  />
                </h2>
                <div className="mt-8 text-3xl font-bold text-black">근태관리시스템에 오신 것을 환영합니다</div>
                <div className="mt-2 text-xl text-gray-400">나의 작업 내역 및 현황을 한번에 확인하세요</div>
              </div>
              
              {/* 로그인 폼 추가 */}
              <div className="mt-12">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      아이디
                    </label>
                    <div className="relative">
                      <input
                        type="loginId"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="아이디를 입력해주세요"
                        className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      <span className="absolute right-4 top-3">
                        <svg
                          className="fill-current"
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.5">
                            <path
                              d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력해주세요"
                        className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      <span className="absolute right-4 top-3">
                        <svg
                          className="fill-current"
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.5">
                            <path
                              d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                              fill=""
                            />
                            <path
                              d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.0156 10.9977 17.0156C11.4102 17.0156 11.7883 16.6719 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-primary bg-primary p-3 text-white transition hover:bg-opacity-90"
                    >
                      로그인
                    </button>
                  </div>

                  {/* <div className="mt-6 text-center text-sm text-gray-600">
                    계정이 없으신가요?{" "}
                    <a href="#" className="text-primary hover:underline">
                      관리자에게 요청하기
                    </a>
                  </div> */}
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}