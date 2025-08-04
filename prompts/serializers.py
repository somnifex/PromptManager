from rest_framework import serializers
from .models import Prompt, PromptVersion

class PromptVersionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = PromptVersion
        fields = ('id', 'version_number', 'content', 'author_username', 'created_at', 'commit_message')
        read_only_fields = ('id', 'version_number', 'created_at')

class PromptSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    versions = PromptVersionSerializer(many=True, read_only=True)
    latest_version = PromptVersionSerializer(read_only=True)
    
    class Meta:
        model = Prompt
        fields = ('id', 'title', 'content', 'author_username', 'sharing_mode', 
                 'is_active', 'created_at', 'updated_at', 'versions', 'latest_version')
        read_only_fields = ('id', 'created_at', 'updated_at')

class PromptCreateSerializer(serializers.ModelSerializer):
    commit_message = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Prompt
        fields = ('title', 'content', 'sharing_mode', 'commit_message')
    
    def create(self, validated_data):
        commit_message = validated_data.pop('commit_message', '')
        prompt = Prompt.objects.create(**validated_data)
        
        PromptVersion.objects.create(
            prompt=prompt,
            version_number=1,
            content=validated_data['content'],
            author=validated_data['author'],
            commit_message=commit_message
        )
        
        return prompt

class PromptUpdateSerializer(serializers.ModelSerializer):
    commit_message = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Prompt
        fields = ('title', 'content', 'sharing_mode', 'commit_message')
    
    def update(self, instance, validated_data):
        commit_message = validated_data.pop('commit_message', '')
        
        if 'content' in validated_data:
            latest_version = instance.versions.first()
            next_version = (latest_version.version_number + 1) if latest_version else 1
            
            PromptVersion.objects.create(
                prompt=instance,
                version_number=next_version,
                content=validated_data['content'],
                author=validated_data.get('author', instance.author),
                commit_message=commit_message
            )
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance