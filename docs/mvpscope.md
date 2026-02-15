# Gatherly - MVP Scope & Roadmap

**Version:** 1.0  
**Date:** February 15, 2026

---

## Overview

This document clearly defines what is included in the MVP (Minimum Viable Product) launch versus what will be developed in future phases. This helps maintain focus, manage expectations, and ensure timely delivery.

---

## MVP Philosophy

The Gatherly MVP is designed to:
1. **Validate the core value proposition**: Can we successfully connect consumers with caterers?
2. **Test market demand**: Will people use this platform?
3. **Establish proof of concept**: Demonstrate the platform works end-to-end
4. **Gather user feedback**: Learn what users actually need
5. **Launch quickly**: Get to market in 11-12 weeks

**NOT designed to:**
- Include every possible feature
- Be perfect from day one
- Support all service categories immediately
- Handle massive scale from launch

---

## What's IN the MVP 🔴

### 1. Core User Types ✅
- **Consumers** (event planners)
- **Vendors** (catering businesses only)
- **Admins** (platform administrators)

### 2. Authentication & User Management ✅

**Consumer:**
- Email/phone registration
- OTP verification
- Login/logout
- Password reset
- Basic profile management
- Account deletion

**Vendor:**
- Multi-step registration with document upload
- Admin approval workflow
- Login/logout
- Profile management

**Admin:**
- Secure login
- Role-based access control

### 3. Vendor Discovery (Consumer) ✅

**Core Features:**
- Browse all catering vendors
- Search by name/cuisine
- Filter by:
  - Cuisine type
  - Price range
  - Rating
  - Dietary options
  - Event type
- Sort by popularity, rating, price
- View vendor profiles with:
  - Business info
  - Packages and menus
  - Gallery
  - Reviews and ratings
  - Availability calendar

### 4. Event Creation & Management ✅

**Event Features:**
- Create events with:
  - Basic details (name, type, date, time)
  - Location (home or external venue)
  - Guest count
  - Budget range
  - Special requirements
- Save events as drafts
- Edit existing events
- Delete events

### 5. Guest Management ✅

**Guest Features:**
- Add guests manually
- Import guests from CSV
- Bulk add guests
- Categorize guests (VIP, family, friends, etc.)
- Track dietary preferences
- Manual RSVP status tracking
- Export guest list (CSV/PDF)
- Share event details via email/SMS

### 6. Booking Flow ✅

**Booking Features:**
- Select vendor package
- Customize package items
- Add special requirements
- Request quote from vendor
- Vendor can:
  - Accept booking
  - Decline booking
  - Propose alternative quote
- Consumer receives booking confirmation
- Track booking status
- View booking history

### 7. Payment (Dummy) ✅

**Payment Features:**
- Simulated payment flow
- Payment method selection:
  - Credit/Debit card (dummy form)
  - Bank transfer (instructions)
  - Cash on delivery
- Payment confirmation
- Receipt generation (PDF)
- No real money processing

### 8. Vendor Portal ✅

**Vendor Features:**
- Dashboard with key metrics
- Profile management
- Package creation:
  - Package details
  - Menu items
  - Pricing
  - Add-ons
- Availability calendar management
- Booking request management:
  - View requests
  - Accept/decline
  - Update status
  - Contact consumer
- Basic analytics:
  - Total bookings
  - Revenue summary (dummy)
  - Average rating
  - Response time

### 9. Reviews & Ratings ✅

**Review Features:**
- Post-event reviews
- Star ratings (1-5):
  - Overall
  - Food quality
  - Service
  - Punctuality
  - Value for money
- Written review
- Photo upload
- Display reviews on vendor profiles
- Vendor response to reviews

### 10. Admin Console ✅

**Admin Features:**
- Dashboard with platform metrics
- Vendor management:
  - Review applications
  - Approve/reject vendors
  - Suspend vendors
- User management:
  - View all users
  - Suspend/ban users
  - Reset passwords
- Booking oversight:
  - View all bookings
  - Monitor platform activity
- Basic analytics and reporting

### 11. Notifications ✅

**Notification Features:**
- In-app notifications
- Email notifications for:
  - Registration confirmation
  - OTP codes
  - Booking confirmations
  - Status updates
  - Vendor responses
  - Review reminders
- Notification center in app
- Mark as read/unread

### 12. Coming Soon Placeholders ✅

**Service Categories:**
- Decor (placeholder page)
- Rentals (placeholder page)
- Entertainment (placeholder page)
- Photography (placeholder page)
- Miscellaneous (placeholder page)

Each placeholder includes:
- Category icon
- "Coming Soon" badge
- Brief description
- Email notification signup
- Expected launch timeframe

### 13. Technical Features ✅

**Core Technical:**
- Mobile-first responsive design
- HTTPS encryption
- JWT authentication
- RESTful API
- PostgreSQL database
- File upload for images
- Input validation
- Error handling
- Basic security measures

---

## What's OUT of the MVP 🚫

### 1. Service Categories (Beyond Catering)
❌ Decor bookings (placeholder only)  
❌ Rental bookings (placeholder only)  
❌ Entertainment bookings (placeholder only)  
❌ Photography bookings (placeholder only)  
❌ Miscellaneous services (placeholder only)

**Reason:** Focus on validating one category first

---

### 2. Advanced Features

❌ **Real Payment Processing**
- No Stripe, PayPal, or local payment gateways
- Dummy payments only in MVP
- **Future:** Phase 2

❌ **Native Mobile Apps**
- No iOS app
- No Android app
- **Alternative:** Mobile-responsive web app
- **Future:** Phase 3

❌ **Multi-Language Support**
- English only in MVP
- No Arabic language
- **Future:** Phase 2

❌ **Advanced Search**
- No AI-powered recommendations (beyond basic matching)
- No natural language search
- No voice search
- **Future:** Phase 2-3

❌ **Social Features**
- No social media account creation/login
- No sharing events to social media
- No friend recommendations
- **Future:** Phase 2

❌ **Advanced Analytics**
- No predictive analytics
- No ML-based insights
- Basic analytics only
- **Future:** Phase 3

❌ **Vendor Collaboration**
- No multi-vendor bookings
- No vendor partnerships
- **Future:** Phase 3

❌ **Event Templates**
- No pre-made event templates
- No event planning wizards
- **Future:** Phase 2

❌ **Budget Management Tools**
- No expense tracking
- No budget alerts
- Simple budget range only
- **Future:** Phase 2

❌ **Calendar Integration**
- No Google Calendar sync
- No iCal export
- **Future:** Phase 2

❌ **Live Chat**
- No real-time chat
- Message system only
- **Future:** Phase 2 (if needed)

❌ **Video/Virtual Consultations**
- No video calls with vendors
- **Future:** Phase 3

❌ **Loyalty Program**
- No rewards
- No points system
- No referral program
- **Future:** Phase 2-3

❌ **Subscription Plans (Consumers)**
- No premium consumer accounts
- **Future:** Phase 3

❌ **Vendor Subscription Tiers**
- All vendors have same features
- No tiered pricing
- **Future:** Phase 2

❌ **Commission System**
- No actual commission collection
- Platform is free in MVP
- **Future:** Phase 2

---

### 3. Nice-to-Have Features

❌ **Automatic RSVP Tracking**
- Manual RSVP status only
- No automated RSVP links
- **Future:** Phase 2

❌ **WhatsApp Integration**
- No WhatsApp Business API
- Email/SMS only
- **Future:** Phase 2

❌ **Push Notifications**
- No mobile push (web app only)
- In-app + email notifications
- **Future:** With native apps (Phase 3)

❌ **Advanced Filtering**
- Basic filters only
- No complex filter combinations
- No saved searches
- **Future:** Phase 2

❌ **Comparison Tools**
- No side-by-side vendor comparison
- **Future:** Phase 2

❌ **Booking Modifications**
- Limited booking changes
- Contact vendor for major changes
- **Future:** Phase 2

❌ **Dispute Resolution System**
- Manual dispute handling by admin
- **Future:** Phase 2

❌ **Insurance/Protection Plans**
- No booking insurance
- **Future:** Phase 3

❌ **Gift Registry**
- No gift registry integration
- **Future:** Phase 3

❌ **Event Sharing with Guests**
- Basic email/SMS only
- No dedicated guest portal
- **Future:** Phase 2

---

## MVP Feature Priority Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                     HIGH IMPACT                              │
│                                                              │
│  ┌─────────────────────┐       ┌─────────────────────┐     │
│  │ P0: MUST HAVE      │       │ P1: SHOULD HAVE     │     │
│  │ (INCLUDE IN MVP)   │       │ (QUICK WINS)        │     │
│  │                    │       │                     │     │
│  │ • Auth & Users     │       │ • Reviews          │     │
│  │ • Vendor Browse    │       │ • Vendor Analytics │     │
│  │ • Event Creation   │       │ • Advanced Filters │     │
│  │ • Booking Flow     │       │ • Vendor Response  │     │
│  │ • Guest Mgmt       │       │ • Email Templates  │     │
│  │ • Dummy Payment    │       │                     │     │
│  │ • Vendor Portal    │       │                     │     │
│  │ • Admin Console    │       │                     │     │
│  └─────────────────────┘       └─────────────────────┘     │
│         HIGH                              LOW                │
│       EFFORT                            EFFORT               │
│                                                              │
│  ┌─────────────────────┐       ┌─────────────────────┐     │
│  │ P3: FUTURE         │       │ P2: NICE TO HAVE    │     │
│  │ (POST-LAUNCH)      │       │ (IF TIME ALLOWS)    │     │
│  │                    │       │                     │     │
│  │ • Native Apps      │       │ • Social Login     │     │
│  │ • Multiple Services│       │ • WhatsApp Share   │     │
│  │ • AI Recommend.    │       │ • Live Chat        │     │
│  │ • Advanced Analytics│      │ • Event Templates  │     │
│  │ • Vendor Collab.   │       │ • Calendar Sync    │     │
│  └─────────────────────┘       └─────────────────────┘     │
│                                                              │
│                     LOW IMPACT                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Development Phases

### Phase 0: Pre-Development (Week 0)
✅ Requirements gathering  
✅ PRD creation  
✅ Technical specifications  
✅ Design mockups  
✅ Project setup

---

### Phase 1: MVP Development (Weeks 1-10)

#### Week 1-2: Backend Foundation
- Project setup (Node.js + Express + PostgreSQL)
- Database schema implementation
- Authentication system (JWT)
- Core API endpoints (users, auth)

#### Week 3-5: Consumer Frontend
- UI component library
- Landing page
- Registration/login flows
- Vendor browsing and search
- Vendor profile pages
- Event creation flow

#### Week 6-7: Booking & Guest Management
- Booking flow implementation
- Guest list management
- Payment flow (dummy)
- Booking tracking

#### Week 8-9: Vendor Portal & Admin Console
- Vendor dashboard
- Package management
- Booking management
- Admin dashboard
- Vendor approval flow

#### Week 10: Integration & Testing
- End-to-end testing
- Bug fixes
- Performance optimization
- Security audit

---

### Phase 2: Post-MVP Enhancements (Months 4-6)

**Focus: Expand & Optimize**

✅ **Real Payment Integration**
- Stripe or local gateway
- Commission collection
- Automated payouts

✅ **Service Category Expansion**
- Add Decor services
- Add Rental services
- Multi-vendor bookings

✅ **Enhanced Features**
- WhatsApp integration
- Event templates
- Advanced analytics
- Loyalty program basics

✅ **Arabic Language Support**
- UI translation
- RTL (right-to-left) layout
- Bilingual content

✅ **Advanced Vendor Tools**
- Subscription tiers
- Better analytics
- Marketing tools

---

### Phase 3: Scale & Innovate (Months 7-12)

**Focus: Native Apps & Advanced Features**

✅ **Native Mobile Apps**
- iOS app development
- Android app development
- Push notifications
- Offline capabilities

✅ **Additional Services**
- Entertainment bookings
- Photography services
- Miscellaneous vendors

✅ **AI & Automation**
- AI-powered recommendations
- Smart vendor matching
- Automated scheduling
- Predictive analytics

✅ **Advanced Features**
- Video consultations
- Virtual event support
- Vendor collaboration tools
- Advanced budget management
- Event planning timeline tools

---

## Success Metrics for MVP

### Launch Criteria (Must achieve before public launch)
✅ 50+ registered and approved vendors  
✅ All P0 features functional and tested  
✅ <3 critical bugs  
✅ 99%+ uptime in staging  
✅ Security audit passed  
✅ Performance score 85+ (Lighthouse)

### 3-Month Goals (Post-Launch)
🎯 500+ registered consumers  
🎯 100+ completed bookings  
🎯 75+ vendor onboarding (total 125)  
🎯 Average 4.0+ star rating  
🎯 70%+ booking conversion rate  
🎯 <24hr average vendor response time  
🎯 <5% cancellation rate

### 6-Month Goals
🎯 2,000+ registered consumers  
🎯 500+ completed bookings  
🎯 150+ active vendors  
🎯 15% month-over-month growth  
🎯 4.2+ average platform rating  
🎯 Ready to expand to second service category

---

## Risk Mitigation

### High-Risk Areas

**1. Vendor Adoption**
- **Risk:** Not enough vendors sign up
- **Mitigation:** 
  - Pre-launch vendor outreach
  - Attractive commission structure (future)
  - Easy onboarding process
  - Free listing in MVP

**2. User Adoption**
- **Risk:** Consumers don't use the platform
- **Mitigation:**
  - Marketing campaign at launch
  - Social media presence
  - Referral incentives (future)
  - Superior UX compared to competitors

**3. Technical Issues at Launch**
- **Risk:** Server crashes, bugs, slow performance
- **Mitigation:**
  - Thorough testing (unit, integration, E2E)
  - Staged rollout (beta → soft launch → public)
  - Monitoring and alerting
  - Quick response team

**4. Competition**
- **Risk:** Existing players have market share
- **Mitigation:**
  - Focus on superior user experience
  - Local market optimization
  - Fast iteration based on feedback
  - Unique features (future)

---

## Feature Requests Management

### During MVP Development
- **Policy:** No new features
- **Exception:** Critical bugs or must-have discoveries
- **Process:** Document for Phase 2

### Post-Launch
- **Policy:** Feature requests go through evaluation
- **Criteria:** 
  - User demand (how many users want it?)
  - Business value (does it drive growth/revenue?)
  - Effort (how long will it take?)
  - Alignment (fits product vision?)
- **Process:** 
  1. User/stakeholder submits request
  2. Product team evaluates
  3. Prioritize in backlog
  4. Schedule for future sprint/phase

---

## What to Measure

### Product Metrics
- User registration rate
- Vendor application rate
- Booking creation rate
- Booking completion rate
- Cancellation rate
- Average booking value
- Review submission rate
- Platform rating

### Technical Metrics
- API response time
- Error rate
- Uptime
- Page load time
- Bounce rate
- Session duration

### Business Metrics (Future)
- GMV (Gross Merchandise Value)
- Revenue per vendor
- Customer acquisition cost
- Lifetime value
- Churn rate

---

## MVP Launch Checklist

### Pre-Launch (2 weeks before)
- [ ] All P0 features complete and tested
- [ ] Security audit passed
- [ ] Performance optimization done
- [ ] 50+ vendors onboarded and approved
- [ ] Beta user testing completed
- [ ] Bug fixes from beta implemented
- [ ] Documentation complete
- [ ] Support processes in place
- [ ] Marketing materials ready
- [ ] Launch plan finalized

### Launch Day
- [ ] Deploy to production
- [ ] Smoke test production environment
- [ ] Monitor error rates and performance
- [ ] Announce on social media
- [ ] Press release (if planned)
- [ ] Email notification to waitlist
- [ ] All team members on standby

### Post-Launch (First Week)
- [ ] Daily monitoring of key metrics
- [ ] Rapid response to critical issues
- [ ] Gather user feedback
- [ ] Support ticket response
- [ ] Document issues and improvements
- [ ] Plan first post-launch update

---

## Long-Term Vision (Beyond MVP)

**Year 1:** Establish Gatherly as the go-to catering booking platform in Bahrain

**Year 2:** Expand to full event planning (all services), enter regional markets

**Year 3:** AI-powered event planning, vendor collaboration platform, B2B solutions

---

## Summary

**MVP Scope:**
- ✅ Consumer web app (mobile-first)
- ✅ Vendor web portal
- ✅ Admin console
- ✅ Catering services only
- ✅ Dummy payments
- ✅ Core booking flow
- ✅ Basic features

**MVP Does NOT Include:**
- ❌ Other service categories (live)
- ❌ Native mobile apps
- ❌ Real payments
- ❌ Advanced features
- ❌ Multi-language

**Timeline:** 11-12 weeks to launch  
**Goal:** Validate market demand and product-market fit

---

**Document Owner:** Gatherly Product Team  
**Last Updated:** February 15, 2026