from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import the views we defined in views.py
from .views import (
    CreateUserView, 
    MyTokenObtainPairView,
    ChatSessionListCreateView, # Use this instead of ViewSet for better control
    ChatHistoryView,           # Needed for loading chat history
    SendMessageView            # CRITICAL: This is where the AI lives
)

urlpatterns = [
    # --- Auth URLs ---
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    
    # --- Chat URLs ---
    
    # 1. Sidebar: List all chats (GET) or Create new chat (POST)
    path('sessions/', ChatSessionListCreateView.as_view(), name='chat-sessions'),
    
    # 2. Chat Window: Get specific chat history (GET)
    # This allows: /api/sessions/5/messages/
    path('sessions/<int:session_id>/messages/', ChatHistoryView.as_view(), name='chat-history'),
    
    # 3. Send Message: User sends text -> AI responds (POST)
    # This triggers the "Simulated AI" logic
    path('sessions/<int:session_id>/send/', SendMessageView.as_view(), name='chat-send'),
]