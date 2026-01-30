# 💪 Plank Challenge

A web app for tracking month-long plank challenges with friends. Build core strength, track progress, and compete on the leaderboard!

---

## Project Overview

**Status:** In Development (Phase 1)
**Started:** January 2026

### Description

Plank Challenge is a social fitness web app where admins create month-long plank challenges and invite participants. Participants record one daily plank, track their progress on a personal dashboard, compete on a leaderboard, and engage with the community through comments and fistbumps (kudos).

### Core Features
- 🏋️ **Daily Plank Timer** - Record your daily plank with an accurate timer
- 📊 **Personal Dashboard** - Track your stats, streaks, and progress
- 🏆 **Leaderboard** - See rankings and compete with friends
- 💬 **Social Features** - Give fistbumps and comment on progress
- 👤 **Admin Portal** - Create challenges and invite participants

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (React with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

### Backend
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Functions:** Firebase Cloud Functions
- **Hosting:** Firebase Hosting

### Tools & Services
- **Version Control:** Git
- **Package Manager:** npm
- **Linting:** ESLint

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase account (free tier is sufficient)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repo-url]
   cd Plank-Challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   Follow the [Firebase Setup Guide](docs/firebase-setup.md) to:
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Get your Firebase configuration

4. **Configure environment variables**

   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Firebase configuration:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development

### Available Scripts

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
Plank-Challenge/
├── app/                     Next.js 14 App Router
│   ├── layout.tsx          Root layout
│   ├── page.tsx            Home page
│   └── globals.css         Global styles
├── lib/                     Shared libraries
│   └── firebase.ts         Firebase configuration
├── components/             React components (to be added)
├── public/                 Static files
├── docs/                   Documentation
│   ├── features.md         Feature specifications
│   ├── project-plan.md     Project plan
│   ├── firebase-setup.md   Firebase setup guide
│   └── TODO.md             Development checklist
├── tests/                  Test files (to be added)
└── design/                 Design files (to be added)
```

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js config
- Tailwind CSS for styling
- Follow React/Next.js best practices

---

## Development Phases

### ✅ Phase 0: Planning (Complete)
- Requirements gathering
- Feature specifications
- Database schema design
- Tech stack selection

### 🚧 Phase 1: Project Setup (In Progress)
- [x] Next.js initialization
- [x] Tailwind CSS setup
- [x] Firebase configuration
- [x] Basic home page
- [ ] Authentication pages
- [ ] Protected routes

### 📋 Upcoming Phases
- **Phase 2:** Authentication (Week 2)
- **Phase 3:** Admin - Challenge Management (Week 3)
- **Phase 4:** Plank Timer & Recording (Week 4)
- **Phase 5:** Personal Dashboard (Week 5)
- **Phase 6:** Leaderboard (Week 6)
- **Phase 7:** Social Features (Week 7)
- **Phase 8:** Notifications (Week 8)
- **Phase 9-12:** Polish, Testing, Deployment

See [TODO.md](TODO.md) for detailed task breakdown.

---

## Features

### MVP Features (v1.0)
- [x] Project setup
- [ ] Email/password authentication
- [ ] Admin challenge creation
- [ ] Email invitations
- [ ] Plank timer with audio countdown
- [ ] One plank per day recording
- [ ] Personal dashboard with calendar
- [ ] Leaderboard with rankings
- [ ] Fistbumps (kudos system)
- [ ] Comments and activity feed
- [ ] In-app notifications

### Future Features (v1.1+)
- [ ] OAuth login (Google, Facebook)
- [ ] Profile pictures
- [ ] Multiple concurrent challenges
- [ ] Team competitions
- [ ] Mobile app (React Native)

See [features.md](docs/features.md) for complete feature specifications.

---

## Database Schema

Key collections in Firestore:

- **users** - User profiles and roles
- **challenges** - Challenge details
- **participants** - Challenge memberships
- **planks** - Daily plank records
- **fistbumps** - Kudos between users
- **comments** - Community engagement
- **notifications** - In-app notifications

---

## Documentation

- [Features & Requirements](docs/features.md)
- [Project Plan](docs/project-plan.md)
- [Firebase Setup Guide](docs/firebase-setup.md)
- [Development TODO](TODO.md)

---

## Deployment

### Development
Currently running locally with `npm run dev`

### Production (Coming Soon)
- Frontend: Vercel
- Backend: Firebase
- Domain: TBD

---

## Contributing

This is currently a personal project. Contribution guidelines will be added later.

---

## License

MIT

---

## Contact

[Your contact information]

---

**Made with Next.js, Firebase, and Tailwind CSS**
