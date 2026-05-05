/**
 * GET /api/docs        → OpenAPI JSON spec
 * GET /api/docs?ui=1   → Swagger UI HTML
 */

import { NextRequest, NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/swagger";

export async function GET(req: NextRequest) {
  const spec = buildOpenApiSpec();
  const wantsUi = req.nextUrl.searchParams.get("ui") === "1";

  if (wantsUi) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>VisaHub API Docs</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      withCredentials: true,
    });
  </script>
</body>
</html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
