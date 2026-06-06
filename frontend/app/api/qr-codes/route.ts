const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:9000";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await fetch(`${API_BASE_URL}/qr-codes`, {
    method: "POST",
    body: formData,
  });

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (contentDisposition) {
    headers.set("content-disposition", contentDisposition);
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers,
  });
}
