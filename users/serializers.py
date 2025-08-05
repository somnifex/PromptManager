from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name',
            'two_factor_enabled'
        )

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'role')
        extra_kwargs = {
            'role': {'required': False, 'default': 'user'}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
        attrs['user'] = user
        return attrs

class TwoFactorSetupSerializer(serializers.Serializer):
    secret = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True)

class TwoFactorVerifySerializer(serializers.Serializer):
    code = serializers.CharField(required=True)

    def validate_code(self, value):
        user = self.context['request'].user
        if not user.verify_two_factor_code(value):
            raise serializers.ValidationError("Invalid 2FA code.")
        return value

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    
    def validate_new_password(self, value):
        # 可以添加密码强度验证
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'created_at', 'is_active', 'last_login')
        read_only_fields = ('id', 'created_at', 'last_login')
        
    def to_representation(self, instance):
        """移除敏感信息"""
        ret = super().to_representation(instance)
        # 如果不是管理员，不显示邮箱
        request = self.context.get('request')
        if request and request.user != instance and request.user.role != 'admin':
            ret.pop('email', None)
        return ret