from typing import Literal

from pydantic import BaseModel

ApiErrorCode = Literal[
    "missing_url",
    "missing_image",
    "invalid_url",
    "invalid_image_type",
    "invalid_image_size",
    "image_decode_failed",
    "qr_generation_failed",
]


class ApiError(BaseModel):
    code: ApiErrorCode
    message: str
