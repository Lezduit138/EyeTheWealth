import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  let filename = "";

  if (type === "ngos") {
    filename = "ngos_manual_template.csv";
  } else if (type === "financials") {
    filename = "financials_template.csv";
  } else if (type === "transactions") {
    filename = "transactions_template.csv";
  } else {
    return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data", "raw", filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Template file not found" }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
