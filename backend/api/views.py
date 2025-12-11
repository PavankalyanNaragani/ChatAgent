from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from chat.models import ChatSession, Message
from .serializers import MessageSerializer, UserSerializer
from .ai_agent import ai_graph
from langchain_core.messages import HumanMessage
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ChatSessionSerializer, MyTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .rag_utils import index_document_to_pinecone

User = get_user_model()

# --- AUTH VIEWS ---
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- SESSION VIEWS ---
class ChatSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        # 1. Save the new session
        session = serializer.save(user=self.request.user)
        
        # 2. Automatically create the Welcome Message in the DB
        Message.objects.create(
            session=session, 
            role='ai', 
            content="👋 Hello! I am IntelliChat. How can I help you today?"
        )



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
            return Response({"error": "No content provided"}, status=400)

        # Save user query
        Message.objects.create(session=session, role='user', content=user_input)

        # RAG retrieval
        retrieved_context = ""
        try:
            from .rag_utils import get_retriever_for_session
            retriever = get_retriever_for_session(session_id)
            if retriever:
                docs = retriever.invoke(user_input)
                retrieved_context = "\n\n".join([d.page_content for d in docs])
        except Exception as e:
            print("RAG Error:", e)

        # Prepare agent state
        initial_state = {
            "messages": [
                HumanMessage(role="user", content=user_input)
            ],
            "context": retrieved_context
        }

        # Run AI model
        try:
            result = ai_graph.invoke(initial_state)

            if isinstance(result, dict) and "messages" in result:
                ai_response_text = result["messages"][-1].content
            else:
                ai_response_text = str(result)

        except Exception as e:
            print("AI Error:", e)
            ai_response_text = "Internal server error."

        # Save AI reply
        ai_message = Message.objects.create(
            session=session,
            role='ai',
            content=ai_response_text
        )

        session.save()

        return Response(MessageSerializer(ai_message).data, status=201)


    
class UploadDocumentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) # <--- Required for file uploads

    def post(self, request, session_id):
        # 1. Get Session
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        # 2. Get File
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)

        # 3. Save to Database
        try:
            doc = Document.objects.create(
                session=session,
                file=file_obj,
                filename=file_obj.name
            )

            # 4. Trigger Vector Indexing (RAG)
            # We pass the file path on the disk to our utility function
            index_document_to_pinecone(doc.file.path, session.id)

            return Response({
                "message": "File processed successfully", 
                "id": doc.id,
                "filename": doc.filename
            }, status=201)

        except Exception as e:
            print(f"Upload/RAG Error: {e}")
            return Response({"error": f"Failed to process document: {str(e)}"}, status=500)