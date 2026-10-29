import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_reload: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    cors_origins: list[str] = list(
        dict.fromkeys(
            value.strip()
            for configured_origins in (
                os.getenv("CORS_ORIGINS", ""),
                os.getenv("FRONTEND_ORIGIN", ""),
                "http://localhost:5173,http://127.0.0.1:5173,http://192.168.100.64:8080",
            )
            for value in configured_origins.split(",")
            if value.strip()
        )
    )


settings = Settings()
