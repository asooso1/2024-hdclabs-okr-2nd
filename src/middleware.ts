import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // URL에서 searchParams 가져오기
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  // 응답 헤더에 스크립트 추가
  if (userId || projectId) {
    const script = `
      if (typeof window !== 'undefined') {
        ${userId ? `localStorage.setItem('userId', '${userId}');` : ""}
        ${projectId ? `localStorage.setItem('projectId', '${projectId}');` : ""}
      }
    `;

    // HTML 응답에 스크립트 주입
    response.headers.set(
      "Set-Cookie",
      `middleware-script=${encodeURIComponent(script)}; Path=/`,
    );
  }

  return response;
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
