# Polka Guardian - Quick Start Guide

Get your Polka Guardian app up and running in 5 minutes!

## 🚀 Local Development (5 minutes)

### Step 1: Install Dependencies (2 min)

```bash
cd polka_guardian_vercel
npm install
```

### Step 2: Set Environment Variables (1 min)

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Add your API keys to `.env.local`:

```env
OPENAI_API_KEY=sk-proj-your-key-here
SUBSCAN_API_KEY=your-key-here
```

**Where to get API keys:**
- OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Subscan: [support.subscan.io](https://support.subscan.io) (optional)

### Step 3: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Step 4: Test Features (1 min)

1. **Ecosystem Overview**: Should load automatically with charts
2. **Wallet Activity**: Enter address `15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71`
3. **AI Chat**: Ask "What does this wallet do?"

## 🌐 Deploy to Vercel (3 minutes)

### Option A: Via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables
   - Click Deploy

### Option B: Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 🎯 Quick Feature Tour

### 1. Ecosystem Overview (Default View)
- View ecosystem metrics across chains
- Explore treasury flow
- See network activity

### 2. Wallet Activity
- Enter any Polkadot address
- Select network (Polkadot, Kusama, etc.)
- Click "Fetch Account Data"
- View balance, transfers, staking, votes

### 3. Governance Monitor
- Monthly voting trends
- Referendum outcomes
- Recent proposals with search

### 4. AI Assistant (Right Sidebar)
- Ask questions about your wallet
- Get governance insights
- Natural language queries

## 📋 Sample Wallet Addresses

Try these addresses to test the app:

**Polkadot:**
- `15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71` (Example address)
- `1zugcavYA9yCuYwiEYeMHNJm9gXznYjNfXQjZsZukF1Mpow` (Acala)

**Kusama:**
- `HZD3C7MapTtCLJDKHMCdUYWMaEQ8pGkUVVuzFdCnMfhEqCN` (Example)

## 🐛 Troubleshooting

### Issue: Build fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: API not working
- Check `.env.local` file exists
- Verify API keys are valid
- Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: Charts not loading
- Check browser console for errors
- Verify CSV files in `public/data/`
- Hard refresh: `Ctrl+Shift+R`

### Issue: OpenAI errors
- Verify API key starts with `sk-proj-`
- Check you have credits: [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
- Check rate limits

## 📚 Next Steps

1. **Customize**: Edit `app/page.tsx` for layout changes
2. **Add Features**: Create new components in `components/`
3. **Deploy**: Push to production with `vercel --prod`
4. **Monitor**: Set up analytics in Vercel dashboard

## 🔗 Useful Links

- **Documentation**: See [README.md](./README.md)
- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Feature Comparison**: See [FEATURE_COMPARISON.md](./FEATURE_COMPARISON.md)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## ⚡ Pro Tips

1. **Fast Reload**: Save any file to see changes instantly
2. **Component Preview**: Use React DevTools browser extension
3. **API Testing**: Use `/api/governance?type=voters` to test endpoints
4. **State Inspection**: Install Zustand DevTools
5. **Performance**: Check Lighthouse scores in Chrome DevTools

## 🎨 Customization Ideas

- Change color scheme in `app/globals.css`
- Add new chains in `lib/subscan.ts`
- Customize AI prompts in `app/api/chat/route.ts`
- Add more charts in `components/charts/`
- Modify layouts in `app/page.tsx`

## 💡 Common Questions

**Q: Do I need both API keys?**
A: OpenAI is required for chat. Subscan is required for wallet data.

**Q: Can I use this without Vercel?**
A: Yes! Deploy to any platform that supports Next.js (AWS, Netlify, Docker).

**Q: Is the Streamlit app affected?**
A: No, both apps are completely separate.

**Q: Can I use a different AI model?**
A: Yes, edit `app/api/chat/route.ts` to change the model.

**Q: How do I add more chains?**
A: Add them to `CHAIN_OPTIONS` in `lib/subscan.ts`.

---

**Ready to go! Happy coding! 🚀**

Need help? Check the full [README.md](./README.md) or open an issue.
