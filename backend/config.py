import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # MongoDB (local)
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/smartserve')

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-me-in-dotenv')

    # For hackathon simplicity: access tokens won't expire
    JWT_ACCESS_TOKEN_EXPIRES = False
