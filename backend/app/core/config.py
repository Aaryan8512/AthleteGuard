from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = 'postgresql+psycopg://athleteguard:athleteguard@localhost:5432/athleteguard'
    jwt_secret_key: str = 'development-secret-change-me'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60
    cors_origins: str = 'http://localhost:5173'
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(',') if origin.strip()]

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url.startswith('postgres://'):
            return self.database_url.replace('postgres://', 'postgresql+psycopg://', 1)
        if self.database_url.startswith('postgresql://'):
            return self.database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        return self.database_url

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
