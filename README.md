# DPS Event Notifier

An automated monitoring system for DPS Sharjah events, designed to track school portal updates and send notifications via email and WhatsApp.

## Features

- **Real-time Event Monitoring**: Automatically scrapes DPS Sharjah portal for new events
- **Smart Notifications**: Email and WhatsApp alerts for new events and deadlines
- **PDF Management**: Download and organize event-related PDFs
- **Event Filtering**: Filter by status (open/closed), category, and dates
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes

## Quick Start

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:5000`

### Environment Variables

Create a `.env` file with:

```env
DPS_USERNAME=your_portal_username
DPS_PASSWORD=your_portal_password
GMAIL_EMAIL=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The app is configured for Vercel deployment with:
- Automatic builds using Vite
- Static site generation
- SPA routing support

## Usage

1. **Setup Notifications**: Enter your email and WhatsApp number in Settings
2. **WhatsApp Setup**: Add `+34 644 01 87 53` to contacts, send "I allow callmebot to send me messages"
3. **Start Monitoring**: Click "Start Notifications" to begin tracking
4. **View Events**: Browse current and upcoming events on the dashboard
5. **Download PDFs**: Access event documents from the PDF Downloads section

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Puppeteer
- **Database**: In-memory storage for development
- **Notifications**: Gmail SMTP, CallMeBot WhatsApp API
- **Deployment**: Vercel (frontend), Render (backend optional)

## Configuration

The app uses Vite for building and supports modern ES modules. All dependencies are included in package.json.

For production deployment, the backend API can be hosted separately or the app can work with external APIs by updating the API base URL in the client configuration.