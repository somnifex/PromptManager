from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
import os
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer, 
    UserSettingsSerializer, TwoFactorSetupSerializer, TwoFactorVerifySerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer
)
from .models import User
import qrcode
import io
import base64

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # 检查是否是第一个用户，如果是则设为管理员
    is_first_user = User.objects.count() == 0
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # 如果是第一个用户，设置为管理员
        if is_first_user:
            user.role = 'admin'
            user.save()
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        if user.two_factor_enabled:
            # 2FA is enabled, but not yet verified
            return Response({
                'two_factor_required': True,
                'user_id': user.id,
            }, status=status.HTTP_200_OK)

        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_two_factor(request):
    user_id = request.data.get('user_id')
    code = request.data.get('code')
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user.verify_two_factor_code(code):
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
    except AttributeError:
        pass
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Error during logout: {e}")
    return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSettingsSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSettingsSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def two_factor_setup(request):
    user = request.user
    secret = user.generate_two_factor_secret()
    uri = user.get_two_factor_uri()
    
    # Generate QR code
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, "PNG")
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()

        return Response({
            'secret': secret,
            'qr_code': f"data:image/png;base64,{qr_code_base64}"
        })
    except Exception as e:
        return Response({
            'secret': secret,
            'qr_code': None,
            'error': f'QR code generation failed: {str(e)}'
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def two_factor_enable(request):
    user = request.user
    serializer = TwoFactorVerifySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user.two_factor_enabled = True
        user.save()
        return Response({'message': '2FA enabled successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def two_factor_disable(request):
    user = request.user
    user.two_factor_enabled = False
    user.save()
    return Response({'message': '2FA disabled successfully.'})

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """发送密码重置邮件"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'If an account with this email exists, a password reset link has been sent.'})
    
    # 生成重置令牌
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # 构建重置链接 - 指向前端页面（安全）
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?token={token}&uid={uid}"
    
    # 发送邮件
    try:
        send_mail(
            subject='密码重置请求 - PromptManager',
            message=f'''
您好！

我们收到了重置您在 PromptManager 平台账户密码的请求。

请点击以下链接重置您的密码：
{reset_link}

重要提醒：
- 此链接将在24小时后失效
- 如果您没有请求重置密码，请忽略此邮件
- 请不要将此链接分享给他人
- 重置完成后，请妥善保管您的新密码

如有疑问，请联系我们的技术支持。

谢谢！
PromptManager 团队
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response({
            'message': '重置密码链接已发送到您的邮箱，请检查邮件。'
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f'Failed to send password reset email to {email}: {str(e)}')
        
        return Response({
            'message': '如果该邮箱地址存在于我们的系统中，密码重置链接已发送。'
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """重置密码"""
    token = request.data.get('token')
    uid = request.data.get('uid')
    new_password = request.data.get('new_password')
    
    if not all([token, uid, new_password]):
        return Response({'error': 'Token, UID, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 解码用户ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 验证令牌
    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset token'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 重置密码
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password has been reset successfully'})

# Admin endpoints
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_stats(request):
    from prompts.models import Prompt
    
    total_users = User.objects.count()
    total_prompts = Prompt.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    
    return Response({
        'total_users': total_users,
        'total_prompts': total_prompts,
        'active_users': active_users,
        'system_health': 'good'
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAdmin])
def admin_users(request):
    if request.method == 'GET':
        try:
            page = int(request.GET.get('page', 1))
            if page < 1:
                page = 1
        except (ValueError, TypeError):
            page = 1
            
        search = request.GET.get('search', '').strip()
        
        users = User.objects.all()
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        paginator = Paginator(users, 20)
        try:
            page_obj = paginator.get_page(page)
        except Exception:
            page_obj = paginator.get_page(1)
        
        return Response({
            'users': UserSerializer(page_obj.object_list, many=True).data,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'total_users': paginator.count
        })
    
    elif request.method == 'POST':
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdmin])
def admin_user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # 防止管理员删除自己
        if user == request.user:
            return Response({'error': 'Cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 检查是否是最后一个管理员
        if user.role == 'admin':
            admin_count = User.objects.filter(role='admin', is_active=True).count()
            if admin_count <= 1:
                return Response({'error': 'Cannot delete the last admin user'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
