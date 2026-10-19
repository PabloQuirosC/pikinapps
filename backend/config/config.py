import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_reload: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    cors_origins: list[str] = [
        value.strip()
        for value in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if value.strip()
    ]


settings = Settings()
