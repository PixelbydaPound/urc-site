# GitHub Setup Instructions

## After creating your GitHub repository:

1. **Copy your repository URL** (e.g., `https://github.com/yourusername/urc-website.git`)

2. **Add the remote origin:**
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```

3. **Push to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## If you need to update your git config:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Future updates:

After making changes:
```bash
git add .
git commit -m "Your commit message"
git push
```

