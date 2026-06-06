from io import BytesIO

import qrcode
from PIL import Image
from qrcode.constants import ERROR_CORRECT_H

from src.services.qr_generator import (
    MAX_EMBEDDED_MODULE_RATIO,
    MIN_READABLE_MODULE_PIXEL_SIZE,
    QR_BORDER_MODULES,
    _embedded_module_size,
    _embedded_position,
    _minimum_safe_qr_version,
    _resize_pixel_image,
    _total_modules,
    generate_pixel_qr_png,
)


def test_embedded_pixel_size_matches_qr_module_size() -> None:
    pixel_image = Image.new("RGB", (32, 32), "red")
    qr = _make_qr("https://example.com", pixel_image)

    embedded_modules = _embedded_module_size(qr, pixel_image)
    embedded = _resize_pixel_image(
        pixel_image,
        embedded_modules,
        MIN_READABLE_MODULE_PIXEL_SIZE,
    )

    assert embedded.size == (
        embedded_modules[0] * MIN_READABLE_MODULE_PIXEL_SIZE,
        embedded_modules[1] * MIN_READABLE_MODULE_PIXEL_SIZE,
    )


def test_embedded_image_uses_original_size_when_it_is_safe() -> None:
    pixel_image = Image.new("RGB", (32, 32), "red")
    qr = _make_qr("https://example.com", pixel_image)

    assert _embedded_module_size(qr, pixel_image) == pixel_image.size


def test_embedded_image_is_limited_to_readable_ratio_when_needed() -> None:
    pixel_image = Image.new("RGB", (64, 64), "red")
    qr = _make_qr("https://example.com", pixel_image)

    embedded_modules = _embedded_module_size(qr, pixel_image)

    assert embedded_modules[0] <= pixel_image.width
    assert embedded_modules[0] <= int(qr.modules_count * MAX_EMBEDDED_MODULE_RATIO)


def test_embedded_position_is_aligned_to_qr_module_grid() -> None:
    pixel_image = Image.new("RGB", (32, 32), "red")
    qr = _make_qr("https://example.com", pixel_image)

    position = _embedded_position(
        qr,
        _embedded_module_size(qr, pixel_image),
        MIN_READABLE_MODULE_PIXEL_SIZE,
    )

    assert position[0] % MIN_READABLE_MODULE_PIXEL_SIZE == 0
    assert position[1] % MIN_READABLE_MODULE_PIXEL_SIZE == 0


def test_generated_png_uses_compact_actual_qr_size() -> None:
    pixel_image = Image.new("RGB", (32, 32), "red")
    png_bytes = generate_pixel_qr_png("https://example.com", pixel_image)
    qr = _make_qr("https://example.com", pixel_image)

    generated = Image.open(BytesIO(png_bytes))

    assert generated.size == (
        _total_modules(qr) * MIN_READABLE_MODULE_PIXEL_SIZE,
        _total_modules(qr) * MIN_READABLE_MODULE_PIXEL_SIZE,
    )


def _make_qr(url: str, pixel_image: Image.Image) -> qrcode.QRCode:
    qr = qrcode.QRCode(
        version=_minimum_safe_qr_version(pixel_image),
        error_correction=ERROR_CORRECT_H,
        border=QR_BORDER_MODULES,
        box_size=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    return qr
