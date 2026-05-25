from pathlib import PurePosixPath
from urllib.parse import unquote, urlparse

import cloudinary.api
from django.core.cache import cache
from django.core.management.base import BaseCommand

from api.models import BaiHat


def cloudinary_public_id(audio_url):
    path_parts = PurePosixPath(unquote(urlparse(audio_url).path)).parts
    try:
        upload_index = path_parts.index('upload')
    except ValueError:
        return None

    resource_parts = list(path_parts[upload_index + 1:])
    if resource_parts and resource_parts[0].startswith('v') and resource_parts[0][1:].isdigit():
        resource_parts.pop(0)
    if not resource_parts:
        return None

    resource_parts[-1] = PurePosixPath(resource_parts[-1]).stem
    return '/'.join(resource_parts)


class Command(BaseCommand):
    help = 'Fill missing song durations from Cloudinary audio metadata.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Read metadata without updating songs.')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        updated = 0
        skipped = 0
        failed = 0

        songs = BaiHat.objects.filter(thoi_luong__isnull=True).exclude(duong_dan_am_thanh='')
        for song in songs.iterator():
            public_id = cloudinary_public_id(song.duong_dan_am_thanh)
            if not public_id:
                skipped += 1
                self.stdout.write(self.style.WARNING(f'Skip song {song.id}: audio URL is not a Cloudinary upload URL.'))
                continue

            try:
                metadata = cloudinary.api.resource(
                    public_id,
                    resource_type='video',
                    image_metadata=True,
                    pages=True,
                )
            except Exception as exc:
                failed += 1
                self.stderr.write(self.style.ERROR(f'Failed song {song.id}: {exc}'))
                continue

            duration = metadata.get('duration') or metadata.get('audio_duration')
            if not duration:
                failed += 1
                self.stderr.write(self.style.ERROR(f'Failed song {song.id}: Cloudinary returned no duration.'))
                continue

            rounded_duration = round(duration)
            if not dry_run:
                song.thoi_luong = rounded_duration
                song.save(update_fields=['thoi_luong'])
            updated += 1
            self.stdout.write(f'Song {song.id}: {rounded_duration}s')

        if updated and not dry_run:
            cache.clear()

        mode = 'would update' if dry_run else 'updated'
        self.stdout.write(self.style.SUCCESS(f'{mode}={updated}, skipped={skipped}, failed={failed}'))
