from rest_framework import serializers
from .models import Prompt, PromptVersion, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'color', 'created_at')
        read_only_fields = ('id', 'created_at')

class PromptVersionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = PromptVersion
        fields = ('id', 'version_number', 'content', 'author_username', 'created_at', 'commit_message')
        read_only_fields = ('id', 'version_number', 'created_at')

class PromptSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    # versions = PromptVersionSerializer(many=True, read_only=True)
    version_count = serializers.SerializerMethodField()
    latest_version = PromptVersionSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Prompt
        fields = ('id', 'title', 'content', 'author_username', 'sharing_mode', 
                 'is_active', 'created_at', 'updated_at', 'version_count', 'latest_version', 
                 'tags', 'tag_ids')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_version_count(self, obj):
        return obj.versions.count()

class PromptCreateSerializer(serializers.ModelSerializer):
    commit_message = serializers.CharField(required=False, allow_blank=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        required=False
    )
    
    class Meta:
        model = Prompt
        fields = ('title', 'content', 'sharing_mode', 'commit_message', 'tag_ids')
    
    def create(self, validated_data):
        commit_message = validated_data.pop('commit_message', '')
        tags = validated_data.pop('tags', [])
        prompt = Prompt.objects.create(**validated_data)
        
        # 如果没有指定标签，创建或获取默认标签
        if not tags:
            default_tag, created = Tag.objects.get_or_create(
                name='Default',
                defaults={'color': '#9e9e9e'}  # 灰色作为默认颜色
            )
            tags = [default_tag]
        
        prompt.tags.set(tags)
        
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
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        required=False
    )
    
    class Meta:
        model = Prompt
        fields = ('title', 'content', 'sharing_mode', 'commit_message', 'tag_ids')
    
    def update(self, instance, validated_data):
        commit_message = validated_data.pop('commit_message', '')
        tags = validated_data.pop('tags', None)
        
        # 处理标签更新逻辑
        if tags is not None:
            # 如果明确传入了空的标签列表，分配默认标签
            if len(tags) == 0:
                default_tag, created = Tag.objects.get_or_create(
                    name='Default',
                    defaults={'color': '#9e9e9e'}
                )
                instance.tags.set([default_tag])
            else:
                instance.tags.set(tags)
        # 如果tags为None，保持原有标签不变
        
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