#!/bin/bash

# Autonomous Documentation Agent Wrapper
# This script ensures environment variables are properly loaded

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Run the doc agent with all arguments passed through
node "$SCRIPT_DIR/doc-agent.js" "$@"
