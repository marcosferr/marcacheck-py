import { NextRequest, NextResponse } from "next/server";
import { BrandClearanceEngine } from "@/lib/clearance";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const brandName = (body.brand_name || body.brandName || "").trim();
    const niceClassRaw = body.nice_class !== undefined ? body.nice_class : body.niceClass;
    const niceClass = niceClassRaw ? parseInt(String(niceClassRaw), 10) : undefined;
    const categoryHint = (body.category_hint || body.categoryHint || "").trim();

    if (!brandName) {
      return NextResponse.json(
        { success: false, error: "Debes ingresar una denominación de marca a investigar." },
        { status: 400 }
      );
    }

    const engine = new BrandClearanceEngine();
    const report = await engine.investigate({
      brandName,
      niceClass: !isNaN(niceClass as number) ? niceClass : undefined,
      categoryHint
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("Error in /api/investigate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al realizar la investigación de marca." },
      { status: 500 }
    );
  }
}
