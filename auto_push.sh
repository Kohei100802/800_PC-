#!/bin/zsh

set -e

# ファイル変更を監視して自動コミット/プッシュ
fswatch -o . | (
  while read; do
    git add . && git diff --quiet --exit-code --cached || {
      git commit --no-verify -m "Auto-commit at $(date)"
      if git remote get-url origin > /dev/null 2>&1; then
        git push origin main || {
          echo "Push failed, checking if remote repository exists..."
          REPO_NAME=$(basename "$(pwd)")
          if ! gh repo view "$REPO_NAME" > /dev/null 2>&1; then
            echo "Creating GitHub repository: $REPO_NAME"
            gh repo create "$REPO_NAME" --public --source=. --push
          else
            echo "Repository exists but push failed. Manual intervention required."
          fi
        }
      else
        REPO_NAME=$(basename "$(pwd)")
        echo "No remote repository configured. Creating GitHub repository: $REPO_NAME"
        gh repo create "$REPO_NAME" --public --source=. --push
      fi
    }
  done
) 


