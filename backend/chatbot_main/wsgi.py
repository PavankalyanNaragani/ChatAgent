"""
WSGI config for chatbot_main project.
"""
import os
from django.core.wsgi import get_wsgi_application

# Point strictly to the main settings file
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot_main.settings')

application = get_wsgi_application()