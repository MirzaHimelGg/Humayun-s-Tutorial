import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const referer = req.headers.get("referer");
  let redirectUrl = "/";
  if (referer) {
    try {
      redirectUrl = new URL(referer).pathname;
    } catch (e) {
      redirectUrl = "/";
    }
  }
  
  const response = NextResponse.redirect(new URL(redirectUrl, req.url));

  // Clear cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
