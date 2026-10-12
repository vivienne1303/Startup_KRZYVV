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

Validation completed after resolution:
- Website npm test passed: syntax checks, premium access, application routing, recommendations, opportunity filtering/pagination and discovery/import safety.
- Mobile npm run check passed: all 33 HTML pages built; all 20 session, backend refresh, bundle and native behaviour tests passed.
- Opportunity automation: all 9 tests passed. The --apply command was not run.
- Website index, JS, CSS, pages and root package.json match origin/main exactly; the local session-refresh controller and route are the only extra backend changes.
- No unresolved Git index entries remain. Working/staged source marker checks and whitespace checks were run.

A merge commit (36f25e9) appeared during verification. Reviewed corrections are saved in a follow-up commit; no history is rewritten. The mobile app.zip archive was not changed by the conflict-resolution edits.

Remaining limitations: Android APK compilation needs Android Studio/SDK/Java; real-device behaviour has not been tested. Production token renewal requires separately deploying the prepared refresh endpoint; nothing has been deployed. Website checks used the available Node 24 executable, while the backend package declares Node 22 for production. No production data writes or workflow execution were performed.

Final verification: the later incoming commit 5502db8 removes the blank mobile-app placeholder; it does not change the preserved functional mobile files. The final working tree has no unresolved index entries or source conflict markers. Android sync completed successfully after the merge. One cached-object scan encountered a OneDrive mmap error; the final working-tree scan and Git status completed successfully.
