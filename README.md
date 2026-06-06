# Pixel QR

Pixel QR is a small web app that generates a PNG QR code with a pixel-art PNG embedded at the center.

## Development

Install dependencies:

```bash
task install
```

Run both development servers:

```bash
task dev
```

Frontend runs at `http://localhost:4000`.
Backend runs at `http://localhost:9000`.

When opening the app from another device, set the API URL before starting:

```bash
NEXT_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:9000 task dev
```

Run checks:

```bash
task check
```
