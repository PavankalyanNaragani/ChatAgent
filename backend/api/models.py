from django.db import models
from chat.models import ChatSession

class Document(models.Model):
    # Link documents to a specific chat session
    session = models.ForeignKey(ChatSession, related_name='documents', on_delete=models.CASCADE)
    file = models.FileField(upload_to='pdfs/')
    filename = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename