# gurumates E2E Test Checklist

## Test Accounts (Password: `password123`)

### Students
| Email | Name | Location |
|-------|------|----------|
| student@gurumates.dev | Priya Shah | Mumbai, India |
| alex.student@gurumates.dev | Alex Johnson | New York, USA |
| emma.student@gurumates.dev | Emma Thompson | London, UK |
| raj.student@gurumates.dev | Raj Kumar | Delhi, India |

### Tutors
| Email | Name | Subjects | Location |
|-------|------|----------|----------|
| amina@gurumates.dev | Amina Rahman | Physics, Maths | New York |
| dev@gurumates.dev | Dev Patel | Python, Data Science | Mumbai |
| sarah@gurumates.dev | Sarah Collins | English | London |
| kenji@gurumates.dev | Kenji Sato | SAT, GRE | Singapore |
| fatima@gurumates.dev | Fatima Al-Hassan | Chemistry | Dubai |
| marco@gurumates.dev | Marco Rossi | Piano | London |
| priya.t@gurumates.dev | Priya Sharma | Maths CBSE | Delhi |
| john.w@gurumates.dev | John Williams | Spanish | San Francisco |

### Admin
| Email | Role |
|-------|------|
| admin@gurumates.dev | Admin + Student |

---

## Student Journey Tests

### 1. Registration & Onboarding
- [ ] Sign up with email/password
- [ ] Sign up with Google OAuth
- [ ] Email verification flow (OTP)
- [ ] Phone verification flow (OTP)
- [ ] Onboarding completion (city, country)
- [ ] Starter coins credited (150 coins)

### 2. Finding Tutors
- [ ] Browse tutors list (`/tutors`)
- [ ] Search by subject
- [ ] Filter by teaching mode (Online/Home/Travel)
- [ ] Filter by city
- [ ] View tutor profile (`/tutors/[slug]`)
- [ ] See tutor's subjects, rates, reviews
- [ ] See "At a glance" facts

### 3. Posting Requirements
- [ ] Create new job (`/jobs/new`)
- [ ] Fill all required fields
- [ ] Set budget range
- [ ] Choose teaching mode
- [ ] Set urgency (when needed)
- [ ] Job appears in `/jobs` list
- [ ] Job appears in dashboard

### 4. Messaging Tutors
- [ ] Click "Message" on tutor profile
- [ ] Conversation created
- [ ] Send messages
- [ ] Receive messages
- [ ] View conversation in inbox

### 5. Contact Unlock
- [ ] See masked contact info
- [ ] View unlock requirements (10 coins, email verified, phone verified)
- [ ] Unlock contact with coins
- [ ] See phone number revealed
- [ ] WhatsApp button works
- [ ] Call button works

### 6. Wallet & Coins
- [ ] View wallet balance (`/wallet`)
- [ ] See coin packs available
- [ ] Purchase coins (sandbox mode)
- [ ] Coins credited immediately
- [ ] Transaction history visible

### 7. Managing Jobs
- [ ] View my jobs (`/jobs/mine`)
- [ ] Edit job details
- [ ] Close job
- [ ] View applicants
- [ ] Accept/reject applicants

---

## Tutor Journey Tests

### 1. Registration & Profile Setup
- [ ] Sign up as tutor (or enable tutor mode)
- [ ] Complete tutor profile (`/tutors/edit`)
- [ ] Add headline, bio
- [ ] Set hourly rate
- [ ] Add subjects/skills
- [ ] Set teaching modes
- [ ] Add experience, education
- [ ] Profile appears in search

### 2. Finding Jobs
- [ ] Browse jobs list (`/jobs`)
- [ ] Filter by subject
- [ ] Filter by city
- [ ] Filter by teaching mode
- [ ] Toggle "Show matched jobs only"
- [ ] View job details

### 3. Applying to Jobs
- [ ] Click "Apply" on job
- [ ] Spend coins to apply
- [ ] Conversation created with student
- [ ] Send intro message
- [ ] Application visible to student

### 4. Dashboard
- [ ] See matched jobs at top
- [ ] Quick apply from dashboard
- [ ] See profile completion status
- [ ] See coin balance
- [ ] See review count

### 5. Receiving Messages
- [ ] Get notified of new messages
- [ ] Reply to student messages
- [ ] Contact unlock notification

### 6. Profile Visibility
- [ ] Toggle profile published/unpublished
- [ ] Toggle match notifications
- [ ] Update availability

---

## Admin Journey Tests

### 1. Admin Panel Access
- [ ] Login as admin
- [ ] Access `/admin` page
- [ ] See user list
- [ ] See job list
- [ ] See support tickets

### 2. User Management
- [ ] View user details
- [ ] Block/unblock user
- [ ] View user's jobs
- [ ] View user's conversations

### 3. Content Moderation
- [ ] Review flagged content
- [ ] Close inappropriate jobs
- [ ] Handle support tickets

---

## Cross-Cutting Tests

### Authentication
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Logout
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Session persistence (cookie)

### Navigation
- [ ] Header navigation works
- [ ] Mobile bottom nav works
- [ ] Role-based nav items (Student vs Tutor)
- [ ] Back buttons work
- [ ] Deep links work

### SEO & Performance
- [ ] Pages have correct titles
- [ ] Meta descriptions present
- [ ] OpenGraph tags work
- [ ] Loading skeletons appear
- [ ] Error pages display correctly
- [ ] 404 page works

### Responsive Design
- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640-1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch interactions work

---

## Test Scenarios

### Scenario 1: Student finds and contacts tutor
1. Login as `student@gurumates.dev`
2. Go to `/tutors`
3. Search for "Python"
4. Click on Dev Patel's profile
5. Click "Message"
6. Send a message
7. Go to inbox, verify conversation exists

### Scenario 2: Tutor applies to job
1. Login as `dev@gurumates.dev`
2. Go to `/jobs`
3. Find "Python project review" job
4. Click "Apply"
5. Confirm coin spend
6. Send intro message
7. Verify application in student's view

### Scenario 3: Contact unlock flow
1. Login as `student@gurumates.dev`
2. Go to existing conversation with Dev
3. Click "Unlock Contact"
4. Verify 10 coins deducted
5. Verify phone number visible
6. Click WhatsApp button

### Scenario 4: New user registration
1. Go to `/register`
2. Fill form with new email
3. Submit
4. Enter OTP (check console in dev mode)
5. Complete onboarding
6. Verify dashboard access

---

## Environment Setup

### Local Testing
```bash
# Start API
cd apps/api && npm run dev

# Start Web
cd apps/web && npm run dev

# Seed database
cd apps/api && npx prisma db seed
```

### Required Environment Variables
```env
# API (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
RESEND_API_KEY=re_... (optional)
GOOGLE_CLIENT_ID=... (optional)
GOOGLE_CLIENT_SECRET=... (optional)

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Known Limitations (Sandbox Mode)

1. **Payments**: Coins credited instantly without real payment
2. **Email**: Falls back to console.log if RESEND_API_KEY not set
3. **SMS**: OTP echoed in response if no SMS provider
4. **Google OAuth**: Requires GOOGLE_CLIENT_ID/SECRET

---

## Bug Report Template

```
**Page/Feature**: 
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: 
**Actual**: 
**Screenshot**: 
**Console Errors**: 
```
