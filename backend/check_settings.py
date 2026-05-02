import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))
from app.config import settings

print(f"CORS_ORIGINS: {settings.cors_origins}")
print(f"CORS_ORIGINS_LIST: {settings.cors_origins_list}")
