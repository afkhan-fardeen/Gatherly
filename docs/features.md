# Gatherly - Features List

**Version:** 1.0  
**Date:** February 15, 2026

---

## Overview

This document provides a comprehensive breakdown of all features in the Gatherly MVP, organized by user type and priority.

---

## Feature Priority Legend

- 🔴 **P0 (Critical):** Must have for MVP launch
- 🟡 **P1 (High):** Important for launch, can be added in first update
- 🟢 **P2 (Nice to have):** Enhancement features for future releases

---

## 1. Consumer Web App Features

### 1.1 Authentication & Profile 🔴

#### User Registration
- Email/phone number registration
- OTP verification
- Password creation with strength indicator
- Terms and conditions acceptance
- Privacy policy acceptance

#### User Login
- Email/phone and password login
- "Remember me" option
- Google social login (optional)
- Password reset via email/SMS

#### User Profile
- Basic information (name, email, phone)
- Profile picture upload
- Default location/address
- Notification preferences
- Account deletion option

---

### 1.2 Vendor Discovery 🔴

#### Browse Vendors
- Grid/list view of catering vendors
- Vendor card display:
  - Business name
  - Cuisine types
  - Average rating (stars)
  - Starting price
  - Delivery areas
  - Featured image/logo
  - "View Details" CTA

#### Search Functionality
- Search by vendor name
- Search by cuisine type
- Search by location/area
- Voice search 🟢

#### Filters
- Filter by cuisine (Italian, Arabic, Asian, etc.)
- Filter by price range (budget, moderate, premium)
- Filter by dietary options (vegetarian, vegan, halal, gluten-free)
- Filter by rating (4+ stars, 3+ stars)
- Filter by event type suitability
- Filter by minimum order capacity

#### Sorting
- Sort by popularity
- Sort by rating (high to low)
- Sort by price (low to high, high to low)
- Sort by newest vendors

---

### 1.3 Vendor Profile View 🔴

#### Vendor Information
- Business name and logo
- Description/about section
- Cuisine specialties
- Years in business
- Service areas covered
- Operating hours
- Contact methods (call, message)

#### Menus & Packages
- Package categories (buffet, per person, family, corporate)
- Individual package cards with:
  - Package name
  - Description
  - Items included
  - Price
  - Dietary tags
  - Minimum/maximum guests
  - "Select Package" button

#### Gallery
- Image carousel of food and events
- Video gallery 🟢
- 360° venue photos 🟢

#### Reviews & Ratings
- Overall rating score
- Total number of reviews
- Individual review cards:
  - Reviewer name (or anonymous)
  - Star rating
  - Review text
  - Date
  - Event type
  - Images (if uploaded by reviewer) 🟡

#### Availability Calendar
- View vendor's available dates
- Blocked/unavailable dates marked

---

### 1.4 Event Creation 🔴

#### Event Details Form
- Event name/title
- Event type selection (dropdown):
  - Birthday
  - Anniversary
  - Corporate Event
  - Wedding
  - Engagement
  - Family Gathering
  - Other (custom input)
- Date picker (calendar interface)
- Time picker (start time, end time)
- Guest count (slider or number input)
- Budget range (currency with min-max sliders)

#### Location Details
- Venue name (optional)
- Address input with autocomplete
- Map integration for location selection
- Location notes (access instructions, parking)
- Venue type (home, hotel, outdoor, restaurant)

#### Special Requirements
- Dietary restrictions
- Allergen information
- Service preferences (buffet, plated, family style)
- Setup requirements
- Additional notes for vendor

#### Save & Draft
- Save event as draft
- Quick access to saved events
- Edit draft events
- Delete draft events

---

### 1.5 Booking Process 🔴

#### Package Selection
- Browse vendor's packages for selected event
- Compare packages side-by-side 🟡
- Add package to booking
- Customize package items
- Add extra items/services
- View real-time price calculation

#### Guest Count Adjustment
- Update guest count
- See price adjustments dynamically
- Minimum order warnings

#### Booking Summary
- Event details recap
- Selected vendor and package
- Date, time, location
- Total guest count
- Itemized pricing
- Total amount
- Edit options before confirmation

#### Vendor Communication
- Send inquiry/question to vendor
- Request custom quote
- Receive vendor responses
- Chat interface 🟡

#### Request Quote
- Submit booking request to vendor
- Vendor receives notification
- Await vendor confirmation
- Receive quote from vendor
- Accept or decline quote
- Negotiate pricing (message-based) 🟡

---

### 1.6 Guest Management 🔴

#### Guest List Creation
- Add guests manually (name, phone, email)
- Import from contacts (mobile) 🟡
- Import from CSV file
- Bulk add functionality

#### Guest Organization
- Categorize guests:
  - VIP
  - Family
  - Friends
  - Colleagues
  - Plus-ones
- Color-code categories
- Search guests
- Sort guests (alphabetically, by category)

#### Guest Details
- Name (required)
- Phone number
- Email address
- Dietary preferences
- Special requirements
- Plus-one allowance
- RSVP status (manual tracking)
  - Confirmed
  - Pending
  - Declined
- Notes per guest

#### Guest Actions
- Send event details via:
  - Email
  - SMS
  - WhatsApp (future) 🟡
- Duplicate guest detection
- Edit guest information
- Remove guests
- Guest count summary

#### Guest List Export
- Export to CSV
- Export to PDF
- Print guest list

---

### 1.7 Payment (Dummy) 🔴

#### Payment Methods (Simulated)
- Credit/Debit Card (dummy form)
- Bank Transfer (instructions)
- Cash on Delivery
- Payment method selection

#### Payment Flow
- View final booking summary
- Select payment method
- Enter dummy payment details
- Simulate payment processing
- Receive payment confirmation

#### Payment Confirmation
- Booking confirmation number
- Receipt generation (PDF)
- Email receipt
- SMS confirmation 🟡

---

### 1.8 Order Tracking 🔴

#### My Bookings Dashboard
- Active bookings
- Past bookings
- Cancelled bookings
- Tab-based navigation

#### Booking Details View
- Event information
- Vendor details
- Booking status:
  - Pending vendor confirmation
  - Confirmed
  - In preparation
  - Delivered/Completed
  - Cancelled
- Status timeline
- Vendor contact options

#### Booking Actions
- Contact vendor
- View invoice/receipt
- Cancel booking (with policy check)
- Modify booking (request changes) 🟡
- Leave review (after completion)

#### Notifications
- Vendor accepts booking
- Booking confirmed
- Vendor updates status
- Event reminder (24hr before)
- Event day notification

---

### 1.9 Reviews & Ratings 🟡

#### Post-Event Review
- Star rating (1-5)
- Written review (text)
- Photo upload
- Review categories:
  - Food quality
  - Service
  - Punctuality
  - Value for money
- Recommend to others (yes/no)

#### Review Management
- Edit own reviews
- Delete own reviews
- View all reviews submitted

---

### 1.10 Coming Soon Features (Placeholder Pages) 🔴

#### Service Category Placeholders
- Decor
- Rentals
- Entertainment
- Photography
- Miscellaneous

#### Placeholder Design
- Category icon
- "Coming Soon" badge
- Brief description
- "Notify Me" email capture
- Expected launch timeframe

---

### 1.11 Additional Consumer Features

#### Home Dashboard 🔴
- Quick event creation CTA
- Upcoming events
- Popular vendors carousel
- Recent bookings
- Quick actions (browse, create event)

#### Search History 🟡
- Recent searches
- Clear search history

#### Favorites/Wishlist 🟢
- Save favorite vendors
- Quick access to saved vendors
- Receive updates on favorites

#### Notifications Center 🟡
- In-app notifications
- Email notifications
- SMS notifications (opt-in)
- Push notifications (future native app)

#### Help & Support 🟡
- FAQ section
- Contact support form
- Live chat 🟢
- WhatsApp support link
- Phone support

---

## 2. Vendor Web Portal Features

### 2.1 Vendor Authentication 🔴

#### Vendor Registration
- Business registration form:
  - Business name
  - Business type (individual, company)
  - Owner name
  - Email
  - Phone number
  - Password creation
- Document upload:
  - Business license
  - Health certificates
  - Insurance documents (optional)
- Bank details (for future payments):
  - Account holder name
  - Bank name
  - IBAN
  - Account number
- Terms and conditions acceptance
- Submit for approval

#### Registration Status
- Pending approval notification
- Email confirmation of submission
- Approval/rejection notification
- Required corrections (if rejected)

#### Vendor Login
- Email/phone and password
- Password reset
- Remember me option

---

### 2.2 Vendor Profile Management 🔴

#### Business Profile
- Business name and logo upload
- Business description (rich text)
- Cuisine types/specialties (multi-select)
- Years in business
- Team size
- Certifications and awards 🟡

#### Service Information
- Service areas (location selector)
- Delivery radius
- Operating hours (by day of week)
- Lead time required (minimum notice)
- Maximum capacity (guest count)

#### Contact Information
- Primary phone number
- Secondary phone number
- Email address
- WhatsApp number
- Physical address
- Social media links (Instagram, Facebook) 🟡

#### Gallery Management
- Upload food photos
- Upload event photos
- Upload venue setup photos
- Set featured image
- Reorder images (drag and drop)
- Delete images
- Image compression and optimization

---

### 2.3 Service & Menu Management 🔴

#### Package Creation
- Package name
- Package description
- Package type (buffet, plated, family style, etc.)
- Price per person OR fixed price
- Minimum guest count
- Maximum guest count
- Package active/inactive toggle

#### Menu Items
- Add menu items to package:
  - Item name
  - Description
  - Category (appetizer, main, dessert, beverage)
  - Dietary tags (vegetarian, vegan, halal, etc.)
  - Allergen warnings
  - Item image
- Quantity specifications
- Portion sizes

#### Pricing Configuration
- Base price
- Additional person pricing
- Setup fees
- Service charges
- Delivery fees (by distance) 🟡
- Weekend/holiday surcharges 🟡

#### Add-Ons & Extras
- Optional items consumers can add
- Extra services (waiters, setup, cleanup)
- Premium items
- Beverage packages
- Dessert packages

---

### 2.4 Availability Management 🔴

#### Calendar
- Monthly calendar view
- Mark dates as unavailable
- Set maximum bookings per day
- Holiday scheduling
- Recurring unavailability 🟡

#### Booking Limits
- Maximum concurrent bookings
- Lead time requirements
- Buffer time between events

---

### 2.5 Booking Management 🔴

#### Incoming Requests
- New booking request notifications
- Request details view:
  - Event information
  - Consumer contact
  - Package selected
  - Guest count
  - Special requirements
  - Requested date/time
  - Location

#### Request Actions
- Accept booking
- Decline booking (with reason)
- Request more information
- Propose alternative quote
- Suggest alternative date

#### Active Bookings
- List of confirmed bookings
- Booking details
- Update booking status:
  - Confirmed
  - In preparation
  - Delivered
  - Completed
- Mark as completed
- Cancel booking (with refund policy)

#### Booking Timeline
- Status history
- Communication log
- Important dates/milestones

---

### 2.6 Communication 🟡

#### Messaging
- In-platform chat with consumers
- Message notifications
- Quick reply templates
- Attach images/files

#### Notifications
- New booking request
- Consumer messages
- Booking updates
- Review received

---

### 2.7 Vendor Dashboard 🔴

#### Overview Statistics
- Total bookings (all-time)
- Pending requests
- Upcoming events (this week/month)
- Revenue summary (dummy tracking)
- Average rating
- Response time metric

#### Quick Actions
- View pending requests
- Update availability
- Add new package
- View messages

#### Charts & Graphs 🟡
- Bookings over time
- Revenue trends
- Popular packages
- Peak booking periods

---

### 2.8 Reviews & Ratings 🟡

#### Review Display
- All reviews received
- Average rating breakdown
- Filter by rating
- Filter by event type
- Sort by date

#### Response to Reviews
- Reply to reviews
- Thank customers
- Address concerns

---

### 2.9 Financial Summary 🟡

#### Earnings Tracker (Dummy)
- Total earnings (based on completed bookings)
- Pending payments
- Completed payments
- Booking breakdown
- Export financial report (CSV/PDF)

---

### 2.10 Settings 🔴

#### Account Settings
- Update profile information
- Change password
- Notification preferences
- Deactivate account

#### Business Settings
- Update bank details
- Tax information
- Business hours
- Service areas

---

## 3. Admin Console Features

### 3.1 Admin Authentication 🔴

#### Admin Login
- Secure admin email/username login
- Password with MFA (optional) 🟡
- Role-based access control
- Session timeout

---

### 3.2 Dashboard Overview 🔴

#### Key Metrics
- Total registered consumers
- Total active vendors
- Total bookings (lifetime)
- Active bookings
- Completed bookings
- Cancelled bookings
- Platform revenue (dummy)

#### Recent Activity
- Latest user registrations
- Latest vendor applications
- Latest bookings
- Latest reviews

#### Quick Actions
- Approve pending vendors
- View flagged content
- Respond to support tickets 🟡

---

### 3.3 Vendor Management 🔴

#### Vendor Applications
- List of pending vendor applications
- Application details view:
  - Business information
  - Documents uploaded
  - Owner details
- Approve vendor
- Reject vendor (with reason)
- Request additional information

#### Vendor List
- All approved vendors
- Vendor status (active, suspended, inactive)
- Search vendors
- Filter by approval status
- Filter by rating
- Filter by service area

#### Vendor Actions
- View vendor profile
- View vendor bookings
- View vendor reviews
- Suspend vendor account
- Reactivate vendor account
- Send notification to vendor

---

### 3.4 Consumer Management 🔴

#### User List
- All registered consumers
- User status (active, suspended, banned)
- Search users
- Filter by registration date
- Filter by activity level

#### User Actions
- View user profile
- View user bookings
- Suspend user account
- Ban user account
- Reactivate user account
- Reset user password

---

### 3.5 Booking Oversight 🔴

#### All Bookings View
- List of all bookings (past and present)
- Filter by status
- Filter by date range
- Search by consumer or vendor
- Export booking data (CSV)

#### Booking Details
- Full booking information
- Consumer and vendor details
- Communication history
- Status timeline
- Dispute flags 🟡

---

### 3.6 Content Moderation 🟡

#### Review Moderation
- Flagged reviews
- Review details
- Approve/remove reviews
- Contact reviewer/vendor

#### Vendor Content Review
- Review vendor profiles
- Review vendor images
- Flag inappropriate content
- Request content updates

---

### 3.7 Analytics & Reports 🟡

#### Platform Analytics
- User growth over time
- Vendor growth over time
- Booking trends
- Most popular vendors
- Most popular cuisine types
- Average booking value
- Conversion funnel

#### Report Generation
- Custom date range reports
- Vendor performance reports
- Consumer activity reports
- Revenue reports (dummy)
- Export reports (PDF/CSV)

---

### 3.8 System Settings 🔴

#### Platform Configuration
- Commission rates (for future)
- Service fees
- Cancellation policies
- Terms and conditions management
- Privacy policy management

#### Email Templates 🟡
- Welcome emails
- Booking confirmations
- Vendor approval emails
- Notification templates

---

### 3.9 Support & Help Desk 🟢

#### Support Tickets
- View support requests
- Assign tickets to team members
- Update ticket status
- Respond to tickets
- Close resolved tickets

---

## 4. Cross-Platform Features

### 4.1 Notifications System 🔴

#### Email Notifications
- Welcome emails
- Verification emails
- Booking confirmations
- Status updates
- Password resets

#### SMS Notifications 🟡
- OTP codes
- Booking reminders
- Critical updates

#### In-App Notifications 🔴
- Real-time alerts
- Notification bell icon
- Notification history
- Mark as read/unread
- Clear all notifications

---

### 4.2 Search & Discovery 🔴

#### Global Search
- Search across vendors
- Search suggestions
- Recent searches
- Popular searches

---

### 4.3 Multilingual Support 🟢

#### Language Selection
- English (default for MVP)
- Arabic (future)
- Language toggle in settings

---

## 5. Technical Features

### 5.1 Performance 🔴
- Lazy loading images
- Infinite scroll for vendor lists
- Caching frequently accessed data
- Optimized database queries

### 5.2 Security 🔴
- HTTPS encryption
- JWT authentication
- Input validation and sanitization
- Rate limiting
- CSRF protection
- XSS protection

### 5.3 Responsive Design 🔴
- Mobile-first layouts (320px+)
- Tablet optimization (768px+)
- Desktop layouts (1024px+)
- Touch-friendly UI elements

### 5.4 Accessibility 🟡
- Keyboard navigation
- Screen reader compatibility
- ARIA labels
- Color contrast compliance
- Text resizing support

---

## 6. Future Feature Roadmap

### Phase 2 Features (Post-MVP)
- Real payment integration
- WhatsApp integration
- Video consultations with vendors
- Event templates library
- Vendor subscription tiers
- Advanced analytics
- Loyalty program
- Referral system

### Phase 3 Features
- Native mobile apps (iOS, Android)
- Multiple service categories (decor, entertainment, etc.)
- Vendor collaboration tools
- Event planning timeline tools
- Budget management tools
- Multi-language support

---

**Document Owner:** Gatherly Product Team  
**Last Updated:** February 15, 2026