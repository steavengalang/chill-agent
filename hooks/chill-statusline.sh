#!/usr/bin/env bash
# chill-agent bash/zsh statusline indicator
FLAG="$HOME/.chill-agent-active"
if [ -f "$FLAG" ]; then
  MODE=$(grep -o '"mode":"[^"]*' "$FLAG" | cut -d'"' -f4)
  if [ -n "$MODE" ] && [ "$MODE" != "off" ]; then
    printf "\033[48;5;81;30m ◷ chill:%s \033[0m" "$MODE"
  fi
fi
