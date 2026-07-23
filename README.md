# FutureSeer

<!-- Trigger Vercel deployment from main branch -->

A Next.js 16 application that combines ancient divination wisdom with modern AI to provide personalized mystical insights and guidance.

## 🌟 Features

### Core Functionality
- **AI-Powered Divination**: 18 different divination tools with AI interpretation
- **Daily Insights**: Personalized daily horoscopes and cosmic guidance
- **Ask the Seer**: Direct AI consultation for life questions (timing and predictions combine Vedic, Western, Numerology, Tarot, and other systems—see [docs/MULTI_SYSTEM_PREDICTION.md](docs/MULTI_SYSTEM_PREDICTION.md))
- **Notes & History**: Save and track your mystical journey
- **Subscription System**: Premium access system (payment integration coming soon)
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

Tooling matches [AGENTS.md](AGENTS.md) and `packageManager` in `package.json`:

- **Node.js 24.x** (see `.nvmrc`)
- **pnpm 10.28.2** — run `corepack enable` then use `pnpm` as usual
- Firebase project
- OpenAI API key
- AstroApp API key (optional)

Full build, CI, and mobile/store steps are indexed in **[docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md)**.
Security baseline and incident workflow live in **[docs/SECURITY_BASELINE_RUNBOOK.md](docs/SECURITY_BASELINE_RUNBOOK.md)**.

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

   **Preferred (maintainers with Vercel access):** pull secrets from the linked Vercel project — never commit the result.

   ```bash
   npx vercel login
   pnpm run vercel:link   # once per clone, if .vercel is missing
   pnpm run env:pull:production   # or: pnpm run env:pull:development
   ```

   `.env.local` is gitignored (`.env*`). Do **not** commit it or paste live keys into the repo.

   **Contributors without Vercel access:** copy the placeholder template and fill your own keys:

   ```bash
   cp env-template.txt .env.local
   ```

   See [docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md) (§ Local env from Vercel) for auth-domain overrides after a production pull.

4. **Set up Firebase**
   - Create a Firebase project (or use the shared project if you are a maintainer)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Ensure Firebase config is in `.env.local` (via `env:pull` or the template)

5. **Run the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

   In development, the first load of each page can take several seconds (Next.js compiling that route). Subsequent loads are fast. For production-like performance, use `pnpm build && pnpm start`.

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
- **Support**: Submit a query at [futureseer.app/contact](https://futureseer.app/contact)

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
