import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(req: NextRequest) {
  try {
    const isAdmin = req.cookies.get('isAdmin')?.value === 'true';

    if (!isAdmin) {
      return NextResponse.redirect("/admin/login");
    }

    return null;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.redirect("/admin/login");
  }
}
