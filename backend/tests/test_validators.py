from io import BytesIO
import asyncio

import pytest
from fastapi import UploadFile
from PIL import Image

from src.services.image_validator import ImageValidationError, load_pixel_image
from src.services.url_validator import UrlValidationError, validate_url


def test_validate_url_accepts_http_and_https() -> None:
    assert validate_url("https://example.com") == "https://example.com"
    assert validate_url(" http://example.com ") == "http://example.com"


@pytest.mark.parametrize("value", ["", "example.com", "ftp://example.com"])
def test_validate_url_rejects_invalid_values(value: str) -> None:
    with pytest.raises(UrlValidationError):
        validate_url(value)


def test_load_pixel_image_accepts_supported_png() -> None:
    upload = _png_upload(size=(32, 32))

    image = asyncio.run(load_pixel_image(upload, 32))

    assert image.size == (32, 32)
    assert image.mode == "RGB"


def test_load_pixel_image_resizes_to_requested_pixel_size() -> None:
    upload = _png_upload(size=(2, 2))

    image = asyncio.run(load_pixel_image(upload, 4))

    assert image.size == (4, 4)
    assert image.getpixel((0, 0)) == image.getpixel((1, 1))
    assert image.getpixel((0, 0)) != image.getpixel((3, 3))


def test_load_pixel_image_rejects_invalid_pixel_size() -> None:
    upload = _png_upload(size=(24, 24))

    with pytest.raises(ImageValidationError) as error:
        asyncio.run(load_pixel_image(upload, 65))

    assert error.value.code == "invalid_pixel_size"


def _png_upload(size: tuple[int, int]) -> UploadFile:
    buffer = BytesIO()
    image = Image.new("RGBA", size, (255, 0, 0, 255))
    if size == (2, 2):
        image.putpixel((1, 1), (0, 0, 255, 255))
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return UploadFile(filename="pixel.png", file=buffer, headers={"content-type": "image/png"})
