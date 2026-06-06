from io import BytesIO

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from src.schemas.errors import ApiErrorCode

MIN_PIXEL_SIZE = 1
MAX_PIXEL_SIZE = 64
MAX_IMAGE_BYTES = 1024 * 1024
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class ImageValidationError(ValueError):
    def __init__(self, code: ApiErrorCode, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


async def load_pixel_image(upload: UploadFile | None, pixel_size: int) -> Image.Image:
    _validate_pixel_size(pixel_size)

    if upload is None:
        raise ImageValidationError("missing_image", "PNG 画像を選択してください")

    content_type = upload.content_type or ""
    if content_type != "image/png":
        raise ImageValidationError("invalid_image_type", "PNG 画像のみ対応しています")

    data = await upload.read(MAX_IMAGE_BYTES + 1)
    if not data:
        raise ImageValidationError("missing_image", "PNG 画像を選択してください")

    if len(data) > MAX_IMAGE_BYTES or not data.startswith(PNG_SIGNATURE):
        raise ImageValidationError("invalid_image_type", "PNG 画像のみ対応しています")

    try:
        image = Image.open(BytesIO(data))
        image.load()
    except (UnidentifiedImageError, OSError):
        raise ImageValidationError("image_decode_failed", "画像を読み込めませんでした")

    flattened = _flatten_transparency(image)
    if flattened.size == (pixel_size, pixel_size):
        return flattened

    return flattened.resize((pixel_size, pixel_size), Image.Resampling.NEAREST)


def _validate_pixel_size(pixel_size: int) -> None:
    if pixel_size < MIN_PIXEL_SIZE or pixel_size > MAX_PIXEL_SIZE:
        raise ImageValidationError(
            "invalid_pixel_size",
            f"一辺のピクセル数は {MIN_PIXEL_SIZE}〜{MAX_PIXEL_SIZE} の整数で入力してください",
        )


def _flatten_transparency(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    white = Image.new("RGBA", rgba.size, "white")
    white.alpha_composite(rgba)
    return white.convert("RGB")
