from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse, Response

from src.schemas.errors import ApiError, ApiErrorCode
from src.services.image_validator import ImageValidationError, load_pixel_image
from src.services.qr_generator import QrGenerationError, generate_pixel_qr_png
from src.services.url_validator import UrlValidationError, validate_url

router = APIRouter()


@router.post("/qr-codes")
async def create_qr_code(
    url: str = Form(default=""),
    image: UploadFile | None = File(default=None),
) -> Response:
    try:
        validated_url = validate_url(url)
        pixel_image = await load_pixel_image(image)
        png_bytes = generate_pixel_qr_png(validated_url, pixel_image)
    except UrlValidationError as error:
        return _error_response(error.code, error.message, 400)
    except ImageValidationError as error:
        return _error_response(error.code, error.message, 400)
    except QrGenerationError:
        return _error_response(
            "qr_generation_failed",
            "QR コードの生成に失敗しました",
            500,
        )

    return Response(
        content=png_bytes,
        status_code=201,
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="pixel-qr.png"'},
    )


def _error_response(code: ApiErrorCode, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=ApiError(code=code, message=message).model_dump(),
    )
