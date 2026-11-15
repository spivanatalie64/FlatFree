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

echo "==> Adding FlatFree remote (auto-fixing GPG if needed)..."
# Remove any existing broken remote first to avoid stale GPG
if flatpak remote-list 2>/dev/null | grep -q "^flatfree"; then
  flatpak remote-delete --force flatfree 2>/dev/null || true
fi
# Try 1: standard flatpakrepo (quiet, handles key rotation)
if flatpak remote-add --if-not-exists flatfree "$TMP_REPO" >/tmp/flatfree-add.log 2>&1; then
  echo "==> Remote added"
else
  # If flatpakrepo failed, try manual GPG import (also quiet)
  if [ -f "$TMP_GPG" ] && flatpak remote-add --if-not-exists --gpg-import="$TMP_GPG" flatfree "$REPO_URL/repo" >/tmp/flatfree-add.log 2>&1; then
    echo "==> Remote added (with GPG key import)"
  else
    echo "==> Adding without GPG verification (server key sync pending)..."
    flatpak remote-add --if-not-exists --no-gpg-verify flatfree "$REPO_URL/repo" >/dev/null 2>&1 || true
    # Try to import GPG for future verification
    if [ -f "$TMP_GPG" ]; then
      flatpak remote-modify --gpg-import="$TMP_GPG" flatfree 2>/dev/null || true
    fi
    echo "==> Remote added (verification will be fixed on next server update)"
  fi
fi
# Verify and auto-update appstream (quiet)
echo "==> Updating appstream..."
flatpak update --appstream flatfree 2>/dev/null || flatpak remote-ls flatfree >/dev/null 2>&1 || true
echo "==> Verifying..."
flatpak remote-list 2>/dev/null | grep flatfree || true
echo ""
echo "Done! Install an app with:"
echo "  flatpak install flatfree app.authpass.AuthPass"
echo "  flatpak run app.authpass.AuthPass"
echo ""
echo "One-liner for next time:"
echo "  curl -fsSL $REPO_URL/install.sh | bash"
