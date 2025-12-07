from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from chat.models import Message, ChatSession

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True)
    
    class Meta:
        model  = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'password']
        
    def create(self, validated_data):
        # Using custom create_user method
        user = User.objects.create_user(
            first_name  = validated_data['first_name'],
            last_name   = validated_data['last_name'],
            username    = validated_data['username'],
            email       = validated_data['email'],
            password    = validated_data['password'],
        )
        
        return user
 
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Map 'email' to 'username' for SimpleJWT
        attrs['username'] = attrs.get('email', attrs.get('username'))
        return super().validate(attrs)
    
       
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Message
        fields = ['id', 'session','role', 'content', 'created_at']
 
        
class ChatSessionSerializer(serializers.ModelSerializer):

    class Meta:
        model  = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at']