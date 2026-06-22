// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_BASE_URL } from "./config/app.config";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET!);

async function verifyToken(token: string) {
  try {
    console.log("Verifying token with secret:", process.env.NEXT_PUBLIC_JWT_SECRET);
    console.log("Secret : ", secret);
    const { payload } = await jwtVerify(token, secret);
    return payload; // hợp lệ + chưa hết hạn
  } catch (err) {
    console.error("Token verification error:", err);
    return null; // hết hạn hoặc sai
  }
}

export async function proxy(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  const token = request.cookies.get("access_token")?.value;
  let isValid = false;

   if (token) {
    const payload = await verifyToken(token);
    isValid = !!payload;
  }

  if (!isValid) {
    console.log("[Proxy] No valid token found, do login");

    const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login-normal`, {
      method: "POST",
      body: JSON.stringify({
        username: "admin",
        password: "admin",
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (loginRes.ok) {
        console.log("[Proxy] Logged in successfully");
        return NextResponse.next();
    }
    else {
        console.error("[Proxy] Login failed with status:", loginRes.status);
        return new NextResponse("Unauthorized", { status: 401 });
    }
  }
  console.log("[Proxy] Valid token found, proceed to API");
  return NextResponse.next();
}

// 4. Chỉ định các đường dẫn chạy qua người gác cổng này
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
