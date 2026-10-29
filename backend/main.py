import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from config.config import settings
from router.router import api_router
from utils.logger import setup_logger

setup_logger()
logger = logging.getLogger("pikinapps")

app = FastAPI(
    title="PikinApps API",
    description="Backend para la web de desarrollo PikinApps.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    started_at = time.perf_counter()
    logger.info("Solicitud iniciada: %s %s", request.method, request.url.path)
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Error no controlado en %s %s", request.method, request.url.path)
        raise
    duration_ms = (time.perf_counter() - started_at) * 1000
    logger.info(
        "Solicitud finalizada: %s %s -> %s (%.2f ms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.get("/")
def root():
    logger.info("Consulta de información principal de la API.")
    return {"message": "PikinApps API", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health_check():
    logger.debug("Health check solicitado.")
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
    )
