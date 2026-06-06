from urllib.parse import urlparse

from src.schemas.errors import ApiErrorCode


class UrlValidationError(ValueError):
    def __init__(self, code: ApiErrorCode, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def validate_url(value: str) -> str:
    url = value.strip()

    if not url:
        raise UrlValidationError("missing_url", "URL を入力してください")

    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise UrlValidationError(
            "invalid_url",
            "URL は http:// または https:// から始まる形式で入力してください",
        )

    return url
