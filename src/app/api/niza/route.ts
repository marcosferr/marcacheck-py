import { NextRequest, NextResponse } from "next/server";
import { getAllNizaClasses, searchNizaClasses, getNizaClass } from "@/lib/niza";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const classNumStr = searchParams.get("class");

  if (classNumStr) {
    const num = parseInt(classNumStr, 10);
    const cls = getNizaClass(num);
    if (!cls) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ class: cls });
  }

  if (query) {
    const results = searchNizaClasses(query, 10);
    return NextResponse.json({ classes: results });
  }

  return NextResponse.json({ classes: getAllNizaClasses() });
}
