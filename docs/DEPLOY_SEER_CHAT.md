# Deploy Ask the Seer (Groq) to Vercel

## Why "Missing API key" on Vercel?

The Seer chat route (`app/api/seer/chat/`) uses **GROQ_API_KEY**. If that env var is not set on Vercel for your deployment environment, or the app wasn’t redeployed after adding it, you’ll see "Seer connection failed."

## Steps to fix

### 1. Commit and push the Seer chat changes (if needed)

From the project root:

```bash
git add app/api/seer/chat/
git add app/ask-the-seer/page.tsx
git add app/globals.css
git commit -m "Add Seer chat API and Ask the Seer page (Groq)"
git push origin main
```

### 2. Ensure GROQ_API_KEY on Vercel

- **Vercel** → Your project → **Settings** → **Environment Variables**
- Add **GROQ_API_KEY** with your Groq API key (from https://console.groq.com)
- Enable for **Production** and **Preview**
- Save

### 3. Redeploy

After pushing, Vercel will deploy automatically. If you only changed env vars, use **Deployments** → … → **Redeploy** so the new build picks up the variable.

### 4. Verify

Open your Vercel URL → **Ask the Seer** → ask a question. You should get a reply instead of "Seer connection failed."

## Local (.env.local) – "Missing API key" fix

1. **File location**  
   `.env.local` must be in the **project root** (same folder as `package.json`), e.g. `c:\FutureSeer\.env.local`.

2. **Variable name**  
   Use:
   - `GROQ_API_KEY=your-key-here`  
   No space around `=`, no quotes unless the key contains spaces.

3. **Windows: real file name**  
   If you use Windows, the file might be saved as `.env.local.txt`. In PowerShell run:
   ```powershell
   Get-ChildItem -Force -Name .env*
   ```
   You should see `.env.local` only. If you see `.env.local.txt`, rename to `.env.local` (e.g. in Explorer enable "File name extensions" and rename).

4. **Restart dev server**  
   Stop the server (Ctrl+C), then run `pnpm dev` again. Next.js loads `.env.local` only at startup.

5. **Check what the server sees**  
   With the dev server running, open:
   ```
   http://localhost:3000/api/diagnose
   ```
   In the JSON, under `services.environment` you should see:
   - `GROQ_API_KEY: "✅ Set (Ask the Seer + other tools)"`.  
   If it shows "❌ Missing", the process is not getting the key (wrong name, wrong file, or wrong folder).
