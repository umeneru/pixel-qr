from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from src.main import app

client = TestClient(app)


def test_create_qr_code_returns_png() -> None:
    response = client.post(
        "/qr-codes",
        data={"url": "https://example.com", "pixel_size": "24"},
        files={"image": ("pixel.png", _png_bytes((48, 32)), "image/png")},
    )

    assert response.status_code == 201
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(b"\x89PNG")


def test_create_qr_code_rejects_missing_url() -> None:
    response = client.post(
        "/qr-codes",
        data={"url": ""},
        files={"image": ("pixel.png", _png_bytes((16, 16)), "image/png")},
    )

    assert response.status_code == 400
    assert response.json()["code"] == "missing_url"


def test_create_qr_code_rejects_invalid_pixel_size() -> None:
    response = client.post(
        "/qr-codes",
        data={"url": "https://example.com", "pixel_size": "65"},
        files={"image": ("pixel.png", _png_bytes((20, 20)), "image/png")},
    )

    assert response.status_code == 400
    assert response.json()["code"] == "invalid_pixel_size"


def _png_bytes(size: tuple[int, int]) -> bytes:
    buffer = BytesIO()
    Image.new("RGBA", size, (0, 128, 255, 255)).save(buffer, format="PNG")
    return buffer.getvalue()
