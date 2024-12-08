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
    } else if (body.loginId === "이효민" && body.password === "9458") {
      return NextResponse.json({
        success: true,
        userId: "67529f8c8aaac94f9380199d",
      });
    } else if (body.loginId === "정인우" && body.password === "5913") {
      return NextResponse.json({
        success: true,
        userId: "6752812a8aaac94f9380199b",
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