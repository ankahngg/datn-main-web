// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_BASE_URL } from "./config/app.config";

export async function proxy(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  // const hasAccessToken = request.cookies.has("access_token");
  // if (!hasAccessToken) {
  //   const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login-normal`, {
  //     method: "POST",
  //     body: JSON.stringify({
  //       username: "admin",
  //       password: "admin",
  //     }),
  //     credentials: "include",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   if (loginRes.ok) {
  //     console.log("[Proxy] Logged in successfully");
  //     return NextResponse.next();
  //   } else {
  //     return new NextResponse("Unauthorized", { status: 401 });
  //   }
  // }
  return NextResponse.next();
}

// 4. Chỉ định các đường dẫn chạy qua người gác cổng này
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
