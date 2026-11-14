# Save your work in GitHub

Install Git if needed and create an empty repository named supportslot in your own GitHub account. Do not initialize the remote with a README if your local folder already contains this project.

In the VS Code terminal, from SupportSlot:

```powershell
git init
git status
git add .
git diff --cached --stat
git commit -m "Add SupportSlot application foundation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/supportslot.git
git push -u origin main
```

Replace YOUR_USERNAME with your account. Follow GitHub's browser sign-in prompts. Never put an access token in a source file or a remote URL. If Git requests author information, set git config user.name and git config user.email to your own preferred identity before committing. Verify .env and node_modules are absent from `git status` before committing. package-lock.json should be committed.

The supplied project has no fabricated Git history. Your capstone requires at least 15 meaningful commits; one upload is not sufficient. Make and test genuine changes, committing each logical improvement. Examples of future work: improve catalog empty state, add dashboard filters, add booking details, improve field-level validation, add keyboard test fixes, add AI evaluation results, add actual screenshots, document deployment, and fix issues found by real users. Do not create empty commits to reach the target.

For later changes:

```powershell
git status
git add .
git commit -m "Describe the actual improvement"
git push
```

CI runs tests and the client build on each push and pull request. This project has not been uploaded to your GitHub account automatically.
