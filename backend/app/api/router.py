from fastapi import APIRouter
from app.api.routes import auth, dashboard, pull_requests, repositories, community, analytics

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(pull_requests.router)
api_router.include_router(repositories.router)
api_router.include_router(community.router)
api_router.include_router(analytics.router)
