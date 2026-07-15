from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = BASE_DIR / "uploads"


def ensure_upload_directory(directory: Path) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def validate_filename(filename: str) -> str:
    if not filename or filename.strip() == "":
        raise HTTPException(status_code=400, detail="Invalid filename")

    safe_name = Path(filename).name
    if safe_name != filename or safe_name in {"", ".", ".."}:
        raise HTTPException(status_code=400, detail="Invalid filename")

    return safe_name


def save_uploaded_file(upload_file: UploadFile, destination_dir: str, application_id: int) -> tuple[str, str]:
    safe_name = validate_filename(upload_file.filename or "")
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    stored_name = f"{application_id}_{timestamp}_{safe_name}"

    destination_path = ensure_upload_directory(UPLOAD_ROOT / destination_dir)
    final_path = destination_path / stored_name

    with final_path.open("wb") as file_handle:
        content = upload_file.file.read()
        file_handle.write(content)

    relative_path = final_path.relative_to(BASE_DIR).as_posix()
    return stored_name, relative_path
