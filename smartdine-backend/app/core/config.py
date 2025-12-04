from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "SmartDine Backend"
    mongodb_uri: str
    mongodb_db_name: str = "smartdine"


    class Config:
        env_file = ".env"
settings = Settings()