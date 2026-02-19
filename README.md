<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your HomeAsset app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Sign in with a username when prompted.
 
## Storage and Persistence
 
HomeAsset uses IndexedDB for storing project image data locally and LocalStorage for authentication state. This ensures your data stays on your device and the app remains fast and responsive.

### Key Components
- **Auth**: Managed in `app/root.tsx` and persisted in `lib/storage.ts`.
- **Projects**: Stored in IndexedDB via `lib/storage.ts`.
- **Visualizer**: Handles rendering and interaction at `app/routes/visualizer.$id.tsx`.
