from io import BytesIO

import qrcode
from PIL import Image
from qrcode.constants import ERROR_CORRECT_H

OUTPUT_SIZE = 1024
EMBEDDED_IMAGE_MAX_RATIO = 0.2


class QrGenerationError(RuntimeError):
    pass


def generate_pixel_qr_png(url: str, pixel_image: Image.Image) -> bytes:
    try:
        qr = qrcode.QRCode(
            error_correction=ERROR_CORRECT_H,
            border=4,
            box_size=10,
        )
        qr.add_data(url)
        qr.make(fit=True)

        canvas = qr.make_image(fill_color="black", back_color="white").convert("RGB")
        canvas = canvas.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.NEAREST)

        embedded = _resize_pixel_image(pixel_image)
        position = (
            (OUTPUT_SIZE - embedded.width) // 2,
            (OUTPUT_SIZE - embedded.height) // 2,
        )
        canvas.paste(embedded, position)

        output = BytesIO()
        canvas.save(output, format="PNG")
        return output.getvalue()
    except Exception as exc:
        raise QrGenerationError from exc


def _resize_pixel_image(image: Image.Image) -> Image.Image:
    max_side = int(OUTPUT_SIZE * EMBEDDED_IMAGE_MAX_RATIO)
    scale = max(1, max_side // max(image.size))
    target_size = (image.width * scale, image.height * scale)
    return image.resize(target_size, Image.Resampling.NEAREST)
