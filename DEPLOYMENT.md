# Deployment Guide - DPS Event Notifier

## Quick Deploy Options

### Option 1: Vercel (Recommended for Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy automatically

### Option 2: Render (Full-Stack)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## Environment Variables

Required for production:
```
DPS_USERNAME=your_portal_username
DPS_PASSWORD=your_portal_password
GMAIL_EMAIL=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
NODE_ENV=production
```

## File Structure (Ready for Deployment)

```
/
├── client/               # Frontend React app
├── server/              # Backend API
├── shared/              # Shared types/schemas
├── vercel.json          # Vercel config
├── package.json         # Dependencies
├── README.md           # Documentation
└── DEPLOYMENT.md       # This file
```

## Build Process

The app is configured with:
- Vite for frontend bundling
- TypeScript compilation
- Tailwind CSS processing
- Asset optimization
- Production environment setup

## Post-Deployment

1. Verify API endpoints are accessible
2. Test notification settings
3. Confirm PDF downloads work
4. Check theme switching functionality
5. Validate WhatsApp integration

## Support

For deployment issues:
- Check build logs for errors
- Verify environment variables
- Ensure all dependencies are installed
- Test locally with production build first