# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7b894dc2-942f-478f-911d-a73afe323a9d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7b894dc2-942f-478f-911d-a73afe323a9d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Self-hosted Supabase (VPS: 63.250.52.6)

## How can I deploy this project?

### Option 1: Lovable Platform
Simply open [Lovable](https://lovable.dev/projects/7b894dc2-942f-478f-911d-a73afe323a9d) and click on Share -> Publish.

### Option 2: Self-Hosted VPS Deployment
This project is configured to work with a self-hosted Supabase instance on VPS IP: **63.250.52.6**

**Quick Setup:**
1. Copy `.env.vps` to `.env` and update with your actual API keys
2. Get Supabase keys from: http://63.250.52.6:3000
3. Test connection: `node test-self-hosted-connection.js`
4. Deploy using Docker: `docker-compose -f docker-compose.vps.yml up -d`

**Configuration Files:**
- `.env.vps` - VPS environment template
- `docker-compose.vps.yml` - VPS Docker configuration
- `VPS_SUPABASE_SETUP_GUIDE.md` - Complete setup guide
- `VPS_DEPLOYMENT_GUIDE.md` - Deployment instructions

**Supabase URLs:**
- API: http://63.250.52.6:8000
- Studio: http://63.250.52.6:3000

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
