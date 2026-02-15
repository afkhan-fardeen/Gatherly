# Gatherly - Pages & Screens

**Version:** 1.0  
**Date:** February 15, 2026

---

## Overview

This document provides a comprehensive list of all pages and screens for each platform in the Gatherly MVP.

---

## Page Structure Legend

- **🔴 P0** = Critical for MVP
- **🟡 P1** = High priority
- **🟢 P2** = Nice to have / Future

---

## 1. Consumer Web App Pages

### 1.1 Public Pages (Before Login)

#### P1.1.1 Landing Page 🔴
**URL:** `/`

**Purpose:** Marketing homepage to attract users

**Key Elements:**
- Hero section with value proposition
- "Sign Up" and "Login" CTAs
- Feature highlights (3-4 key features)
- How it works (3 steps)
- Popular vendors showcase
- Event type categories
- Testimonials / Social proof 🟡
- Footer with links

**Mobile Layout:**
- Stacked sections
- Large CTA buttons
- Swipeable vendor carousel

---

#### P1.1.2 Registration Page 🔴
**URL:** `/register` or `/signup`

**Purpose:** New user registration

**Key Elements:**
- Registration form:
  - Email/phone input
  - Password input with strength indicator
  - Confirm password
  - Terms & conditions checkbox
  - Privacy policy checkbox
- "Create Account" button
- "Already have an account? Login" link
- Social login options (Google) 🟡
- Back to homepage link

**Mobile Layout:**
- Full-screen form
- Single column
- Sticky CTA button at bottom

---

#### P1.1.3 OTP Verification Page 🔴
**URL:** `/verify-otp`

**Purpose:** Verify user's phone/email

**Key Elements:**
- OTP input fields (4-6 digits)
- "Verify" button
- "Resend OTP" link (with timer)
- "Change phone/email" link
- Instructions text

**Mobile Layout:**
- Centered OTP input
- Numeric keyboard auto-open
- Auto-submit on completion

---

#### P1.1.4 Login Page 🔴
**URL:** `/login`

**Purpose:** Existing user authentication

**Key Elements:**
- Login form:
  - Email/phone input
  - Password input
  - "Remember me" checkbox
- "Login" button
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Social login options 🟡

**Mobile Layout:**
- Full-screen form
- Single column
- Sticky CTA button

---

#### P1.1.5 Forgot Password Page 🔴
**URL:** `/forgot-password`

**Purpose:** Password reset initiation

**Key Elements:**
- Email/phone input
- "Send Reset Link" button
- "Back to login" link
- Instructions text

**Mobile Layout:**
- Simple centered form
- Clear instructions

---

#### P1.1.6 Reset Password Page 🔴
**URL:** `/reset-password/:token`

**Purpose:** Set new password

**Key Elements:**
- New password input
- Confirm password input
- Password strength indicator
- "Reset Password" button
- "Back to login" link

---

### 1.2 Consumer Dashboard & Navigation

#### P1.2.1 Consumer Dashboard (Home) 🔴
**URL:** `/dashboard` or `/home`

**Purpose:** Main hub after login

**Key Elements:**
- Welcome message with user name
- Quick action card: "Create New Event"
- Upcoming events section (next 3 events)
- Quick links:
  - Browse Vendors
  - My Bookings
  - Manage Guests
- Popular vendors carousel
- Recent activity feed 🟡
- Bottom navigation bar (mobile):
  - Home
  - Browse
  - Create (+)
  - Bookings
  - Profile

**Mobile Layout:**
- Vertical scrolling cards
- Bottom navigation (sticky)
- Floating "+" button for create event

---

#### P1.2.2 Profile/Account Page 🔴
**URL:** `/profile` or `/account`

**Purpose:** User profile management

**Key Elements:**
- Profile picture (upload/edit)
- Personal information:
  - Name
  - Email
  - Phone
  - Default location
- "Edit Profile" button
- Settings section:
  - Notification preferences
  - Language (future)
  - Privacy settings
- "Change Password" link
- "Delete Account" link
- "Logout" button

**Mobile Layout:**
- List-based layout
- Section dividers
- Modal for edits

---

### 1.3 Vendor Discovery Pages

#### P1.3.1 Vendor Listing Page 🔴
**URL:** `/vendors` or `/browse`

**Purpose:** Browse all catering vendors

**Key Elements:**
- Search bar (prominent at top)
- Filter button
- Sort dropdown
- Vendor cards grid/list:
  - Vendor image/logo
  - Vendor name
  - Cuisine types
  - Rating (stars + count)
  - Starting price
  - Location/service area
  - "View Details" button
- Pagination or infinite scroll
- "No results" empty state
- Loading skeletons

**Mobile Layout:**
- Single column cards
- Filter sidebar slides in from left
- Sticky search bar

**Variants:**
- `/vendors?cuisine=italian` (filtered)
- `/vendors?search=pizza` (search results)

---

#### P1.3.2 Filter Panel / Page 🔴
**URL:** `/vendors/filters` (mobile fullscreen) or sidebar (desktop)

**Purpose:** Advanced filtering

**Key Elements:**
- Cuisine type (multi-select checkboxes)
- Price range slider
- Rating filter (4+ stars, 3+ stars, etc.)
- Dietary options (vegetarian, vegan, halal, etc.)
- Event type suitability
- Minimum order capacity
- Service area filter
- "Apply Filters" button
- "Clear All" button
- Active filter count badge

**Mobile Layout:**
- Full-screen overlay
- Scrollable sections
- Sticky header with close button
- Sticky footer with CTAs

---

#### P1.3.3 Vendor Profile Page 🔴
**URL:** `/vendor/:vendorId`

**Purpose:** Detailed vendor information

**Key Elements:**
- **Header Section:**
  - Vendor banner image
  - Logo
  - Business name
  - Cuisine types
  - Rating & review count
  - Action buttons:
    - Call
    - Message
    - Share
  
- **Navigation Tabs:**
  - About
  - Packages
  - Gallery
  - Reviews
  - Availability

- **About Tab:**
  - Business description
  - Years in business
  - Service areas
  - Operating hours
  - Contact information

- **Packages Tab:**
  - Package cards:
    - Package name & image
    - Description
    - Price
    - Includes (items list)
    - Dietary tags
    - Min/max guests
    - "Select Package" button

- **Gallery Tab:**
  - Image grid
  - Lightbox view on click
  - Category filters (food, events, setup)

- **Reviews Tab:**
  - Overall rating summary
  - Rating breakdown (5 stars, 4 stars, etc.)
  - Individual review cards:
    - Reviewer name
    - Date
    - Rating
    - Review text
    - Event type
    - Photos (if any)

- **Availability Tab:**
  - Calendar view
  - Available/unavailable dates marked
  - Date selector

**Mobile Layout:**
- Vertical scroll
- Tabs as horizontal scrollable pills
- Sticky header with back button
- Bottom sticky "Select Package" CTA

---

### 1.4 Event Creation Pages

#### P1.4.1 Create Event Page (Multi-step Form) 🔴
**URL:** `/events/create`

**Purpose:** Create new event with all details

**Step 1: Basic Details**
- Event name input
- Event type dropdown
- Date picker
- Start time picker
- End time picker (optional)
- Progress indicator (Step 1 of 4)
- "Next" button

**Step 2: Location**
- Location type selector (home vs external venue)
- Address input with autocomplete
- Map integration
- Venue name (if external)
- Access notes textarea
- "Previous" and "Next" buttons

**Step 3: Guest & Budget**
- Guest count slider/input
- Budget range selector
- Budget input (optional custom amount)
- "Previous" and "Next" buttons

**Step 4: Special Requirements**
- Dietary requirements (multi-select)
- Service preferences
- Additional notes textarea
- "Save as Draft" button
- "Find Vendors" button

**Mobile Layout:**
- Full-screen multi-step form
- Step indicators at top
- One field per screen (mobile-optimized)
- Swipe gesture support

---

#### P1.4.2 Draft Events Page 🔴
**URL:** `/events/drafts`

**Purpose:** View and manage saved draft events

**Key Elements:**
- Draft event cards:
  - Event name
  - Date (if set)
  - Completion percentage
  - "Continue Editing" button
  - "Delete" button
- "Create New Event" button
- Empty state if no drafts

**Mobile Layout:**
- Card list
- Swipe-to-delete gesture

---

#### P1.4.3 Edit Event Page 🔴
**URL:** `/events/:eventId/edit`

**Purpose:** Edit existing event details

**Key Elements:**
- Pre-filled form (same as create event)
- "Save Changes" button
- "Cancel" button
- Delete event option 🟡

---

### 1.5 Booking Flow Pages

#### P1.5.1 Package Selection Page 🔴
**URL:** `/book/:vendorId?eventId=:eventId`

**Purpose:** Select and customize package

**Key Elements:**
- Event summary card (collapsible):
  - Event name, date, location
  - Guest count
- Vendor info summary
- Package selector (if multiple)
- Package details display
- Guest count adjuster
- Menu items list (with checkboxes for customization)
- Add-ons section:
  - Optional items
  - Extra services
  - Quantity selectors
- Price calculator (live updating):
  - Base price
  - Add-ons
  - Service charges
  - Total
- Dietary requirements input
- Special instructions textarea
- "Request Quote" or "Continue" button

**Mobile Layout:**
- Sticky price summary at bottom
- Collapsible sections
- Floating CTA

---

#### P1.5.2 Booking Summary Page 🔴
**URL:** `/book/:vendorId/summary`

**Purpose:** Review booking before submission

**Key Elements:**
- Event details section
- Vendor & package details
- Guest count
- Selected items breakdown
- Add-ons included
- Special requirements recap
- Price breakdown:
  - Subtotal
  - Service charges
  - Total amount
- Edit buttons (for each section)
- Terms & conditions checkbox
- "Send Booking Request" button
- "Save for Later" button

**Mobile Layout:**
- Accordion-style sections
- Sticky price summary
- Sticky CTA button

---

#### P1.5.3 Booking Request Sent Page 🔴
**URL:** `/book/confirmation/:bookingId`

**Purpose:** Confirmation after sending request

**Key Elements:**
- Success icon/animation
- "Request Sent Successfully!" message
- Booking reference number
- Expected response time
- What happens next (steps)
- Action buttons:
  - "View Booking Details"
  - "Continue Browsing"
  - "Go to Dashboard"

**Mobile Layout:**
- Centered content
- Large success icon
- Clear CTAs

---

### 1.6 Booking Management Pages

#### P1.6.1 My Bookings Page 🔴
**URL:** `/bookings`

**Purpose:** View all user bookings

**Key Elements:**
- Tab navigation:
  - Active
  - Past
  - Cancelled
- Booking cards:
  - Event name
  - Date & time
  - Vendor name & logo
  - Status badge
  - Guest count
  - Total amount
  - Quick action buttons
- Filter by date range 🟡
- Search bookings 🟡
- Empty state for each tab

**Mobile Layout:**
- Bottom tab bar
- Card list
- Pull-to-refresh

---

#### P1.6.2 Booking Details Page 🔴
**URL:** `/bookings/:bookingId`

**Purpose:** Detailed view of single booking

**Key Elements:**
- Status banner (colored by status)
- Event information section
- Vendor details section (with contact buttons)
- Package/menu details
- Guest count
- Special requirements
- Price breakdown
- Payment status
- Status timeline (visual progress tracker)
- Action buttons (context-dependent):
  - "Proceed to Payment"
  - "Contact Vendor"
  - "Manage Guests"
  - "Cancel Booking"
  - "Leave Review" (if completed)
  - "Download Receipt"

**Mobile Layout:**
- Vertical scroll
- Sticky action bar at bottom
- Collapsible sections

---

### 1.7 Guest Management Pages

#### P1.7.1 Guest List Page 🔴
**URL:** `/events/:eventId/guests` or `/bookings/:bookingId/guests`

**Purpose:** Manage event guest list

**Key Elements:**
- Guest count summary (total, by category)
- Search guests bar
- Filter by category
- "Add Guest" button
- "Import CSV" button
- "Bulk Add" button
- Guest cards/list:
  - Name
  - Category badge
  - Contact info (phone/email)
  - Dietary preferences icon
  - Edit icon
  - Delete icon
- Select all checkbox
- Bulk actions:
  - Categorize
  - Send details
  - Delete
- "Export Guest List" button

**Mobile Layout:**
- Floating "+" button
- Swipe-to-delete gesture
- Multi-select mode
- Bottom action bar when items selected

---

#### P1.7.2 Add/Edit Guest Page 🔴
**URL:** `/events/:eventId/guests/add` or `/guests/:guestId/edit`

**Purpose:** Add or edit individual guest

**Key Elements:**
- Guest form:
  - Name (required)
  - Phone number
  - Email address
  - Category dropdown
  - Dietary preferences (multi-select)
  - Plus-one toggle
  - RSVP status (manual)
  - Notes
- "Save Guest" button
- "Cancel" button

**Mobile Layout:**
- Full-screen form
- Sticky save button

---

#### P1.7.3 Import Guests Page 🔴
**URL:** `/events/:eventId/guests/import`

**Purpose:** Bulk import guests from CSV

**Key Elements:**
- Instructions
- CSV template download link
- File upload area (drag & drop)
- File format requirements
- Preview table (after upload)
- Error messages (if format issues)
- "Import" button
- "Cancel" button

---

#### P1.7.4 Share Event Details Page 🟡
**URL:** `/events/:eventId/share`

**Purpose:** Send event details to guests

**Key Elements:**
- Guest selection (checkboxes or "Select All")
- Sharing method tabs:
  - Email
  - SMS
- Message preview
- Customize message (optional)
- "Send" button

**Mobile Layout:**
- Full-screen
- Scrollable guest list
- Sticky send button

---

### 1.8 Payment Pages

#### P1.8.1 Payment Page (Dummy) 🔴
**URL:** `/payment/:bookingId`

**Purpose:** Process payment (simulated)

**Key Elements:**
- Booking summary
- Total amount (prominent)
- Payment deadline
- Payment method selector:
  - Credit/Debit Card
  - Bank Transfer
  - Cash on Delivery
- Payment form (conditional based on method):
  - **Card:** Card number, expiry, CVV, name
  - **Bank Transfer:** Bank details display, upload proof
  - **Cash on Delivery:** Confirmation and terms
- "Pay Now" / "Confirm" button
- Security badges
- Terms & cancellation policy

**Mobile Layout:**
- Full-screen form
- Sticky pay button
- Mobile-optimized card input

---

#### P1.8.2 Payment Success Page 🔴
**URL:** `/payment/success/:bookingId`

**Purpose:** Payment confirmation

**Key Elements:**
- Success animation/icon
- "Payment Successful!" message
- Booking reference number
- Amount paid
- Receipt download button
- "What's Next" section
- Action buttons:
  - "View Booking"
  - "Download Receipt"
  - "Go to Dashboard"

**Mobile Layout:**
- Centered content
- Large success visual
- Clear CTAs

---

### 1.9 Review Pages

#### P1.9.1 Leave Review Page 🟡
**URL:** `/bookings/:bookingId/review`

**Purpose:** Submit vendor review

**Key Elements:**
- Vendor info display
- Event summary
- Overall rating (star selector)
- Category ratings:
  - Food Quality
  - Service
  - Punctuality
  - Value for Money
- Review text (textarea)
- Photo upload (multiple)
- "Would you recommend?" toggle
- "Submit Review" button
- "Skip for Now" link

**Mobile Layout:**
- Full-screen form
- Large star selectors
- Photo upload grid

---

### 1.10 Coming Soon Pages

#### P1.10.1 Coming Soon - Decor 🔴
**URL:** `/coming-soon/decor`

**Purpose:** Placeholder for decor services

**Key Elements:**
- Category icon (large)
- "Coming Soon" badge
- Service description
- Expected launch timeframe
- Email notification signup form
- "Browse Available Services" button (back to catering)

---

#### P1.10.2 Coming Soon - Rentals 🔴
**URL:** `/coming-soon/rentals`

**Purpose:** Placeholder for rental services

**Key Elements:**
- (Same structure as Decor)

---

#### P1.10.3 Coming Soon - Entertainment 🔴
**URL:** `/coming-soon/entertainment`

---

#### P1.10.4 Coming Soon - Photography 🔴
**URL:** `/coming-soon/photography`

---

#### P1.10.5 Coming Soon - Miscellaneous 🔴
**URL:** `/coming-soon/misc`

---

### 1.11 Support & Help Pages

#### P1.11.1 Help Center 🟡
**URL:** `/help`

**Purpose:** Self-service support

**Key Elements:**
- Search bar
- FAQ categories
- Popular articles
- Contact support button

---

#### P1.11.2 Contact Support Page 🟡
**URL:** `/support/contact`

**Purpose:** Submit support ticket

**Key Elements:**
- Support form
- Issue category dropdown
- Description textarea
- File upload
- "Submit" button

---

### 1.12 Error Pages

#### P1.12.1 404 Not Found 🔴
**URL:** `/404` (catch-all)

**Purpose:** Handle invalid URLs

**Key Elements:**
- 404 illustration
- "Page Not Found" message
- "Go to Homepage" button
- Search bar

---

#### P1.12.2 500 Server Error 🔴
**URL:** `/error`

**Purpose:** Handle server errors

**Key Elements:**
- Error illustration
- "Something Went Wrong" message
- "Try Again" button
- "Contact Support" link

---

#### P1.12.3 Maintenance Page 🟡
**URL:** `/maintenance`

**Purpose:** Scheduled maintenance notice

**Key Elements:**
- Maintenance icon
- Message
- Expected duration
- Follow social media links

---

## 2. Vendor Web Portal Pages

### 2.1 Vendor Authentication Pages

#### P2.1.1 Vendor Registration Page 🔴
**URL:** `/vendor/register`

**Purpose:** Multi-step vendor application

**Step 1: Business Information**
- Business name
- Business type (individual/company)
- Owner name
- Email, phone
- Password
- "Next" button

**Step 2: Business Details**
- Description
- Cuisine types
- Years in business
- Service areas
- Address
- "Next" button

**Step 3: Documents**
- Business license upload
- Health certificates upload
- Insurance upload (optional)
- Additional certifications
- "Next" button

**Step 4: Bank Details**
- Account holder name
- Bank name
- IBAN
- Account number
- "Next" button

**Step 5: Review & Submit**
- Summary of all information
- Terms & conditions
- Vendor agreement
- "Submit Application" button

---

#### P2.1.2 Vendor Login Page 🔴
**URL:** `/vendor/login`

**Purpose:** Vendor authentication

**Key Elements:**
- Login form
- "Forgot password?" link
- "Apply as Vendor" link

---

#### P2.1.3 Application Pending Page 🔴
**URL:** `/vendor/pending`

**Purpose:** Post-registration status

**Key Elements:**
- "Application Received" message
- Application tracking number
- Review timeline
- What happens next
- Contact support option

---

### 2.2 Vendor Dashboard Pages

#### P2.2.1 Vendor Dashboard 🔴
**URL:** `/vendor/dashboard`

**Purpose:** Main hub for vendors

**Key Elements:**
- Welcome message
- Key metrics cards:
  - Pending Requests (with badge)
  - Upcoming Events
  - Total Bookings
  - Average Rating
- Quick actions:
  - View Requests
  - Add Package
  - Update Availability
  - View Messages
- Upcoming bookings list (next 5)
- Recent activity feed
- Performance summary

**Layout:**
- Desktop: Grid layout
- Tablet: 2-column
- Mobile: Single column, cards

---

#### P2.2.2 Vendor Profile Settings 🔴
**URL:** `/vendor/profile`

**Purpose:** Manage business profile

**Key Elements:**
- Business information section
- Logo upload
- Gallery management
- Service information
- Operating hours editor
- Contact information
- Social media links
- "Save Changes" button

---

### 2.3 Package Management Pages

#### P2.3.1 Packages List Page 🔴
**URL:** `/vendor/packages`

**Purpose:** View all vendor packages

**Key Elements:**
- "Create New Package" button
- Package cards:
  - Package image
  - Name & description
  - Price
  - Active/inactive toggle
  - Edit button
  - Delete button
  - View details
- Empty state

---

#### P2.3.2 Create/Edit Package Page 🔴
**URL:** `/vendor/packages/create` or `/packages/:packageId/edit`

**Purpose:** Add or edit package

**Key Elements:**
- Multi-step form (as described in flows)
- Package preview (live)
- "Save Draft" button
- "Publish" button

---

### 2.4 Booking Management Pages

#### P2.4.1 Booking Requests Page 🔴
**URL:** `/vendor/bookings`

**Purpose:** Manage all bookings

**Key Elements:**
- Tabs:
  - Pending Requests
  - Confirmed
  - Completed
  - Cancelled
- Booking cards with status
- Filter and search

---

#### P2.4.2 Booking Request Details Page 🔴
**URL:** `/vendor/bookings/:bookingId`

**Purpose:** View and act on booking

**Key Elements:**
- Consumer info
- Event details
- Package selected
- Requirements
- Action buttons:
  - Accept
  - Propose Alternative
  - Message Consumer
  - Decline

---

#### P2.4.3 Active Booking Management Page 🔴
**URL:** `/vendor/bookings/:bookingId/manage`

**Purpose:** Manage confirmed booking

**Key Elements:**
- Booking details
- Status updater
- Guest list view
- Contact consumer
- Update status timeline

---

### 2.5 Availability Management Pages

#### P2.5.1 Availability Calendar Page 🔴
**URL:** `/vendor/availability`

**Purpose:** Manage available dates

**Key Elements:**
- Monthly calendar
- Mark unavailable dates
- Booking limits
- Save button

---

### 2.6 Reviews & Analytics Pages

#### P2.6.1 Reviews Page 🟡
**URL:** `/vendor/reviews`

**Purpose:** View all reviews

**Key Elements:**
- Overall rating
- Review breakdown
- Individual reviews
- Filter options
- Reply to reviews

---

#### P2.6.2 Analytics Dashboard 🟡
**URL:** `/vendor/analytics`

**Purpose:** Performance insights

**Key Elements:**
- Revenue charts (dummy)
- Booking trends
- Popular packages
- Response time metrics
- Export reports

---

## 3. Admin Console Pages

### 3.1 Admin Authentication

#### P3.1.1 Admin Login Page 🔴
**URL:** `/admin/login`

**Purpose:** Secure admin access

**Key Elements:**
- Admin login form
- MFA input (future)
- "Forgot password?" link

---

### 3.2 Admin Dashboard Pages

#### P3.2.1 Admin Dashboard 🔴
**URL:** `/admin/dashboard`

**Purpose:** Platform oversight

**Key Elements:**
- Platform metrics
- Recent activity
- Alerts
- Quick actions
- Charts and graphs

---

#### P3.2.2 Vendor Management Page 🔴
**URL:** `/admin/vendors`

**Purpose:** Manage vendors

**Key Elements:**
- Tabs (pending, approved, rejected, suspended)
- Vendor list
- Filter and search
- Quick actions

---

#### P3.2.3 Vendor Application Details Page 🔴
**URL:** `/admin/vendors/:vendorId/application`

**Purpose:** Review vendor application

**Key Elements:**
- All application data
- Documents viewer
- Approve/reject buttons
- Request info button
- Notes section

---

#### P3.2.4 User Management Page 🔴
**URL:** `/admin/users`

**Purpose:** Manage consumers

**Key Elements:**
- User list table
- Search and filter
- User actions (suspend, ban, reset password)

---

#### P3.2.5 User Details Page 🔴
**URL:** `/admin/users/:userId`

**Purpose:** View user details

**Key Elements:**
- User information
- Booking history
- Activity log
- Account actions

---

#### P3.2.6 Bookings Oversight Page 🔴
**URL:** `/admin/bookings`

**Purpose:** Monitor all bookings

**Key Elements:**
- All bookings list
- Filters (status, date, vendor, consumer)
- Export data
- Booking details view

---

#### P3.2.7 Content Moderation Page 🟡
**URL:** `/admin/moderation`

**Purpose:** Review flagged content

**Key Elements:**
- Tabs (reviews, vendors, reports)
- Moderation queue
- Approve/remove actions

---

#### P3.2.8 Analytics & Reports Page 🟡
**URL:** `/admin/analytics`

**Purpose:** Platform analytics

**Key Elements:**
- Navigation (overview, users, vendors, bookings, revenue)
- Charts and graphs
- Custom report builder
- Export options

---

#### P3.2.9 Platform Settings Page 🔴
**URL:** `/admin/settings`

**Purpose:** Configure platform

**Key Elements:**
- Commission rates
- Service fees
- Policies (terms, privacy, cancellation)
- Email templates
- System configuration

---

## 4. Common UI Components

These are reusable components across all platforms:

### C4.1 Navigation Components
- Top navigation bar
- Bottom navigation bar (mobile)
- Breadcrumbs
- Sidebar menu

### C4.2 Form Components
- Text inputs
- Text areas
- Dropdowns/Selects
- Checkboxes
- Radio buttons
- Toggle switches
- Date pickers
- Time pickers
- File upload
- Image upload with preview
- Multi-select
- Star rating selector
- Range sliders

### C4.3 Display Components
- Cards (various types)
- Badges
- Avatars
- Icons
- Buttons (primary, secondary, text, icon)
- Tabs
- Accordions
- Modals/Dialogs
- Toast notifications
- Loading spinners/skeletons
- Empty states
- Error states
- Success states
- Progress indicators
- Pagination
- Infinite scroll

### C4.4 Data Components
- Tables (responsive)
- Lists
- Carousels/Sliders
- Image galleries
- Charts (line, bar, pie, donut)
- Timelines
- Calendars

---

## 5. Responsive Breakpoints

**Mobile:** 320px - 767px  
**Tablet:** 768px - 1023px  
**Desktop:** 1024px+

---

## Summary

**Total Pages Count:**

**Consumer Web App:** ~35 pages  
**Vendor Portal:** ~20 pages  
**Admin Console:** ~15 pages  

**Total:** ~70 unique pages/screens for MVP

---

**Document Owner:** Gatherly Product Team  
**Last Updated:** February 15, 2026