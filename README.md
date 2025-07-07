# FutureSeer - AI-Powered Mystical Insights

A Next.js 15 application that combines ancient divination wisdom with modern AI to provide personalized mystical insights and guidance.

## 🌟 Features

### Core Functionality
- **AI-Powered Divination**: 18 different divination tools with AI interpretation
- **Daily Insights**: Personalized daily horoscopes and cosmic guidance
- **Ask the Seer**: Direct AI consultation for life questions
- **Notes & History**: Save and track your mystical journey
- **Subscription System**: PayPal integration for premium access
- **Mobile Optimized**: Responsive design with touch-friendly interactions

### Divination Tools
- **Astrology**: Vedic, KP, Western, Horary, Bazi
- **Numerology**: Chaldean, Kabbalistic, Angel Numbers
- **Divination**: Tarot, Lenormand, Runes, I Ching, Pendulum
- **Reading**: Palmistry, Face Reading
- **Analysis**: Name Analysis, Dream Symbols, Vastu

### Technical Features
- **Authentication**: Firebase Auth with user profiles
- **Database**: Firebase Firestore for data persistence
- **AI Integration**: OpenAI API for intelligent predictions
- **Astrological Data**: AstroApp API integration
- **Mobile Ready**: Capacitor support for hybrid app deployment
- **Responsive Design**: Optimized for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Firebase project
- OpenAI API key
- AstroApp API key (optional)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd FutureSeer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp env-template.txt .env.local
   \`\`\`
   
   Edit `.env.local` with your API keys:
   \`\`\`env
   # OpenAI API Configuration (Server-side only)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # AstroApp API for astrological data (Server-side only)
   ASTROAPP_API_KEY=your_astroapp_api_key_here
   
   # Stability AI for symbolic image generation (Server-side only)
   STABILITY_API_KEY=your_stability_api_key_here
   
   # PostHog Analytics (Server-side only)
   POSTHOG_API_KEY=your_posthog_api_key_here
   
   # Firebase Configuration (Client-side public keys)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # PayPal Configuration (Server-side only)
   PAYPAL_CLIENT_ID=your_paypal_client_id_here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=FutureSeer
   \`\`\`

4. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Add your Firebase config to `.env.local`

5. **Run the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Deployment

### Capacitor Setup
\`\`\`bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init FutureSeer com.futureseer.app

# Build the app
pnpm build

# Add platforms
npx cap add ios
npx cap add android

# Sync changes
npx cap sync

# Open in native IDE
npx cap open ios
npx cap open android
\`\`\`

## 🏗️ Project Structure

\`\`\`
FutureSeer/
├── app/                    # Next.js app directory
│   ├── ask/               # Ask the Seer page
│   ├── daily/             # Daily insights page
│   ├── dashboard/         # User dashboard
│   ├── history/           # Reading history
│   ├── notes/             # Personal notes
│   ├── settings/          # User settings
│   ├── subscribe/         # Subscription page
│   ├── tools/             # Divination tools
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── shooting-stars.tsx # Landing page effects
│   ├── mobile-nav.tsx     # Mobile navigation
│   └── ...
├── hooks/                 # Custom React hooks
│   └── use-auth.ts        # Authentication hook
├── lib/                   # Utility libraries
│   ├── api.ts            # API functions
│   ├── firebase.ts       # Firebase configuration
│   └── ...
├── styles/               # Global styles
└── public/               # Static assets
\`\`\`

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Set up security rules for Firestore
5. Add your Firebase config to environment variables

### OpenAI Setup
1. Create an OpenAI account
2. Generate an API key
3. Add the key to your environment variables

### PayPal Setup
1. Create a PayPal Developer account
2. Create a new app
3. Get your client ID
4. Add to environment variables

## 🎨 Customization

### Styling
The app uses Tailwind CSS with custom cosmic theme. Key classes:
- `cosmic-background-restored`: Main background
- `glass-card`: Glass morphism effect
- `gold-glow`: Golden text glow
- `text-soft`: Soft white text

### Adding New Tools
1. Add tool to the tools array in `app/tools/page.tsx`
2. Add description in `app/tools/[slug]/page.tsx`
3. Update API functions if needed

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Firebase Hosting**: Use `firebase deploy`
- **Docker**: Use provided Dockerfile

## 📊 Performance

### Optimization Features
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Static generation and ISR for better performance
- **Mobile First**: Responsive design with touch optimizations

### Monitoring
- Built-in Next.js analytics
- Firebase Analytics integration
- Performance monitoring with Core Web Vitals

## 🔒 Security

### Data Protection
- All user data encrypted in transit and at rest
- Firebase security rules protect user data
- No sensitive data stored in client-side code
- Regular security audits and updates

### Privacy
- GDPR compliant data handling
- User consent for data collection
- Right to data deletion
- Transparent privacy policy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact support@futureseer.app

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced AI models integration
- [ ] Real-time chat with AI seer
- [ ] Community features and sharing
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice-guided readings
- [ ] AR/VR mystical experiences

### Version History
- **v0.1.0**: Initial release with core features
- **v0.2.0**: Added mobile optimization and tools
- **v1.0.0**: Production-ready with all features

---

**FutureSeer** - Where ancient wisdom meets modern AI ✨🔮
