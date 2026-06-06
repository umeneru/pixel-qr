from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.qr_codes import router as qr_codes_router


app = FastAPI(title="Pixel QR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+$",
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(qr_codes_router)
