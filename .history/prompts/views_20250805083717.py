from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Prompt, PromptVersion, Tag
from .serializers import (
    PromptSerializer, PromptCreateSerializer, PromptUpdateSerializer, 
    PromptVersionSerializer, TagSerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.role == 'admin'

class IsAdminOrOwnerOrShared(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if obj.author == request.user:
            return True
        if obj.sharing_mode == 'team':
            return True
        return False

class PromptListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Prompt.objects.all()
        
        return Prompt.objects.filter(
            Q(author=user) | Q(sharing_mode='team')
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PromptCreateSerializer
        return PromptSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PromptDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwnerOrShared]
    queryset = Prompt.objects.all()
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PromptUpdateSerializer
        return PromptSerializer
    
    def perform_update(self, serializer):
        serializer.save(author=self.request.user)

class PromptVersionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwnerOrShared]
    serializer_class = PromptVersionSerializer
    
    def get_queryset(self):
        prompt_id = self.kwargs['prompt_id']
        return PromptVersion.objects.filter(prompt_id=prompt_id)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrOwnerOrShared])
def restore_version(request, prompt_id, version_id):
    try:
        prompt = Prompt.objects.get(id=prompt_id)
        version = PromptVersion.objects.get(id=version_id, prompt=prompt)
        
        next_version = prompt.versions.first().version_number + 1
        
        PromptVersion.objects.create(
            prompt=prompt,
            version_number=next_version,
            content=version.content,
            author=request.user,
            commit_message=f"Restored from version {version.version_number}"
        )
        
        prompt.content = version.content
        prompt.save()
        
        return Response({'message': 'Version restored successfully'}, status=status.HTTP_200_OK)
    
    except (Prompt.DoesNotExist, PromptVersion.DoesNotExist):
        return Response({'error': 'Prompt or version not found'}, status=status.HTTP_404_NOT_FOUND)
