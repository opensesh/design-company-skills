#!/bin/bash

# DESIGN-OPS Update Script
# Pulls the latest changes and reinstalls the plugin
#
# Usage:
#   bash ~/.claude/plugins/cache/design-ops/design-ops/*/DESIGN-OPS/.design-ops/update.sh
#   -- OR --
#   From your DESIGN-OPS clone: bash .design-ops/update.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESIGN_OPS_ROOT="$(dirname "$SCRIPT_DIR")"

echo
echo -e "${BLUE}╭──────────────────────────────────────────────────────────────╮${NC}"
echo -e "${BLUE}│  DESIGN-OPS Update                                           │${NC}"
echo -e "${BLUE}╰──────────────────────────────────────────────────────────────╯${NC}"
echo

# Check if we're in a git repo
if [ ! -d "$DESIGN_OPS_ROOT/.git" ]; then
    echo -e "${RED}Error: Not a git repository${NC}"
    echo "This script must be run from a cloned DESIGN-OPS repository."
    echo
    echo "To install fresh:"
    echo "  git clone https://github.com/opensesh/DESIGN-OPS"
    echo "  bash DESIGN-OPS/.design-ops/install.sh"
    exit 1
fi

cd "$DESIGN_OPS_ROOT"

# Show current version
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo -e "Current version: ${CYAN}$CURRENT_COMMIT${NC}"

# Fetch latest
echo "Checking for updates..."
git fetch origin main --quiet

# Check if updates available
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}Already up to date!${NC}"
    echo
    echo "No changes to install. Your DESIGN-OPS is current."
    exit 0
fi

# Show what's new
echo
echo -e "${YELLOW}Updates available:${NC}"
echo
git log --oneline HEAD..origin/main | head -10
COMMIT_COUNT=$(git rev-list --count HEAD..origin/main)
if [ "$COMMIT_COUNT" -gt 10 ]; then
    echo "  ... and $((COMMIT_COUNT - 10)) more commits"
fi
echo

# Confirm update
read -p "Apply updates? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled."
    exit 0
fi

# Pull changes
echo
echo "Pulling latest changes..."
if git pull origin main --quiet; then
    NEW_COMMIT=$(git rev-parse --short HEAD)
    echo -e "${GREEN}Updated to: ${CYAN}$NEW_COMMIT${NC}"
else
    echo -e "${RED}Failed to pull changes${NC}"
    echo "You may have local changes. Try:"
    echo "  git stash"
    echo "  bash .design-ops/update.sh"
    echo "  git stash pop"
    exit 1
fi

# Reinstall plugin
echo
echo "Reinstalling plugin..."
if command -v claude &> /dev/null; then
    # Uninstall and reinstall
    claude plugin uninstall design-ops@design-ops 2>/dev/null || true
    if claude plugin install design-ops@design-ops 2>/dev/null; then
        echo -e "${GREEN}Plugin reinstalled${NC}"
    else
        echo -e "${YELLOW}Plugin install returned non-zero (may still be OK)${NC}"
    fi
else
    echo -e "${YELLOW}Warning: 'claude' CLI not found${NC}"
    echo "Plugin not reinstalled. Run manually:"
    echo "  claude plugin install design-ops@design-ops"
fi

echo
echo -e "${GREEN}╭──────────────────────────────────────────────────────────────╮${NC}"
echo -e "${GREEN}│  Update Complete!                                            │${NC}"
echo -e "${GREEN}╰──────────────────────────────────────────────────────────────╯${NC}"
echo
echo -e "${YELLOW}Important:${NC} Start a new Claude Code session to use the updated plugin."
echo
echo "What's new:"
git log --oneline "$CURRENT_COMMIT"..HEAD | head -5
echo
