# Deployment Guide for Pottur School Connect

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **pnpm**
3. **Supabase Project** (production instance)
4. **Vercel Account** (recommended deployment platform)

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file with your production Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-production-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"
```

### 2. Supabase Production Setup

1. **Create a new Supabase project** for production
2. **Run migrations** to set up your database schema:
   ```bash
   npx supabase db push --db-url "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
   ```
3. **Configure RLS policies** and permissions
4. **Set up storage buckets** if using file uploads
5. **Configure authentication** settings in Supabase dashboard

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Option 2: Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to Netlify

3. **Configure redirects** in `netlify.toml`:
   ```toml
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

### Option 3: Manual Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure your web server** to serve the SPA correctly

## Pre-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] Supabase production database is set up with all migrations
- [ ] RLS policies are configured and tested
- [ ] Authentication flows work in production
- [ ] File uploads work (if applicable)
- [ ] All API endpoints are accessible
- [ ] Performance testing completed
- [ ] Security review completed

## Build Optimization

### Code Splitting

The current build shows large chunks (>500KB). Consider implementing:

1. **Dynamic imports** for route-based code splitting:
   ```javascript
   const LazyComponent = lazy(() => import('./components/LazyComponent'));
   ```

2. **Manual chunk splitting** in `vite.config.ts`:
   ```javascript
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
           }
         }
       }
     }
   });
   ```

## Monitoring and Maintenance

1. **Set up error tracking** (e.g., Sentry)
2. **Monitor performance** with Web Vitals
3. **Set up uptime monitoring**
4. **Regular security updates**
5. **Database backup strategy**

## Troubleshooting

### Common Issues

1. **Environment variables not loading**:
   - Ensure variables start with `VITE_`
   - Check deployment platform environment settings

2. **Supabase connection issues**:
   - Verify URL and keys are correct
   - Check network policies and CORS settings

3. **Routing issues**:
   - Ensure proper redirects are configured
   - Check `vercel.json` or platform-specific config

### Support

For deployment issues, check:
- Vercel documentation: https://vercel.com/docs
- Supabase documentation: https://supabase.com/docs
- Vite deployment guide: https://vitejs.dev/guide/static-deploy.html