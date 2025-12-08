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
    SendMessageView,
    UploadDocumentView
)

urlpatterns = [
    # --- Auth URLs ---
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    
    # --- Chat URLs ---
    
    path('sessions/', ChatSessionListCreateView.as_view(), name='chat-sessions'),
    path('sessions/<int:session_id>/messages/', ChatHistoryView.as_view(), name='chat-history'),
    path('sessions/<int:session_id>/send/', SendMessageView.as_view(), name='chat-send'),
    
    path('sessions/<int:session_id>/upload/', UploadDocumentView.as_view(), name='upload-doc'),
    
]