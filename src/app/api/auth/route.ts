import { NextResponse } from "next/server";

interface LoginRequest {
  loginId: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    
    if (body.loginId === "admin" && body.password === "admin") {
      return NextResponse.json({
        success: true,
        userId: "6744379551dad806db3c9f23",
      });
    }

    return NextResponse.json({
      success: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "로그인 중 오류가 발생했습니다.",
    }, { status: 500 });
  }
} 