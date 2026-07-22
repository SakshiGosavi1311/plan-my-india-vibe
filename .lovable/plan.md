## Goal
Connect this Lovable project to a GitHub repository using Lovable’s built-in Git sync (two-way code backup), so future code changes push to GitHub and GitHub commits sync back.

## What will happen
1. Open the GitHub connection flow in the Lovable editor.
2. Authorize the Lovable GitHub App.
3. Select the GitHub account/organization and create the repository.
4. Verify the initial sync completes and the repo contains the current project code.

## Steps for the user to complete
This step requires OAuth authorization in the Lovable editor UI and cannot be done by the agent directly.

1. In the Lovable editor, click the **Plus (+)** menu in the chat input (bottom left) → **GitHub** → **Connect project**.
2. On the GitHub authorization screen, approve the Lovable GitHub App.
3. Choose the GitHub account or organization where the repository should be created.
4. Click **Create Repository** in Lovable to push the current project code.
5. Confirm the new repository appears on GitHub and contains the latest files.

## Notes
- This is Git sync, not the GitHub API connector. If you later want the app itself to call GitHub APIs (e.g., read issues), that requires a separate connector setup.
- Once connected, editing in Lovable pushes commits to GitHub, and commits pushed to the default branch on GitHub sync into Lovable.
- If you want the codebase cleaned up or any files renamed before the first push, mention that and it can be done first.

## Verification
After connecting, open the GitHub repository in a browser and confirm the file tree matches the current Lovable project (e.g., `src/routes/index.tsx`, `src/lib/trip-planner.functions.ts`, `package.json`).