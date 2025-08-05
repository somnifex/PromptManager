#!/usr/bin/env python
"""
测试数据脚本
创建一些示例标签和提示词来测试新功能
"""

import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_management.settings')
sys.path.insert(0, '/Users/howiewood/Desktop/PromptManager')
django.setup()

from django.contrib.auth import get_user_model
from prompts.models import Tag, Prompt, PromptVersion

User = get_user_model()

def create_test_data():
    # 获取或创建超级用户
    try:
        admin_user = User.objects.get(username='admin')
    except User.DoesNotExist:
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
    
    # 创建一些标签
    tags_data = [
        {'name': 'AI', 'color': '#e3f2fd'},
        {'name': 'Writing', 'color': '#f3e5f5'},
        {'name': 'Code', 'color': '#e8f5e8'},
        {'name': 'Creative', 'color': '#fff3e0'},
        {'name': 'Business', 'color': '#fce4ec'},
    ]
    
    created_tags = []
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(
            name=tag_data['name'],
            defaults={'color': tag_data['color']}
        )
        created_tags.append(tag)
        if created:
            print(f"Created tag: {tag.name}")
    
    # 创建一些提示词
    prompts_data = [
        {
            'title': 'Code Review Assistant',
            'content': 'Please review the following code and provide suggestions for improvement:\n\n[CODE]\n\nFocus on:\n- Code quality\n- Performance\n- Security\n- Best practices',
            'tags': ['Code', 'AI'],
            'sharing_mode': 'team'
        },
        {
            'title': 'Creative Writing Prompt',
            'content': 'Write a short story that begins with: "The last person on Earth sat alone in a room. There was a knock at the door..."',
            'tags': ['Writing', 'Creative'],
            'sharing_mode': 'private'
        },
        {
            'title': 'Business Email Template',
            'content': 'Please help me write a professional email to [RECIPIENT] regarding [SUBJECT]. The tone should be [TONE] and include the following key points:\n\n- [POINT 1]\n- [POINT 2]\n- [POINT 3]',
            'tags': ['Business', 'Writing'],
            'sharing_mode': 'team'
        },
        {
            'title': 'Data Analysis Helper',
            'content': 'Analyze the following dataset and provide insights:\n\n[DATA]\n\nPlease focus on:\n1. Key trends and patterns\n2. Statistical significance\n3. Actionable recommendations\n4. Visualizations that would be helpful',
            'tags': ['AI', 'Business'],
            'sharing_mode': 'private'
        }
    ]
    
    for prompt_data in prompts_data:
        # 创建提示词
        prompt, created = Prompt.objects.get_or_create(
            title=prompt_data['title'],
            defaults={
                'content': prompt_data['content'],
                'author': admin_user,
                'sharing_mode': prompt_data['sharing_mode']
            }
        )
        
        if created:
            # 添加标签
            for tag_name in prompt_data['tags']:
                tag = Tag.objects.get(name=tag_name)
                prompt.tags.add(tag)
            
            # 创建版本
            PromptVersion.objects.create(
                prompt=prompt,
                version_number=1,
                content=prompt_data['content'],
                author=admin_user,
                commit_message='Initial version'
            )
            
            print(f"Created prompt: {prompt.title}")
    
    print("Test data created successfully!")

if __name__ == '__main__':
    create_test_data()
