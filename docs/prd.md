# Gatherly - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** February 15, 2026  
**Product:** Gatherly - Event Planning Platform (Catering MVP)

---

## 1. Executive Summary

Gatherly is a digital event planning platform that connects consumers with service vendors, starting with catering services. The MVP focuses exclusively on catering bookings, providing a streamlined marketplace where consumers can browse vendors, create events, manage guests, and book catering services through an intuitive mobile-first web application.

---

## 2. Product Vision

To become the go-to platform for event planning in the region, starting with catering services and expanding to a comprehensive event management ecosystem.

---

## 3. Goals & Objectives

### Primary Goals (MVP)
- Launch a functional catering marketplace with 50+ vendors
- Enable seamless event creation and catering booking process
- Provide basic guest management capabilities
- Establish vendor onboarding and management system
- Create admin oversight capabilities

### Success Metrics
- 100+ events created in first 3 months
- 70% booking completion rate
- Average 4+ star vendor ratings
- Vendor response time < 24 hours

---

## 4. Target Audience

### Primary Users (Consumers)
- **Demographics:** Ages 25-45, middle to upper-middle income
- **Location:** Bahrain (initially)
- **Use Cases:** 
  - Personal events (birthdays, anniversaries, family gatherings)
  - Corporate events (meetings, celebrations, team building)
  - Special occasions (weddings, engagements - catering only in MVP)

### Secondary Users (Vendors)
- Catering businesses of all sizes
- Independent caterers
- Restaurant catering services
- Specialized dietary/theme caterers

### Tertiary Users (Admins)
- Gatherly platform administrators
- Customer support team
- Operations managers

---

## 5. User Personas

### Persona 1: Sarah - The Busy Professional
- **Age:** 32
- **Occupation:** Marketing Manager
- **Goal:** Plan company events without hassle
- **Pain Points:** Limited time, needs reliable vendors, wants transparent pricing
- **Tech Savviness:** High, mobile-first user

### Persona 2: Ahmed - Small Catering Business Owner
- **Age:** 38
- **Occupation:** Catering Business Owner
- **Goal:** Expand customer base, streamline bookings
- **Pain Points:** Marketing costs, booking management, payment collection
- **Tech Savviness:** Medium

### Persona 3: Fatima - Admin Coordinator
- **Age:** 28
- **Occupation:** Platform Administrator
- **Goal:** Ensure platform quality, manage vendors efficiently
- **Pain Points:** Vendor verification, dispute resolution, platform monitoring
- **Tech Savviness:** High

---

## 6. Product Scope

### In-Scope (MVP)

#### Consumer Web App
- Vendor browsing and search (catering only)
- Event creation with full details
- Catering service booking
- Guest list management
- Dummy payment integration
- Order tracking
- Basic profile management

#### Vendor Web Portal
- Vendor registration and profile setup
- Service/menu management
- Pricing configuration
- Booking request management
- Order fulfillment tracking
- Basic analytics dashboard

#### Admin Console
- Vendor approval workflow
- Platform monitoring dashboard
- User management
- Basic analytics and reporting
- Content moderation

### Out-of-Scope (Future Phases)
- Decor services
- Rental services
- Entertainment booking
- Photography services
- Miscellaneous services
- Native mobile applications
- Real payment processing (using dummy for MVP)
- Advanced analytics
- Marketing automation
- Loyalty programs
- Multi-language support (English only in MVP)

---

## 7. Functional Requirements

### 7.1 Consumer Web App

#### FR-C1: User Authentication
- Email/phone registration
- OTP verification
- Social login (Google, optional)
- Password reset functionality

#### FR-C2: Vendor Discovery
- Browse catering vendors
- Search by cuisine, price range, location
- Filter by ratings, delivery areas, event type
- View vendor profiles with menus and pricing
- View vendor ratings and reviews

#### FR-C3: Event Creation
- Input event details:
  - Event name
  - Event type (Birthday, Corporate, Wedding, etc.)
  - Date and time
  - Location/venue
  - Expected guest count
  - Budget range
- Save draft events
- Edit existing events

#### FR-C4: Booking Management
- Select catering package/items
- Customize menu selections
- Specify dietary requirements
- Add special instructions
- Request quote from vendor
- Receive vendor response
- Confirm booking

#### FR-C5: Guest Management
- Add guests manually (name, contact)
- Import guest lists (CSV)
- Categorize guests (VIP, Family, Colleagues)
- Track RSVP status (manual for MVP)
- Send event details to guests (email/WhatsApp)
- Manage dietary preferences per guest

#### FR-C6: Payment Processing (Dummy)
- View booking summary and total
- Select payment method (simulation only)
- Receive booking confirmation
- View payment receipt

#### FR-C7: Order Tracking
- View booking status
- Receive status updates
- Contact vendor through platform
- View booking history

### 7.2 Vendor Web Portal

#### FR-V1: Vendor Registration
- Business information collection
- Document upload (license, certificates)
- Bank details (for future real payments)
- Verification pending status

#### FR-V2: Profile Management
- Business description
- Cuisine types/specialties
- Service areas
- Operating hours
- Gallery images
- Contact information

#### FR-V3: Service Management
- Create catering packages
- Define menu items with descriptions
- Set pricing (per person, per package)
- Specify dietary options (vegetarian, vegan, halal, etc.)
- Set availability calendar
- Define minimum order requirements

#### FR-V4: Booking Management
- Receive booking requests
- View event details and requirements
- Accept/decline bookings
- Propose alternative quotes
- Update order status
- Mark orders as completed

#### FR-V5: Dashboard & Analytics
- Upcoming bookings
- Revenue summary (based on bookings)
- Rating/review summary
- Response time metrics

### 7.3 Admin Console

#### FR-A1: Admin Authentication
- Secure admin login
- Role-based access control

#### FR-A2: Vendor Management
- Review vendor applications
- Approve/reject vendors
- Suspend vendor accounts
- View vendor performance metrics

#### FR-A3: Platform Monitoring
- Total users (consumers)
- Total vendors
- Total bookings
- Revenue overview (dummy tracking)
- Active vs completed orders

#### FR-A4: User Management
- View consumer accounts
- Suspend/ban problematic users
- Reset user passwords
- View user activity

#### FR-A5: Content Moderation
- Review reported vendors/reviews
- Moderate vendor content
- Handle disputes

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Page load time < 3 seconds
- Search results < 1 second
- Support 1000+ concurrent users
- 99.5% uptime

### 8.2 Security
- HTTPS encryption
- Secure authentication (JWT tokens)
- Password hashing (bcrypt)
- XSS and CSRF protection
- Rate limiting on API endpoints

### 8.3 Usability
- Mobile-first responsive design
- Intuitive navigation
- Maximum 3 clicks to book
- Accessibility standards (WCAG 2.1 Level A minimum)

### 8.4 Scalability
- Cloud-based infrastructure
- Horizontal scaling capability
- Database optimization for growth
- CDN for media assets

### 8.5 Compatibility
- Modern browsers (Chrome, Safari, Firefox, Edge)
- iOS Safari 14+
- Android Chrome 90+
- Responsive across devices (mobile, tablet, desktop)

---

## 9. User Stories

### Consumer Stories

**US-C1:** As a consumer, I want to browse catering vendors so that I can find suitable options for my event.

**US-C2:** As a consumer, I want to create an event with all details so that vendors understand my requirements.

**US-C3:** As a consumer, I want to manage my guest list so that I can track who's attending.

**US-C4:** As a consumer, I want to book catering easily so that I can secure services for my event.

**US-C5:** As a consumer, I want to see vendor ratings so that I can make informed decisions.

### Vendor Stories

**US-V1:** As a vendor, I want to register my business so that I can reach more customers.

**US-V2:** As a vendor, I want to showcase my menus and pricing so that consumers can see my offerings.

**US-V3:** As a vendor, I want to receive booking requests so that I can grow my business.

**US-V4:** As a vendor, I want to manage my bookings so that I can deliver excellent service.

**US-V5:** As a vendor, I want to track my performance so that I can improve my services.

### Admin Stories

**US-A1:** As an admin, I want to approve vendors so that only quality businesses are on the platform.

**US-A2:** As an admin, I want to monitor platform activity so that I can ensure smooth operations.

**US-A3:** As an admin, I want to manage users so that I can maintain platform integrity.

---

## 10. Technical Requirements

### 10.1 Technology Stack (Recommended)

**Frontend:**
- Framework: React.js or Next.js
- Styling: Tailwind CSS
- State Management: Redux Toolkit or Context API
- Form Handling: React Hook Form

**Backend:**
- Framework: Node.js with Express.js OR Python with FastAPI
- Authentication: JWT
- API: RESTful

**Database:**
- Primary: PostgreSQL
- Caching: Redis (optional for MVP)

**File Storage:**
- Cloud storage (AWS S3, Cloudflare R2, or similar)

**Hosting:**
- Frontend: Vercel, Netlify, or similar
- Backend: AWS, Heroku, or similar
- Database: Managed service (AWS RDS, Supabase)

### 10.2 Third-Party Integrations

**MVP Phase:**
- Email service (SendGrid, AWS SES)
- SMS service (Twilio, optional)
- Maps API (Google Maps for location)
- Dummy payment gateway simulation

**Future Phases:**
- Real payment gateway (Stripe, PayPal, local gateway)
- WhatsApp Business API
- Analytics (Google Analytics, Mixpanel)

---

## 11. Design Requirements

### 11.1 Design Principles
- **Mobile-First:** Primary design for mobile screens (320px+)
- **Clean & Minimal:** Inspired by Talabat's simplicity
- **Clear CTAs:** Prominent action buttons
- **Visual Hierarchy:** Clear information architecture
- **Fast Navigation:** Maximum 3 taps to key actions

### 11.2 Brand Guidelines (To Be Defined)
- Color palette: Professional yet warm
- Typography: Clear, readable fonts
- Iconography: Consistent icon set
- Photography: High-quality food and event images

### 11.3 Key UI Elements
- Bottom navigation (mobile)
- Floating action buttons
- Card-based layouts
- Image carousels for vendor galleries
- Clear form inputs with validation
- Loading states and skeleton screens

---

## 12. Launch Strategy

### Phase 1: Soft Launch (Weeks 1-4)
- Onboard 10 catering vendors
- Beta test with 50 selected users
- Gather feedback and fix critical issues
- Refine user flows

### Phase 2: Public Launch (Weeks 5-8)
- Onboard 40+ additional vendors
- Marketing campaign launch
- PR and social media push
- Monitor performance and user feedback

### Phase 3: Iteration (Weeks 9-12)
- Implement user feedback
- Optimize conversion funnel
- Enhance vendor tools
- Prepare for additional service categories

---

## 13. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low vendor adoption | High | Medium | Pre-launch vendor outreach, attractive commission |
| Poor user experience | High | Low | Extensive testing, user feedback loops |
| Technical issues at launch | Medium | Medium | Thorough testing, staged rollout |
| Payment integration delays | Low | Low | Using dummy payments in MVP |
| Competition from established players | Medium | High | Focus on superior UX, local optimization |

---

## 14. Success Criteria

### Launch Success (3 Months)
- ✅ 50+ active catering vendors
- ✅ 500+ registered consumers
- ✅ 100+ completed bookings
- ✅ Average 4+ star rating
- ✅ <5% cancellation rate

### Platform Health
- ✅ <3s average page load time
- ✅ 99.5%+ uptime
- ✅ <24hr vendor response time
- ✅ 70%+ booking completion rate

---

## 15. Future Roadmap

### Phase 2 (Months 4-6)
- Add Decor services
- Add Rentals (furniture, equipment)
- Enhanced analytics
- Loyalty program

### Phase 3 (Months 7-9)
- Add Entertainment services
- Add Photography services
- Real payment integration
- Mobile native apps (iOS, Android)

### Phase 4 (Months 10-12)
- Multi-language support (Arabic)
- Advanced AI recommendations
- Vendor subscription tiers
- Event templates and planning tools

---

## 16. Appendix

### 16.1 Glossary
- **Consumer:** End user planning an event
- **Vendor:** Service provider (caterer in MVP)
- **Admin:** Platform administrator
- **Booking:** Confirmed service request
- **Event:** Occasion requiring services

### 16.2 References
- Similar platforms: Talabat, Zomato, EventBrite
- Market research: Bahrain event planning industry

---

**Document Prepared By:** Gatherly Product Team  
**Next Review Date:** March 15, 2026