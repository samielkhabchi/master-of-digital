import { NextResponse, type NextRequest } from "next/server";

// "/" → "/ru" for Russian-speaking browsers, "/en" otherwise.
export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept-language") ?? "";
  const locale = /^\s*(ru|uk|be|kk)\b/i.test(accept) ? "ru" : "en";
  return NextResponse.redirect(new URL(`/${locale}`, req.url));
}

export const config = { matcher: ["/"] };
