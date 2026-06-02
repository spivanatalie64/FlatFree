#!/usr/bin/env python3
"""Mirror popular Flatpaks from Flathub to FlatFree repo."""

import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(os.environ.get('FLATFREE_REPO', '/tmp/FlatFree'))
MANIFESTS = REPO / 'manifests'
BATCH = int(os.environ.get('BATCH', '50'))

def get_apps():
    """Get all app IDs from Flathub."""
    result = subprocess.run(
        ['flatpak', 'remote-ls', 'flathub', '--app'],
        capture_output=True, text=True
    )
    apps = []
    for line in result.stdout.strip().split('\n'):
        parts = line.split('\t')
        if len(parts) >= 2:
            apps.append(parts[1])
    return apps

def generate_manifest(app_id, info):
    """Generate a flatpak-builder compatible manifest."""
    runtime = ''
    runtime_ver = ''
    command = ''
    for line in info.split('\n'):
        if 'Runtime:' in line:
            parts = line.split('Runtime:')[1].strip().split('/')
            runtime = parts[0] if parts else ''
            runtime_ver = parts[1] if len(parts) > 1 else ''
        elif 'Command:' in line:
            command = line.split('Command:')[1].strip()

    name = app_id.split('.')[-1] if '.' in app_id else app_id

    # Try to detect license from metadata
    license = 'FOSS'
    for line in info.split('\n'):
        if 'License:' in line:
            lic = line.split('License:')[1].strip().split('-')[0].strip()
            if lic:
                license = lic
                break

    manifest = {
        'id': app_id,
        'runtime': runtime or 'org.freedesktop.Platform',
        'runtime-version': runtime_ver or '24.08',
        'sdk': runtime or 'org.freedesktop.Sdk',
        'command': command or name.lower(),
        'license': license,
        'finish-args': [],
        'modules': [{
            'name': name,
            'buildsystem': 'simple',
            'build-commands': [],
            'sources': [{
                'type': 'file',
                'url': f'https://dl.flathub.org/repo/appstream/{app_id}.flatpak',
                'dest-filename': f'{app_id}.flatpak'
            }]
        }]
    }
    return manifest

def main():
    apps = get_apps()
    print(f'Total apps on Flathub: {len(apps)}')

    mirrored = 0
    skipped = 0
    existing = {p.name for p in REPO.iterdir() if p.is_dir() and not p.name.startswith('.')}

    for i, app_id in enumerate(apps):
        if app_id in existing:
            skipped += 1
            continue
        if mirrored >= BATCH:
            break

        app_dir = REPO / app_id
        manifest_file = app_dir / f'{app_id}.json'

        # Get remote info
        result = subprocess.run(
            ['flatpak', 'remote-info', 'flathub', app_id],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0:
            continue

        app_dir.mkdir(parents=True, exist_ok=True)
        manifest = generate_manifest(app_id, result.stdout)
        manifest_file.write_text(json.dumps(manifest, indent=2))
        mirrored += 1
        print(f'[{i+1}/{len(apps)}] ✓ {app_id}')

    print(f'\nDone: {mirrored} mirrored, {skipped} already exist')

if __name__ == '__main__':
    main()
