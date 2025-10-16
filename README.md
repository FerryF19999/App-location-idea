<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1l44N6gc2J0zM6jcP1IiNoBtyZOl9rUGM

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure your environment variables in [.env](.env) (or `.env.local` if you prefer):
   - `GEMINI_API_KEY` is required for the Gemini-powered chat experience and is prefilled with the team's shared key.
   - `GOOGLE_MAPS_API_KEY` is optional but recommended for fetching coffee shop photos.
   - (Optional) `VITE_VERCEL_ANALYTICS_ID` enables Vercel Analytics tracking when set.
3. Run the app:
   `npm run dev`
