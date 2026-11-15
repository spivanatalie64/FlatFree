#!/bin/sh
# FlatFree auto-installer - adds the FlatFree Flatpak repo and handles GPG
# Usage: curl -fsSL https://flatfree.acreetionos.org/install.sh | bash
#     or: curl -fsSL https://flatfree.pages.dev/install.sh | bash
set -e
REPO_URL="https://flatfree.acreetionos.org"
if [ -n "${FLATFREE_URL:-}" ]; then REPO_URL="$FLATFREE_URL"; fi

echo "==> FlatFree installer"
if ! command -v flatpak >/dev/null 2>&1; then
  echo "flatpak not found - please install flatpak first:"
  echo "  Debian/Ubuntu: sudo apt install flatpak"
  echo "  Fedora: sudo dnf install flatpak"
  echo "  Arch: sudo pacman -S flatpak"
  exit 1
fi

# Ensure curl
if ! command -v curl >/dev/null 2>&1; then
  echo "curl not found, please install curl"
  exit 1
fi

TMP_REPO="/tmp/flatfree.flatpakrepo"
TMP_GPG="/tmp/flatfree.gpg"

echo "==> Downloading flatpakrepo..."
curl -fsSL "$REPO_URL/flatfree.flatpakrepo" -o "$TMP_REPO"
curl -fsSL "$REPO_URL/flatfree.gpg" -o "$TMP_GPG" || true

# Remove existing broken remote if present (helps with GPG mismatch)
if flatpak remote-list | grep -q "^flatfree"; then
  echo "==> Removing existing flatfree remote (to fix GPG)..."
  flatpak remote-delete --force flatfree 2>/dev/null || true
fi

echo "==> Adding FlatFree remote..."
# Try 1: standard flatpakrepo (with embedded GPGKey)
if flatpak remote-add --if-not-exists flatfree "$TMP_REPO" 2>&1; then
  echo "==> Success (via flatpakrepo)"
# Try 2: manual GPG import
elif [ -f "$TMP_GPG" ] && flatpak remote-add --if-not-exists --gpg-import="$TMP_GPG" flatfree "$REPO_URL/repo" 2>&1; then
  echo "==> Success (via gpg-import)"
# Try 3: no verification (fallback for key mismatch during rotation)
else
  echo "==> GPG verification failed, adding with --no-gpg-verify (temporary)..."
  flatpak remote-add --if-not-exists --no-gpg-verify flatfree "$REPO_URL/repo"
  echo "==> Installed without GPG verification - run 'flatpak remote-modify --gpg-import=$TMP_GPG flatfree' after server key sync"
fi

echo "==> Verifying..."
flatpak remote-list | grep flatfree || true
echo ""
echo "Done! Install an app with:"
echo "  flatpak install flatfree app.authpass.AuthPass"
echo "  flatpak run app.authpass.AuthPass"
echo ""
echo "One-liner for next time:"
echo "  curl -fsSL $REPO_URL/install.sh | bash"
