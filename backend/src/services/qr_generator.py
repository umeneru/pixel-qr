from io import BytesIO
from math import ceil, floor

import qrcode
from PIL import Image
from qrcode.constants import ERROR_CORRECT_H

MIN_READABLE_MODULE_PIXEL_SIZE = 4
MAX_EMBEDDED_MODULE_RATIO = 0.4
MAX_QR_VERSION = 40
QR_BASE_MODULES = 21
QR_MODULES_PER_VERSION = 4
QR_BORDER_MODULES = 4


class QrGenerationError(RuntimeError):
    pass


def generate_pixel_qr_png(url: str, pixel_image: Image.Image) -> bytes:
    try:
        min_version = _minimum_safe_qr_version(pixel_image)
        qr = qrcode.QRCode(
            version=min_version,
            error_correction=ERROR_CORRECT_H,
            border=QR_BORDER_MODULES,
            box_size=1,
        )
        qr.add_data(url)
        qr.make(fit=True)

        module_pixel_size = MIN_READABLE_MODULE_PIXEL_SIZE
        qr.box_size = module_pixel_size
        canvas = qr.make_image(fill_color="black", back_color="white").convert("RGB")

        embedded_modules = _embedded_module_size(qr, pixel_image)
        embedded = _resize_pixel_image(pixel_image, embedded_modules, module_pixel_size)
        position = _embedded_position(qr, embedded_modules, module_pixel_size)
        canvas.paste(embedded, position)

        output = BytesIO()
        canvas.save(output, format="PNG")
        return output.getvalue()
    except Exception as exc:
        raise QrGenerationError from exc


def _resize_pixel_image(
    image: Image.Image,
    embedded_modules: tuple[int, int],
    module_pixel_size: int,
) -> Image.Image:
    target_size = (
        embedded_modules[0] * module_pixel_size,
        embedded_modules[1] * module_pixel_size,
    )
    return image.resize(target_size, Image.Resampling.NEAREST)


def _minimum_safe_qr_version(image: Image.Image) -> int:
    min_modules = ceil(max(image.size) / MAX_EMBEDDED_MODULE_RATIO)
    version = ceil((min_modules - QR_BASE_MODULES) / QR_MODULES_PER_VERSION) + 1
    return min(MAX_QR_VERSION, max(1, version))


def _embedded_module_size(qr: qrcode.QRCode, image: Image.Image) -> tuple[int, int]:
    max_side_modules = max(1, floor(qr.modules_count * MAX_EMBEDDED_MODULE_RATIO))
    scale = min(1.0, max_side_modules / max(image.size))
    return (
        max(1, floor(image.width * scale)),
        max(1, floor(image.height * scale)),
    )


def _embedded_position(
    qr: qrcode.QRCode,
    embedded_modules: tuple[int, int],
    module_pixel_size: int,
) -> tuple[int, int]:
    total_modules = _total_modules(qr)
    return (
        ((total_modules - embedded_modules[0]) // 2) * module_pixel_size,
        ((total_modules - embedded_modules[1]) // 2) * module_pixel_size,
    )


def _total_modules(qr: qrcode.QRCode) -> int:
    return qr.modules_count + (qr.border * 2)
