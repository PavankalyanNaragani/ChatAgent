
from chat.models import ChatSession, Message
from .serializers import ChatSessionSerializer, MessageSerializer, UserSerializer
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from langchain_core.messages import HumanMessage
import os
from .ai_agent import ai_graph

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [AllowAny]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    
class ChatSessionListCreateView(generics.ListCreateAPIView):
    serializer_class   = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatHistoryView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs['session_id']
        return Message.objects.filter(session_id=session_id, session__user=self.request.user).order_by('created_at')


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        user_input = request.data.get('content')
        if not user_input:
            return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save User Message
        Message.objects.create(session=session, role='user', content=user_input)

        # 2. Invoke Langgraph
        try:
            initial_state = {"messages": [HumanMessage(content=user_input)]}
            result  = ai_graph.invoke(initial_state)
            
            ai_response_text = result["answer"]
            
        except Exception as e:
            ai_response_text = f"AI Error: {str(e)}"
        
        ai_message = Message.objects.create(session=session, role='ai', content=ai_response_text)
        session.save() 

        return Response(MessageSerializer(ai_message).data, status=status.HTTP_201_CREATED)