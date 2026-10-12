# Merge review ? 12 October 2026

Local checkpoint: 9f5be98. Incoming GitHub commit: 5cf5fd7. Original versions of every conflicting file are preserved beside this report.

| Conflict | Resolution |
|---|---|
| .github/workflows/opportunity-inventory.yml | Preserve incoming cron 0 1 * * * (09:00 Singapore), Node 22, permissions, concurrency, refresh command and artifacts. Retain local database secrets preflight. Correct inaccurate time comment. |
| .gitignore | Combine incoming preview-log exclusions with local mobile browser-profile exclusion; retain environment/node_modules rules. |
| opportunity-automation/refresh.mjs | Both versions are identical after CRLF normalization; preserve all logic and normalize line endings. |
| opportunity-automation/refresh.test.mjs | Both versions are identical after CRLF normalization; preserve all tests and normalize line endings. |
| mobile app (file/directory conflict) | Incoming file contains only one newline. Preserve the complete functional local Capacitor directory. Keep exact incoming blank contents in mobile_app~origin_main.incoming.txt; remove only Git-generated conflict artifact. |

All 200 checkpointed mobile files remain present. Incoming website/backend/discovery updates were automatically merged without conflicting with the local session refresh endpoint. No force push, reset, deployment or production writes were performed. The existing mobile app.zip archive is untouched.
