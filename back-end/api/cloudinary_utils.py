import mimetypes
import time

import cloudinary
import cloudinary.uploader
import cloudinary.utils


def is_likely_image_file(file):
    content_type = (getattr(file, 'content_type', '') or '').lower()
    if content_type.startswith('image/'):
        return True

    guessed_type, _ = mimetypes.guess_type(getattr(file, 'name', ''))
    if guessed_type and guessed_type.startswith('image/'):
        return True

    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}
    filename = (getattr(file, 'name', '') or '').lower()
    return any(filename.endswith(ext) for ext in allowed_extensions)


def is_likely_audio_file(file):
    content_type = (getattr(file, 'content_type', '') or '').lower()
    if content_type.startswith('audio/'):
        return True

    guessed_type, _ = mimetypes.guess_type(getattr(file, 'name', ''))
    if guessed_type and (guessed_type.startswith('audio/') or guessed_type == 'video/mp4'):
        return True

    allowed_extensions = {'.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'}
    filename = (getattr(file, 'name', '') or '').lower()
    return any(filename.endswith(ext) for ext in allowed_extensions)


def upload_image_asset(file, folder):
    if not is_likely_image_file(file):
        raise ValueError('File tải lên không phải là ảnh hợp lệ.')

    try:
        return cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='image',
        )
    except Exception as exc:
        raise ValueError(f'Lỗi upload ảnh lên Cloudinary: {exc}') from exc


def upload_image_file(file, folder):
    result = upload_image_asset(file, folder)
    return result['secure_url']


def upload_audio_asset(file, folder):
    if not is_likely_audio_file(file):
        raise ValueError('File tải lên không phải là audio hợp lệ.')

    try:
        return cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='video',
        )
    except Exception as exc:
        raise ValueError(f'Lỗi upload audio lên Cloudinary: {exc}') from exc


def make_upload_signature(folder, resource_type):
    config = cloudinary.config()
    if not config.cloud_name or not config.api_key or not config.api_secret:
        return {
            'cloud_name': config.cloud_name,
            'api_key': config.api_key,
            'folder': folder,
            'resource_type': resource_type,
            'signature': None,
        }

    timestamp = int(time.time())
    params_to_sign = {
        'folder': folder,
        'timestamp': timestamp,
    }

    return {
        'cloud_name': config.cloud_name,
        'api_key': config.api_key,
        'timestamp': timestamp,
        'folder': folder,
        'resource_type': resource_type,
        'signature': cloudinary.utils.api_sign_request(params_to_sign, config.api_secret),
    }
