# Plank Challenge - Development TODO

**Project:** Month-long social plank challenge
**Last Updated:** January 29, 2026

---

## Phase 0: Planning & Setup ✅

### Requirements
- [x] Define core concept
- [x] Identify user roles (Admin, Participant)
- [x] Document features and requirements
- [x] Create database schema
- [x] Define user flows
- [x] Create project structure

### Tech Stack Decision
- [x] Choose frontend framework (React/Vue/Next.js) - **Next.js 14 (App Router)**
- [x] Choose backend (Firebase vs Custom) - **Firebase (Firestore, Auth, Functions)**
- [x] Choose styling approach (Tailwind/CSS-in-JS) - **Tailwind CSS**
- [x] Choose auth provider (Firebase Auth/Auth0) - **Firebase Auth**
- [x] Choose hosting platform - **Vercel (frontend) + Firebase (backend)**
- [x] Document tech stack decisions

**Tech Stack Rationale:**
- **Next.js 14**: Modern React framework with App Router, built-in routing, SSR/SSG support, great developer experience
- **Firebase**: Fast setup, real-time database, authentication built-in, serverless functions, scales automatically
- **Tailwind CSS**: Utility-first CSS, rapid UI development, responsive design, production-ready
- **Vercel**: Optimal Next.js hosting with automatic deployments, edge functions, analytics

---

## Phase 1: Project Setup (Week 1)

### Environment Setup
- [ ] Initialize Git repository
- [ ] Set up frontend project (create-react-app/vite)
- [ ] Set up backend (if custom backend)
- [ ] Configure ESLint and Prettier
- [ ] Set up environment variables
- [ ] Create .env.example file
- [ ] Set up development database

### Basic Infrastructure
- [ ] Create basic folder structure
- [ ] Set up routing
- [ ] Configure state management
- [ ] Set up API client/service layer
- [ ] Configure build tools
- [ ] Set up testing framework

### Design Assets
- [ ] Create lo-fi wireframes
- [ ] Define color palette
- [ ] Choose typography
- [ ] Create basic component library
- [ ] Design logo/branding

---

## Phase 2: Authentication (Week 2)

### User Authentication
- [ ] Set up auth provider (Firebase/Auth0)
- [ ] Create sign-up page
- [ ] Create login page
- [ ] Implement password reset
- [ ] Create protected routes
- [ ] Handle auth state globally
- [ ] Add loading states for auth

### User Profile
- [ ] Create user profile schema/model
- [ ] Build profile creation flow
- [ ] Create profile edit page
- [ ] Add avatar upload
- [ ] Store user role (admin/participant)

### Testing
- [ ] Test sign-up flow
- [ ] Test login flow
- [ ] Test password reset
- [ ] Test protected routes
- [ ] Test session persistence

---

## Phase 3: Admin - Challenge Management (Week 3)

### Challenge Creation
- [ ] Create challenge schema/model
- [ ] Build "Create Challenge" form
  - [ ] Challenge name input
  - [ ] Description textarea
  - [ ] Start date picker
  - [ ] End date picker (validate 30 days)
  - [ ] Rules textarea
- [ ] Validate form inputs
- [ ] Save challenge to database
- [ ] Show success confirmation

### Admin Dashboard
- [ ] Create admin dashboard page
- [ ] List all challenges (active/completed)
- [ ] Show challenge details
- [ ] Edit challenge functionality
- [ ] Archive challenge functionality
- [ ] View participants per challenge

### Participant Invitations
- [ ] Create invitation schema/model
- [ ] Build invite participants form
  - [ ] Email input (single)
  - [ ] Bulk email textarea
  - [ ] Send invite button
- [ ] Generate unique invitation tokens
- [ ] Set up email service (SendGrid/SES)
- [ ] Create email template
- [ ] Send invitation emails
- [ ] Create invitation landing page
- [ ] Handle invitation acceptance
- [ ] Track invitation status
- [ ] Resend invitation functionality

### Testing
- [ ] Test challenge creation
- [ ] Test challenge editing
- [ ] Test invitation sending
- [ ] Test invitation acceptance
- [ ] Test admin permissions

---

## Phase 4: Plank Timer & Recording (Week 4)

### Timer Component
- [ ] Create timer component
- [ ] Implement start/pause/stop logic
- [ ] Display time in MM:SS format
- [ ] Make timer accurate (handle drift)
- [ ] Add countdown before start (3-2-1)
- [ ] Add audio countdown
- [ ] Add interval audio cues (optional)
- [ ] Handle page visibility (pause when hidden)
- [ ] Prevent phone sleep (wake lock API)
- [ ] Style for mobile-first

### Recording Plank
- [ ] Create plank schema/model
- [ ] Build "Record Plank" page
- [ ] Integrate timer component
- [ ] Save plank on stop
  - [ ] User ID
  - [ ] Challenge ID
  - [ ] Date
  - [ ] Duration
  - [ ] Timestamp
- [ ] Validate one plank per day
- [ ] Show confirmation on save
- [ ] Handle errors gracefully
- [ ] Optional: Add notes field

### Business Logic
- [ ] Check if plank already recorded today
- [ ] Prevent recording for future dates
- [ ] Prevent recording before challenge start
- [ ] Optional: Allow same-day edit (time window)
- [ ] Show "already recorded" message

### Testing
- [ ] Test timer accuracy
- [ ] Test start/pause/stop
- [ ] Test saving plank
- [ ] Test one-per-day validation
- [ ] Test on multiple devices
- [ ] Test audio cues

---

## Phase 5: Personal Dashboard (Week 5)

### Dashboard Layout
- [ ] Create dashboard page
- [ ] Design responsive layout
- [ ] Add navigation

### Stats Overview
- [ ] Calculate and display:
  - [ ] Days completed / Total days
  - [ ] Current streak
  - [ ] Longest streak
  - [ ] Total time planked
  - [ ] Average plank time
  - [ ] Longest single plank
- [ ] Add visual progress bar
- [ ] Make stats update in real-time
- [ ] Style for mobile

### Calendar View
- [ ] Create calendar component
- [ ] Display current challenge month
- [ ] Color-code days:
  - [ ] Completed (green)
  - [ ] Missed (red/gray)
  - [ ] Future (neutral)
  - [ ] Today (highlighted)
- [ ] Show duration on hover/tap
- [ ] Make interactive (click for details)
- [ ] Handle edge cases (joined mid-challenge)

### Progress Chart
- [ ] Choose chart library (Chart.js/Recharts)
- [ ] Create chart component
- [ ] Display plank duration by day
- [ ] Add interactivity (hover for details)
- [ ] Make responsive
- [ ] Optional: Add trend line

### Testing
- [ ] Test stat calculations
- [ ] Test calendar rendering
- [ ] Test chart with various data
- [ ] Test on mobile devices
- [ ] Test edge cases (no data, partial data)

---

## Phase 6: Leaderboard (Week 6)

### Leaderboard Display
- [ ] Create leaderboard page
- [ ] Fetch all participants
- [ ] Calculate rankings:
  - [ ] Total time
  - [ ] Longest plank
  - [ ] Days completed
  - [ ] Current streak
  - [ ] Average time
- [ ] Display ranked list
- [ ] Highlight current user
- [ ] Add sorting options
- [ ] Add search/filter
- [ ] Style podium for top 3
- [ ] Make responsive

### Real-time Updates
- [ ] Set up real-time listener (Socket.io/Firebase)
- [ ] Update leaderboard when new planks recorded
- [ ] Add subtle animation for updates
- [ ] Optimize for performance

### Participant Profiles
- [ ] Create profile view page
- [ ] Show participant's stats
- [ ] Show participant's calendar
- [ ] Show participant's achievements
- [ ] Add back navigation
- [ ] Make responsive

### Testing
- [ ] Test ranking calculations
- [ ] Test sorting
- [ ] Test real-time updates
- [ ] Test profile views
- [ ] Test with many participants (performance)

---

## Phase 7: Social Features (Week 7)

### Fistbumps
- [ ] Create fistbump schema/model
- [ ] Add fistbump button to leaderboard
- [ ] Add fistbump button to profiles
- [ ] Implement fistbump logic
  - [ ] Save to database
  - [ ] Validate one per day per person
  - [ ] Prevent self-fistbump
- [ ] Show fistbump count
- [ ] Show who gave fistbumps
- [ ] Add fistbump animation
- [ ] Create toast notification
- [ ] Update count in real-time

### Comments
- [ ] Create comment schema/model
- [ ] Build comment component
- [ ] Add comment input
- [ ] Display comments feed
- [ ] Implement post comment
- [ ] Show timestamp (relative)
- [ ] Add edit comment
- [ ] Add delete comment
- [ ] Admin moderation controls
- [ ] Report comment functionality
- [ ] Real-time comment updates

### Activity Feed
- [ ] Create activity feed component
- [ ] Show recent planks
- [ ] Show recent comments
- [ ] Show recent fistbumps
- [ ] Add filter options
- [ ] Implement infinite scroll or pagination
- [ ] Make responsive

### Testing
- [ ] Test fistbump functionality
- [ ] Test comment posting
- [ ] Test comment editing/deleting
- [ ] Test admin moderation
- [ ] Test real-time updates
- [ ] Test activity feed

---

## Phase 8: Notifications (Week 8)

### In-App Notifications
- [ ] Create notification schema/model
- [ ] Build notification component
- [ ] Add notification icon to nav
- [ ] Show unread count badge
- [ ] Create notification list
- [ ] Implement notification types:
  - [ ] Daily reminder
  - [ ] Fistbump received
  - [ ] Comment received
  - [ ] Challenge starting
  - [ ] Challenge ending
- [ ] Mark as read functionality
- [ ] Clear all functionality
- [ ] Link to relevant content
- [ ] Real-time notification delivery

### Email Notifications (Optional)
- [ ] Set up email templates
- [ ] Daily reminder email
- [ ] Weekly summary email
- [ ] Achievement unlocked email
- [ ] Challenge complete email
- [ ] Opt-in/opt-out preferences
- [ ] Unsubscribe functionality

### Testing
- [ ] Test notification creation
- [ ] Test notification display
- [ ] Test mark as read
- [ ] Test email sending (if implemented)
- [ ] Test notification preferences

---

## Phase 9: Challenge Completion (Week 9)

### Final Results
- [ ] Detect challenge end date
- [ ] Freeze leaderboard
- [ ] Generate final rankings
- [ ] Create results page
- [ ] Show winner announcement
- [ ] Show personal summary
- [ ] Export results (CSV/PDF)
- [ ] Share to social media

### Achievements
- [ ] Create achievement schema/model
- [ ] Define achievement criteria
- [ ] Implement achievement detection
- [ ] Award achievements automatically
- [ ] Create achievement badges/icons
- [ ] Display achievements on profile
- [ ] Send notification on unlock
- [ ] Show achievement list

### Testing
- [ ] Test challenge end detection
- [ ] Test final results generation
- [ ] Test achievement unlocking
- [ ] Test export functionality
- [ ] Test social sharing

---

## Phase 10: Polish & Optimization (Week 10)

### UI/UX Polish
- [ ] Review all pages for consistency
- [ ] Improve mobile responsiveness
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states
- [ ] Improve animations/transitions
- [ ] Add success confirmations
- [ ] Improve accessibility

### Performance
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Implement code splitting
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Test on slow connections
- [ ] Optimize bundle size

### Accessibility
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Improve color contrast
- [ ] Add focus indicators
- [ ] Test with accessibility tools

---

## Phase 11: Testing (Week 11)

### Unit Tests
- [ ] Test utility functions
- [ ] Test data calculations (stats, rankings)
- [ ] Test validation logic
- [ ] Test business rules

### Component Tests
- [ ] Test timer component
- [ ] Test calendar component
- [ ] Test chart component
- [ ] Test form components
- [ ] Test social components

### Integration Tests
- [ ] Test user flows end-to-end
- [ ] Test admin flows
- [ ] Test participant flows
- [ ] Test social interactions

### User Acceptance Testing
- [ ] Create test plan
- [ ] Recruit beta testers
- [ ] Gather feedback
- [ ] Fix critical issues
- [ ] Iterate based on feedback

---

## Phase 12: Deployment (Week 12)

### Pre-Launch
- [ ] Set up production environment
- [ ] Configure production database
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and SSL
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Set up analytics (GA, Plausible)
- [ ] Final security audit
- [ ] Performance testing
- [ ] Create backup strategy

### Launch
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Monitor for errors
- [ ] Create launch announcement
- [ ] Send to initial users
- [ ] Monitor user feedback
- [ ] Be ready for hotfixes

### Post-Launch
- [ ] Monitor analytics
- [ ] Track key metrics
- [ ] Gather user feedback
- [ ] Triage and fix bugs
- [ ] Plan v1.1 features
- [ ] Regular updates and maintenance

---

## Ongoing

### Maintenance
- [ ] Monitor uptime
- [ ] Update dependencies
- [ ] Security patches
- [ ] Bug fixes
- [ ] Performance monitoring

### Feature Backlog (v1.1+)
- [ ] OAuth login (Google, Facebook)
- [ ] Profile pictures
- [ ] Multiple concurrent challenges
- [ ] Team competitions
- [ ] Video plank recording
- [ ] Mobile app (React Native)
- [ ] Advanced analytics for admins
- [ ] Custom challenge rules

---

## Documentation

- [ ] Write API documentation
- [ ] Create user guide for admins
- [ ] Create user guide for participants
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Add inline code comments

---

## Current Status

**Phase:** 0 - Planning ✅
**Next Phase:** 1 - Project Setup
**Start Date:** [TBD]
**Target Launch:** [TBD]

---

## Notes

- Focus on MVP features first
- Mobile-first design approach
- Test thoroughly before moving to next phase
- Gather user feedback early and often
- Keep social features engaging but not overwhelming
