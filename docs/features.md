# Plank Challenge - Features & Requirements

**Project Type:** Month-long social plank challenge with leaderboard and community engagement

**Last Updated:** January 29, 2026

---

## Core Concept

A web app where:
- **Admins** create month-long challenges and invite participants
- **Participants** record one daily plank and track progress
- **Community** engages through leaderboards, comments, and fistbumps

---

## User Roles

### Admin
- Create challenges
- Invite participants
- Manage challenge settings
- View all participant data
- Moderate comments

### Participant
- Join challenge via invite
- Record daily plank (one per day)
- View personal dashboard
- See leaderboard
- Comment and fistbump others

---

## MVP Features (Version 1.0)

### 1. Authentication & User Management 🔐
**Priority:** HIGH - Required for everything else

#### 1.1 User Registration/Login
**User Story:** As a participant, I need to create an account to join challenges.

**Requirements:**
- Email/password authentication
- Or OAuth (Google/Facebook)
- Password reset functionality
- User profile creation

**Acceptance Criteria:**
- [ ] Users can sign up with email/password
- [ ] Users can log in
- [ ] Password reset works
- [ ] Session persists

---

#### 1.2 Role Management
**User Story:** As a system, I need to distinguish between admins and participants.

**Requirements:**
- Admin role assignment
- Participant role (default)
- Role-based access control
- Admin dashboard access

**Acceptance Criteria:**
- [ ] Admins see admin features
- [ ] Participants only see participant features
- [ ] Roles properly enforced

---

### 2. Challenge Management (Admin) 📋
**Priority:** HIGH - Core admin functionality

#### 2.1 Create Challenge
**User Story:** As an admin, I want to create a month-long plank challenge.

**Requirements:**
- Challenge name/title
- Description
- Start date
- End date (30-31 days)
- Challenge rules

**Acceptance Criteria:**
- [ ] Admin can create new challenge
- [ ] Challenge has name, dates, description
- [ ] Challenge appears in admin dashboard
- [ ] Dates validated (must be ~30 days)

---

#### 2.2 Invite Participants
**User Story:** As an admin, I want to invite people to join the challenge.

**Requirements:**
- Email invitation system
- Unique invitation links
- Bulk invite option
- Track invitation status (pending/accepted)

**Acceptance Criteria:**
- [ ] Admin can enter email addresses
- [ ] System sends invitation emails
- [ ] Invitation links work correctly
- [ ] Can see who has/hasn't joined
- [ ] Can resend invitations

**Technical Notes:**
- Need email service (SendGrid, AWS SES, etc.)
- Generate unique tokens for invites
- Invite expiration (optional)

---

#### 2.3 Manage Challenges
**User Story:** As an admin, I want to manage active challenges.

**Requirements:**
- View all challenges
- Edit challenge details
- End challenge early (if needed)
- Archive completed challenges
- View participant list

**Acceptance Criteria:**
- [ ] Admin dashboard shows all challenges
- [ ] Can edit challenge details
- [ ] Can view participants per challenge
- [ ] Can remove participants if needed

---

### 3. Daily Plank Recording 🏋️
**Priority:** HIGH - Core participant functionality

#### 3.1 Plank Timer
**User Story:** As a participant, I want to time my daily plank.

**Requirements:**
- Start/Pause/Stop timer
- Large, visible timer display
- Audio countdown (3-2-1)
- Audio cues at intervals (optional)
- Haptic feedback on mobile

**Acceptance Criteria:**
- [ ] Timer counts up from 0:00
- [ ] Pause/resume works correctly
- [ ] Stop button completes session
- [ ] Timer is accurate
- [ ] Mobile-friendly controls

**Technical Notes:**
- Use setInterval or requestAnimationFrame
- Handle page visibility (pause when tab hidden)
- Prevent phone sleep during plank

---

#### 3.2 Save Daily Plank
**User Story:** As a participant, I want to save my daily plank time.

**Requirements:**
- One plank per day limit
- Save duration (minutes:seconds)
- Save timestamp
- Optional: Add notes/comments
- Confirmation on save

**Acceptance Criteria:**
- [ ] Can only record one plank per day
- [ ] Duration saved correctly
- [ ] Shows confirmation message
- [ ] Can't edit after saving (or limited edit window)
- [ ] Visual indicator that day is complete

**Business Rules:**
- Only one plank per calendar day
- Can't record plank for future dates
- Can't record plank for days before challenge start
- Optional: Allow same-day edit within X hours

---

#### 3.3 Missed Days
**User Story:** As a participant, I need to know when I've missed a day.

**Requirements:**
- Visual indicator for missed days
- Don't penalize for days before join date
- Don't count days after challenge end
- Optional: Grace period notification

**Acceptance Criteria:**
- [ ] Missed days clearly marked
- [ ] Only count missed days during active participation
- [ ] Show streak broken indicator

---

### 4. Personal Dashboard 📊
**Priority:** HIGH - Core participant feature

#### 4.1 Progress Overview
**User Story:** As a participant, I want to see my progress at a glance.

**Requirements:**
- Days completed / Total days
- Current streak
- Total time planked
- Average plank time
- Longest plank
- Visual progress indicator (e.g., progress bar)

**Acceptance Criteria:**
- [ ] All stats display correctly
- [ ] Stats update after recording plank
- [ ] Visual progress is clear and motivating
- [ ] Mobile responsive

---

#### 4.2 Calendar View
**User Story:** As a participant, I want to see my daily progress in a calendar.

**Requirements:**
- Month calendar layout
- Color-coded days:
  - Completed (green)
  - Missed (red/gray)
  - Future (neutral)
  - Current day (highlighted)
- Show duration on hover/tap
- Click day to see details

**Acceptance Criteria:**
- [ ] Calendar displays current month
- [ ] Completed days show clearly
- [ ] Can see plank duration for each day
- [ ] Current day is obvious
- [ ] Mobile-friendly calendar

---

#### 4.3 Progress Chart
**User Story:** As a participant, I want to visualize my progress trend.

**Requirements:**
- Line chart or bar chart
- Show plank duration by day
- Trend line (optional)
- Interactive (hover for details)

**Acceptance Criteria:**
- [ ] Chart displays all recorded planks
- [ ] Easy to read and understand
- [ ] Shows progress trend
- [ ] Mobile responsive

---

### 5. Leaderboard 🏆
**Priority:** HIGH - Social motivation feature

#### 5.1 Leaderboard Display
**User Story:** As a participant, I want to see how I compare to others.

**Requirements:**
- Ranked list of all participants
- Sorting options:
  - Total time (default)
  - Longest single plank
  - Days completed
  - Current streak
  - Average time
- Show rank, name, stats
- Highlight current user
- Real-time updates

**Acceptance Criteria:**
- [ ] Shows all active participants
- [ ] Sorted by selected metric
- [ ] Current user is highlighted
- [ ] Ranking is accurate
- [ ] Updates when new planks recorded
- [ ] Mobile responsive

**Design Notes:**
- Podium for top 3 (visual emphasis)
- Profile pictures/avatars
- Badges for achievements
- Collapse bottom ranks on mobile

---

#### 5.2 Participant Profiles
**User Story:** As a participant, I want to see other participants' progress.

**Requirements:**
- Click participant to view profile
- Show their stats
- Show their calendar
- Show their comments/fistbumps
- Show achievements/badges

**Acceptance Criteria:**
- [ ] Can view any participant's profile
- [ ] Profile shows public stats
- [ ] Can navigate back to leaderboard
- [ ] Mobile friendly

---

### 6. Social Features 💬
**Priority:** HIGH - Community engagement

#### 6.1 Fistbumps (Kudos/Likes)
**User Story:** As a participant, I want to encourage others.

**Requirements:**
- Fistbump button on leaderboard
- Fistbump button on participant profiles
- One fistbump per user per day per person
- Show fistbump count
- Show who gave fistbumps
- Notification when receiving fistbump

**Acceptance Criteria:**
- [ ] Can fistbump other participants
- [ ] Can't fistbump yourself
- [ ] Limited to one per day per person
- [ ] Fistbump count displays correctly
- [ ] Notifications work
- [ ] Visual feedback on fistbump

**UI/UX:**
- 👊 emoji or custom icon
- Animation on fistbump
- Toast notification
- Fistbump leaderboard (most fistbumps received)

---

#### 6.2 Comments
**User Story:** As a participant, I want to comment and cheer others on.

**Requirements:**
- Comment on daily planks (leaderboard or profiles)
- View all comments
- Edit/delete own comments
- Report inappropriate comments
- Admin moderation

**Acceptance Criteria:**
- [ ] Can post comments
- [ ] Comments display in feed
- [ ] Can edit/delete own comments
- [ ] Admin can moderate
- [ ] Timestamps show correctly
- [ ] Real-time or near-real-time updates

**Comment Types:**
- General challenge comments
- Comments on specific participants
- Replies to comments (optional v1.1)

**Moderation:**
- Admin can delete any comment
- Users can report comments
- Profanity filter (optional)

---

#### 6.3 Activity Feed
**User Story:** As a participant, I want to see recent activity.

**Requirements:**
- Show recent planks
- Show recent comments
- Show recent fistbumps
- Filter by user or activity type
- "Just now" or "X minutes ago" timestamps

**Acceptance Criteria:**
- [ ] Feed shows recent activity
- [ ] Updates in real-time or on refresh
- [ ] Can filter activity
- [ ] Mobile responsive
- [ ] Infinite scroll or pagination

---

### 7. Notifications 🔔
**Priority:** MEDIUM

#### 7.1 In-App Notifications
**User Story:** As a participant, I want to be notified of important events.

**Notification Types:**
- Daily reminder (if not planked today)
- Fistbump received
- Comment on your progress
- Challenge starting soon
- Challenge ending soon

**Acceptance Criteria:**
- [ ] Notification icon shows unread count
- [ ] Notifications list displays correctly
- [ ] Can mark as read
- [ ] Can clear all
- [ ] Links to relevant content

---

#### 7.2 Email Notifications (Optional)
**User Story:** As a participant, I want email reminders.

**Types:**
- Daily reminder email
- Weekly summary
- Achievement unlocked
- Challenge complete

**Acceptance Criteria:**
- [ ] Can opt-in/opt-out
- [ ] Emails send correctly
- [ ] Unsubscribe link works
- [ ] Email templates are professional

---

### 8. Challenge Completion 🎉
**Priority:** MEDIUM

#### 8.1 Challenge Results
**User Story:** As a participant, I want to see final results when challenge ends.

**Requirements:**
- Final leaderboard (frozen)
- Personal summary
- Challenge winner announcement
- Export results (CSV/PDF)
- Share results on social media

**Acceptance Criteria:**
- [ ] Leaderboard freezes at end date
- [ ] Winner is announced
- [ ] Personal summary available
- [ ] Can export data
- [ ] Share functionality works

---

#### 8.2 Achievements/Badges
**User Story:** As a participant, I want recognition for milestones.

**Achievement Examples:**
- "Perfect Month" - No missed days
- "Iron Core" - 3+ minute plank
- "Early Bird" - First to plank 5 days in a row
- "Supportive" - 50+ fistbumps given
- "Comeback Kid" - Recovered from 3-day miss
- "Consistent" - All planks within 30 seconds of average

**Acceptance Criteria:**
- [ ] Achievements unlock automatically
- [ ] Shown on profile
- [ ] Notification on unlock
- [ ] Visual badges/icons

---

## Technical Architecture

### Frontend
- **Framework:** React (recommended) or Vue
- **Styling:** Tailwind CSS or styled-components
- **State Management:** Context API + React Query or Zustand
- **Charts:** Chart.js or Recharts
- **Real-time:** Socket.io or Firebase
- **Authentication:** Firebase Auth or Auth0

### Backend
- **Option 1: Firebase**
  - Firestore for database
  - Firebase Auth
  - Cloud Functions for logic
  - Firebase Hosting

- **Option 2: Custom Backend**
  - Node.js + Express
  - PostgreSQL or MongoDB
  - JWT authentication
  - Socket.io for real-time

### Database Schema (Simplified)

```
Users
- id
- email
- name
- role (admin/participant)
- avatar
- createdAt

Challenges
- id
- title
- description
- startDate
- endDate
- adminId
- status (active/completed)
- createdAt

Participants
- id
- userId
- challengeId
- joinedAt
- status (invited/active/completed)

Planks
- id
- userId
- challengeId
- date
- duration (seconds)
- notes
- createdAt

Fistbumps
- id
- fromUserId
- toUserId
- challengeId
- date
- createdAt

Comments
- id
- userId
- challengeId
- targetUserId (optional)
- content
- createdAt
- updatedAt

Notifications
- id
- userId
- type
- content
- read
- createdAt
```

---

## User Flows

### Admin Flow
1. Admin creates account
2. Admin creates new challenge
3. Admin invites participants via email
4. Admin monitors participant progress
5. Admin engages with participants
6. Challenge ends, admin reviews results

### Participant Flow
1. Receives email invitation
2. Clicks invite link
3. Creates account/logs in
4. Joins challenge
5. Daily: Opens app → Times plank → Saves time
6. Views personal dashboard
7. Checks leaderboard
8. Gives fistbumps and comments
9. Receives notifications
10. Challenge ends, views results

---

## Priority Breakdown

### Must Have (MVP)
1. Authentication (email/password)
2. Admin: Create challenge
3. Admin: Invite participants
4. Participant: Join challenge
5. Participant: Record daily plank (timer + save)
6. Personal dashboard (basic stats + calendar)
7. Leaderboard (ranked by total time)
8. Fistbumps
9. Comments (basic)

### Should Have (v1.1)
1. OAuth login
2. Profile pictures/avatars
3. Multiple sorting on leaderboard
4. Activity feed
5. Email notifications
6. Challenge achievements
7. Chart visualization

### Could Have (v1.2)
1. Multiple concurrent challenges
2. Private challenges
3. Teams within challenge
4. Video uploads (record plank)
5. Mobile app (React Native)

### Won't Have (Yet)
1. Monetary prizes
2. Integration with fitness trackers
3. Video calls/live plank sessions
4. Plank form analysis

---

## Open Questions

- [ ] Should we allow participants to join mid-challenge?
- [ ] What happens to streak if someone joins late?
- [ ] Can admins be participants in their own challenge?
- [ ] Should there be a grace period for recording planks (e.g., until noon next day)?
- [ ] How to handle timezone differences?
- [ ] Should there be team competitions within a challenge?
- [ ] What data is public vs private?
- [ ] Should we allow multiple challenges per user?

---

## Success Metrics

### Engagement
- Daily active users (DAU)
- Completion rate (% of days with plank)
- Average session duration
- Comments per user
- Fistbumps per user

### Challenge Success
- % of participants who complete challenge
- Average participation rate
- Retention (return for next challenge)

### Product
- Time to record first plank (onboarding)
- Mobile vs desktop usage
- Feature usage (which features used most)

---

## Next Steps

1. ✅ Finalize feature requirements
2. [ ] Create detailed wireframes
3. [ ] Choose tech stack
4. [ ] Set up development environment
5. [ ] Build authentication system
6. [ ] Implement challenge creation
7. [ ] Build timer and recording
8. [ ] Create dashboard
9. [ ] Implement leaderboard
10. [ ] Add social features
11. [ ] Testing
12. [ ] Beta launch
