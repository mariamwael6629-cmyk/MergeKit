from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "MergeKit API"
    database_url: str = "sqlite:///./mergekit.db"

    secret_key: str = "dev-secret-key-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    cors_origins: str = "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:8080"

    demo_user_email: str = "demo@mergekit.dev"
    demo_user_password: str = "demo1234"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
