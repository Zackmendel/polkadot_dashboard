# Polka Guardian - Deployment Guide

This guide will walk you through deploying Polka Guardian to Vercel.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 18+** installed on your machine
2. **npm** or **yarn** package manager
3. **Vercel account** (sign up at [vercel.com](https://vercel.com))
4. **OpenAI API Key** (get one at [platform.openai.com](https://platform.openai.com))
5. **Subscan API Key** (optional but recommended, get one at [support.subscan.io](https://support.subscan.io))

## Local Development

### 1. Install Dependencies

```bash
cd polka_guardian_vercel
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit and add your API keys
nano .env.local
```

Add your API keys:

```env
OPENAI_API_KEY=sk-proj-your-openai-key-here
SUBSCAN_API_KEY=your-subscan-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the Build

```bash
npm run build
npm start
```

## Deployment to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables:**
   - In the "Environment Variables" section, add:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `SUBSCAN_API_KEY`: Your Subscan API key
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   cd polka_guardian_vercel
   vercel
   ```

4. **Set Environment Variables:**

   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add SUBSCAN_API_KEY
   ```

   Or add them via the Vercel dashboard.

5. **Deploy to Production:**

   ```bash
   vercel --prod
   ```

### Method 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

After clicking the button:
1. Fork/clone the repository to your account
2. Add environment variables when prompted
3. Deploy!

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Configure DNS records as shown

### Environment Variable Management

To update environment variables after deployment:

1. Go to **Settings** → **Environment Variables** in Vercel Dashboard
2. Update the values
3. Redeploy by going to **Deployments** and clicking "Redeploy"

Or via CLI:

```bash
vercel env add OPENAI_API_KEY production
vercel env add SUBSCAN_API_KEY production
vercel --prod
```

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build

**Solution**: Run `npm run build` locally to identify issues. Fix any TypeScript errors before deploying.

### API Routes Not Working

**Issue**: 500 errors on API routes

**Solution**: 
1. Check environment variables are set correctly
2. Verify API keys are valid
3. Check Vercel function logs in the dashboard

### Data Not Loading

**Issue**: Governance data or charts not displaying

**Solution**:
1. Verify CSV files are in `public/data/` directory
2. Check browser console for errors
3. Verify API route responses in Network tab

### OpenAI API Errors

**Issue**: Chat not working, API errors

**Solution**:
1. Verify `OPENAI_API_KEY` is set correctly
2. Check you have credits in your OpenAI account
3. Verify the API key has proper permissions

### Subscan API Errors

**Issue**: Wallet data not fetching

**Solution**:
1. Verify `SUBSCAN_API_KEY` is set
2. Check Subscan API rate limits
3. Test the API key with a direct API call

## Performance Optimization

### Enable Analytics

```bash
vercel analytics
```

### Enable Speed Insights

```bash
vercel speedinsights
```

### Caching Strategy

The app uses:
- **Static generation** for the main page
- **Dynamic API routes** for data fetching
- **Client-side state management** with Zustand

## Monitoring

### View Logs

```bash
vercel logs YOUR_DEPLOYMENT_URL
```

Or in the Vercel Dashboard:
- Go to **Deployments**
- Click on a deployment
- View logs in the **Functions** tab

### Analytics

Track performance metrics in the Vercel Dashboard:
- **Analytics** tab: User metrics, page views
- **Speed Insights** tab: Core Web Vitals

## Continuous Deployment

Once connected to Git, Vercel will automatically:
- Deploy on every push to `main` branch (Production)
- Create preview deployments for pull requests
- Run builds and tests

### Branch Deployments

- `main` → Production (`your-app.vercel.app`)
- Feature branches → Preview deployments (`branch-name-your-app.vercel.app`)
- Pull requests → Automatic preview comments

## Cost Estimation

**Vercel Free Tier Includes:**
- 100 GB bandwidth per month
- Unlimited deployments
- Automatic HTTPS
- Preview deployments

**If You Need More:**
- Pro Plan: $20/month (includes more bandwidth and faster builds)
- Enterprise: Custom pricing

**OpenAI API Costs:**
- GPT-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Estimate: ~$0.01-0.10 per conversation depending on length

## Security Checklist

- [ ] Environment variables set securely in Vercel Dashboard
- [ ] API keys not committed to Git
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] API rate limiting configured
- [ ] CORS properly configured for production domain

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
3. Open an issue on GitHub

## Next Steps

After successful deployment:
1. Test all features (wallet lookup, governance charts, AI chat)
2. Share your deployment URL with users
3. Monitor analytics and performance
4. Consider adding custom domain
5. Set up monitoring and alerts

---

**Congratulations! Your Polka Guardian app is now live! 🎉**
