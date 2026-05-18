import mimetypes

import cloudinary.uploader


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


def upload_image_file(file, folder):
    if not is_likely_image_file(file):
        raise ValueError('File tải lên không phải là ảnh hợp lệ.')

    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='image',
        )
    except Exception as exc:
        raise ValueError(f'Lỗi upload ảnh lên Cloudinary: {exc}') from exc

    return result['secure_url']


def upload_audio_file(file, folder):
    if not is_likely_audio_file(file):
        raise ValueError('File tải lên không phải là audio hợp lệ.')

    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='video',
        )
    except Exception as exc:
        raise ValueError(f'Lỗi upload audio lên Cloudinary: {exc}') from exc

    return result['secure_url']
