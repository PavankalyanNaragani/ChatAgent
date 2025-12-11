"""
ASGI config for chatbot_main project.
"""
import os
from django.core.asgi import get_asgi_application

# Point strictly to the main settings file
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot_main.settings')

application = get_asgi_application()