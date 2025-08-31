import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(req: NextRequest) {
  const isAdmin = req.cookies.get("isAdmin")?.value === "true";
  if (!isAdmin) {
    return NextResponse.redirect("/admin/login");
  }
  return null;
}
