import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, users, requests, notifications, chat, reviews

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("oporajito.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and build indexes
    logger.info("Initializing Oporajito API...")
    await connect_to_mongo()
    yield
    # Shutdown: Close database connections
    logger.info("Shutting down Oporajito API...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Mobile-first Hyperlocal Skill Sharing API for Bangladesh (Oporajito)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Consistent JSON format for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err["loc"] if loc != "body")
        errors.append(f"{field}: {err['msg']}")
    detail_message = "; ".join(errors) if errors else "Invalid request body."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail_message, "errors": exc.errors()}
    )

# Include Routers under /api/v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(requests.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": "Hyperlocal Skill-Sharing Bangladesh",
        "api_docs": "/docs",
        "version": "1.0.0"
    }
