# Gatherly - User Flows

**Version:** 1.0  
**Date:** February 15, 2026

---

## Overview

This document details the complete user journeys for all three user types on the Gatherly platform: Consumers, Vendors, and Admins.

---

## Flow Notation

- **→** Next step
- **[Decision]** Decision point with multiple paths
- **{Action}** User action required
- **(System)** Automated system action

---

## 1. Consumer User Flows

### 1.1 Registration & Onboarding Flow

```
START: User visits Gatherly
  ↓
Landing Page
  ↓
{Click "Sign Up" or "Get Started"}
  ↓
Registration Page
  ↓
{Enter email/phone number}
  ↓
{Enter password}
  ↓
{Accept Terms & Conditions}
  ↓
{Click "Create Account"}
  ↓
(System sends OTP)
  ↓
OTP Verification Screen
  ↓
{Enter OTP code}
  ↓
{Click "Verify"}
  ↓
[Decision: OTP Valid?]
  ├─ YES → (System creates account)
  │         ↓
  │       Welcome Screen
  │         ↓
  │       {Optional: Complete Profile}
  │         ↓
  │       Consumer Dashboard
  │         ↓
  │       END
  │
  └─ NO → Error Message
            ↓
          {Resend OTP or Try Again}
            ↓
          Return to OTP Verification Screen
```

**Alternative Path: Social Login**
```
Registration Page
  ↓
{Click "Continue with Google"}
  ↓
(System redirects to Google OAuth)
  ↓
{Authorize Gatherly}
  ↓
(System creates account with Google data)
  ↓
Welcome Screen
  ↓
Consumer Dashboard
  ↓
END
```

---

### 1.2 Browse & Discover Vendors Flow

```
START: Consumer Dashboard
  ↓
{Click "Browse Catering" or bottom nav "Vendors"}
  ↓
Vendor Listing Page (All Vendors)
  ↓
[Decision: What to do?]
  │
  ├─ SEARCH
  │    ↓
  │  {Enter search term (e.g., "Italian")}
  │    ↓
  │  {Press search}
  │    ↓
  │  (System filters vendors)
  │    ↓
  │  Search Results Page
  │    ↓
  │  Continue to Vendor Selection
  │
  ├─ FILTER
  │    ↓
  │  {Click "Filters" button}
  │    ↓
  │  Filter Panel Opens
  │    ↓
  │  {Select filters:}
  │  - Cuisine type
  │  - Price range
  │  - Rating
  │  - Dietary options
  │  - Event type
  │    ↓
  │  {Click "Apply Filters"}
  │    ↓
  │  (System filters vendors)
  │    ↓
  │  Filtered Results Page
  │    ↓
  │  Continue to Vendor Selection
  │
  ├─ SORT
  │    ↓
  │  {Select sort option:}
  │  - Popular
  │  - Highest rated
  │  - Price (low to high)
  │  - Price (high to low)
  │    ↓
  │  (System reorders list)
  │    ↓
  │  Sorted Results Page
  │    ↓
  │  Continue to Vendor Selection
  │
  └─ BROWSE
       ↓
     {Scroll through vendor cards}
       ↓
     Vendor Selection

Vendor Selection:
  ↓
{Click on vendor card}
  ↓
Vendor Profile Page
  ↓
END (Continue to Vendor Profile Flow)
```

---

### 1.3 View Vendor Profile Flow

```
START: Vendor Profile Page
  ↓
(System loads vendor information)
  ↓
Display:
- Vendor name & logo
- Rating & review count
- Cuisine types
- Description
- Operating hours
  ↓
[Decision: What to view?]
  │
  ├─ MENUS & PACKAGES
  │    ↓
  │  {Scroll to Packages section}
  │    ↓
  │  Display package cards
  │    ↓
  │  {Click package to expand}
  │    ↓
  │  Show:
  │  - Items included
  │  - Pricing
  │  - Dietary info
  │  - Min/max guests
  │    ↓
  │  [Decision: Interested?]
  │    ├─ YES → {Click "Select Package"}
  │    │         ↓
  │    │       Continue to Booking Flow
  │    │
  │    └─ NO → Continue browsing
  │
  ├─ GALLERY
  │    ↓
  │  {Click "View Gallery" or swipe images}
  │    ↓
  │  Image Carousel/Grid
  │    ↓
  │  {View food and event photos}
  │    ↓
  │  Return to profile
  │
  ├─ REVIEWS & RATINGS
  │    ↓
  │  {Scroll to Reviews section}
  │    ↓
  │  Display:
  │  - Overall rating
  │  - Review breakdown
  │  - Individual reviews
  │    ↓
  │  {Read reviews}
  │    ↓
  │  [Decision: Helpful?]
  │    ├─ YES → {Click "Select Package" or "Contact"}
  │    └─ NO → Return to vendor browsing
  │
  ├─ AVAILABILITY
  │    ↓
  │  {Click "Check Availability"}
  │    ↓
  │  Calendar View
  │    ↓
  │  Display available/unavailable dates
  │    ↓
  │  {Select preferred date (optional)}
  │    ↓
  │  Return to profile
  │
  └─ CONTACT VENDOR
       ↓
     {Click "Contact" or phone icon}
       ↓
     Contact Options:
     - Call
     - Message
       ↓
     [Decision: Which method?]
       ├─ CALL → (System initiates phone call)
       │           ↓
       │         END
       │
       └─ MESSAGE → Message Interface
                     ↓
                   {Type message}
                     ↓
                   {Send}
                     ↓
                   (System notifies vendor)
                     ↓
                   Wait for response
                     ↓
                   END
```

---

### 1.4 Create Event Flow

```
START: Consumer Dashboard
  ↓
{Click "Create Event" or floating + button}
  ↓
Event Creation Form - Step 1: Basic Details
  ↓
{Enter event name}
  ↓
{Select event type from dropdown:}
- Birthday
- Anniversary  
- Corporate
- Wedding
- Other
  ↓
{Select date (calendar picker)}
  ↓
{Select start time}
  ↓
{Select end time (optional)}
  ↓
{Click "Next" or swipe}
  ↓
Event Creation Form - Step 2: Location
  ↓
[Decision: Location type?]
  ├─ HOME/PRIVATE
  │    ↓
  │  {Select "In-Home / Private Location"}
  │    ↓
  │  {Enter address or use map}
  │    ↓
  │  {Add venue notes (optional)}
  │    ↓
  │  Continue
  │
  └─ EXTERNAL VENUE
       ↓
     {Select "External Venue"}
       ↓
     {Enter venue name}
       ↓
     {Enter venue address or use map}
       ↓
     {Add venue notes (optional)}
       ↓
     Continue
  ↓
{Click "Next"}
  ↓
Event Creation Form - Step 3: Guest Details
  ↓
{Enter expected guest count (slider/input)}
  ↓
{Select budget range (slider):}
- Budget
- Moderate
- Premium
OR
{Enter custom budget amount}
  ↓
{Click "Next"}
  ↓
Event Creation Form - Step 4: Special Requirements
  ↓
{Add dietary requirements (optional)}
  ↓
{Add service preferences (optional)}
  ↓
{Add special notes (optional)}
  ↓
[Decision: What to do?]
  │
  ├─ SAVE AS DRAFT
  │    ↓
  │  {Click "Save Draft"}
  │    ↓
  │  (System saves event)
  │    ↓
  │  Confirmation message
  │    ↓
  │  Return to Dashboard
  │    ↓
  │  END
  │
  └─ FIND VENDORS NOW
       ↓
     {Click "Find Vendors"}
       ↓
     (System matches vendors based on:)
     - Event type
     - Location
     - Guest count
     - Budget
       ↓
     Recommended Vendors Page
       ↓
     Continue to Vendor Selection
       ↓
     END
```

---

### 1.5 Complete Booking Flow

```
START: Vendor Profile Page
  ↓
{Click "Select Package"}
  ↓
[Decision: Event created?]
  │
  ├─ YES → Continue
  │
  └─ NO → Redirect to Create Event Flow
           ↓
         Return after event creation
  ↓
Package Selection Page
  ↓
Display selected package details
  ↓
{Review/modify guest count}
  ↓
(System calculates price)
  ↓
[Decision: Customize?]
  │
  ├─ YES
  │    ↓
  │  {Select additional items}
  │    ↓
  │  {Add extras/add-ons}
  │    ↓
  │  (System updates price)
  │    ↓
  │  Continue
  │
  └─ NO → Continue
  ↓
{Add dietary requirements for guests}
  ↓
{Add special instructions}
  ↓
{Click "Request Quote" or "Continue"}
  ↓
Booking Summary Page
  ↓
Display:
- Event details
- Vendor & package
- Total guests
- Selected items
- Special requirements
- Estimated price
  ↓
[Decision: Everything correct?]
  │
  ├─ NO
  │    ↓
  │  {Click "Edit"}
  │    ↓
  │  Return to relevant step
  │    ↓
  │  Make changes
  │    ↓
  │  Return to Booking Summary
  │
  └─ YES
       ↓
     {Click "Send Booking Request"}
       ↓
     (System sends request to vendor)
       ↓
     Request Sent Confirmation
       ↓
     Display:
     - "Request sent successfully"
     - Expected response time
     - Tracking number
       ↓
     [Decision: What next?]
       │
       ├─ VIEW BOOKING
       │    ↓
       │  Booking Details Page
       │  Status: "Pending Vendor Response"
       │    ↓
       │  END
       │
       └─ CONTINUE BROWSING
            ↓
          Return to Dashboard
            ↓
          END
```

**Vendor Response Flow:**
```
(Vendor accepts booking)
  ↓
(System sends notification to consumer)
  ↓
Consumer sees notification
  ↓
{Click notification or view booking}
  ↓
Booking Details Page
Status: "Confirmed - Pending Payment"
  ↓
{Click "Proceed to Payment"}
  ↓
Continue to Payment Flow
```

---

### 1.6 Payment Flow (Dummy)

```
START: Booking Confirmed by Vendor
  ↓
Booking Details Page
  ↓
{Click "Proceed to Payment"}
  ↓
Payment Page
  ↓
Display:
- Booking summary
- Total amount
- Payment deadline
  ↓
{Select payment method:}
- Credit/Debit Card (dummy)
- Bank Transfer
- Cash on Delivery
  ↓
[Decision: Which method?]
  │
  ├─ CREDIT/DEBIT CARD
  │    ↓
  │  Card Details Form (dummy)
  │    ↓
  │  {Enter card number (dummy)}
  │    ↓
  │  {Enter expiry date (dummy)}
  │    ↓
  │  {Enter CVV (dummy)}
  │    ↓
  │  {Enter cardholder name}
  │    ↓
  │  {Click "Pay Now"}
  │    ↓
  │  (System simulates processing)
  │    ↓
  │  Loading animation (2-3 seconds)
  │    ↓
  │  Payment Success Screen
  │    ↓
  │  Continue to Confirmation
  │
  ├─ BANK TRANSFER
  │    ↓
  │  Bank Transfer Instructions
  │    ↓
  │  Display:
  │  - Bank details
  │  - Reference number
  │  - Amount
  │  - Deadline
  │    ↓
  │  {Click "I've Made the Transfer"}
  │    ↓
  │  Confirmation pending screen
  │    ↓
  │  (Awaiting admin verification)
  │    ↓
  │  END
  │
  └─ CASH ON DELIVERY
       ↓
     Cash Payment Confirmation
       ↓
     Display:
     - Amount to pay
     - Payment terms
       ↓
     {Click "Confirm Cash Payment"}
       ↓
     Booking Confirmed
       ↓
     Continue to Confirmation

Payment Confirmation:
  ↓
Payment Success Page
  ↓
Display:
- Success checkmark animation
- Booking confirmed message
- Booking reference number
- Receipt download button
  ↓
(System sends confirmation email)
  ↓
(System sends confirmation SMS - optional)
  ↓
{Click "View Booking Details"}
  ↓
Booking Details Page
Status: "Confirmed - Paid"
  ↓
{Click "Done" or return to dashboard}
  ↓
Consumer Dashboard
  ↓
END
```

---

### 1.7 Guest Management Flow

```
START: Event Details or Booking Page
  ↓
{Click "Manage Guests" or "Guest List" tab}
  ↓
Guest List Page
  ↓
[Decision: How to add guests?]
  │
  ├─ ADD MANUALLY
  │    ↓
  │  {Click "+ Add Guest"}
  │    ↓
  │  Add Guest Form
  │    ↓
  │  {Enter name}
  │    ↓
  │  {Enter phone (optional)}
  │    ↓
  │  {Enter email (optional)}
  │    ↓
  │  {Select category (VIP, Family, Friends, etc.)}
  │    ↓
  │  {Add dietary preferences (optional)}
  │    ↓
  │  {Add notes (optional)}
  │    ↓
  │  {Click "Save Guest"}
  │    ↓
  │  (System adds guest to list)
  │    ↓
  │  Guest List Updated
  │    ↓
  │  Continue or End
  │
  ├─ IMPORT FROM CSV
  │    ↓
  │  {Click "Import CSV"}
  │    ↓
  │  File Upload Dialog
  │    ↓
  │  {Select CSV file}
  │    ↓
  │  {Click "Upload"}
  │    ↓
  │  (System validates and imports)
  │    ↓
  │  [Decision: Valid format?]
  │    ├─ YES → Import Success
  │    │         ↓
  │    │       Guest List Updated
  │    │         ↓
  │    │       Show imported count
  │    │         ↓
  │    │       Continue or End
  │    │
  │    └─ NO → Error Message
  │              ↓
  │            "Invalid format" message
  │              ↓
  │            {Download template or try again}
  │              ↓
  │            Return to Import
  │
  └─ BULK ADD
       ↓
     {Click "Bulk Add"}
       ↓
     Bulk Add Interface
       ↓
     {Paste multiple names/emails (one per line)}
       ↓
     {Click "Add All"}
       ↓
     (System processes entries)
       ↓
     Guest List Updated
       ↓
     Continue or End

Guest Management Actions:
  ↓
Guest List Page (with guests)
  ↓
[Decision: What to do?]
  │
  ├─ EDIT GUEST
  │    ↓
  │  {Click guest card}
  │    ↓
  │  Guest Details View
  │    ↓
  │  {Click "Edit"}
  │    ↓
  │  Edit Guest Form (pre-filled)
  │    ↓
  │  {Modify information}
  │    ↓
  │  {Click "Save Changes"}
  │    ↓
  │  (System updates guest)
  │    ↓
  │  Guest List Updated
  │    ↓
  │  END
  │
  ├─ DELETE GUEST
  │    ↓
  │  {Swipe left on guest or click delete icon}
  │    ↓
  │  Confirmation Dialog
  │    ↓
  │  "Are you sure?"
  │    ↓
  │  {Click "Yes, Delete"}
  │    ↓
  │  (System removes guest)
  │    ↓
  │  Guest List Updated
  │    ↓
  │  END
  │
  ├─ CATEGORIZE GUESTS
  │    ↓
  │  {Select multiple guests}
  │    ↓
  │  {Click "Categorize"}
  │    ↓
  │  {Choose category}
  │    ↓
  │  (System updates guests)
  │    ↓
  │  Guest List Updated
  │    ↓
  │  END
  │
  ├─ SEND EVENT DETAILS
  │    ↓
  │  {Select guests or "Select All"}
  │    ↓
  │  {Click "Share Event Details"}
  │    ↓
  │  Sharing Options:
  │  - Email
  │  - SMS
  │  - WhatsApp (future)
  │    ↓
  │  [Decision: Which method?]
  │    ├─ EMAIL
  │    │    ↓
  │    │  Email Template Preview
  │    │    ↓
  │    │  {Review and customize (optional)}
  │    │    ↓
  │    │  {Click "Send"}
  │    │    ↓
  │    │  (System sends emails)
  │    │    ↓
  │    │  Success Confirmation
  │    │    ↓
  │    │  END
  │    │
  │    └─ SMS
  │         ↓
  │       SMS Preview
  │         ↓
  │       {Review and customize (optional)}
  │         ↓
  │       {Click "Send"}
  │         ↓
  │       (System sends SMS)
  │         ↓
  │       Success Confirmation
  │         ↓
  │       END
  │
  └─ EXPORT GUEST LIST
       ↓
     {Click "Export"}
       ↓
     Export Options:
     - CSV
     - PDF
       ↓
     {Select format}
       ↓
     (System generates file)
       ↓
     Download prompt
       ↓
     {Download file}
       ↓
     END
```

---

### 1.8 Order Tracking Flow

```
START: Consumer Dashboard
  ↓
{Click "My Bookings" or bottom nav "Orders"}
  ↓
My Bookings Page
  ↓
Display tabs:
- Active
- Past
- Cancelled
  ↓
{Select tab}
  ↓
[Decision: Which tab?]
  │
  ├─ ACTIVE BOOKINGS
  │    ↓
  │  Display active bookings list
  │    ↓
  │  Show:
  │  - Event name & date
  │  - Vendor name
  │  - Status badge
  │  - Quick actions
  │    ↓
  │  {Click booking card}
  │    ↓
  │  Continue to Booking Details
  │
  ├─ PAST BOOKINGS
  │    ↓
  │  Display completed bookings
  │    ↓
  │  Show:
  │  - Event name & date
  │  - Vendor name
  │  - "Completed" badge
  │  - "Leave Review" button
  │    ↓
  │  [Decision: What to do?]
  │    ├─ VIEW DETAILS
  │    │    ↓
  │    │  {Click booking card}
  │    │    ↓
  │    │  Booking Details (read-only)
  │    │    ↓
  │    │  END
  │    │
  │    └─ LEAVE REVIEW
  │         ↓
  │       {Click "Leave Review"}
  │         ↓
  │       Continue to Review Flow
  │
  └─ CANCELLED BOOKINGS
       ↓
     Display cancelled bookings
       ↓
     Show:
     - Event name & date
     - Vendor name
     - "Cancelled" badge
     - Cancellation reason
       ↓
     {Click booking card (optional)}
       ↓
     Booking Details (read-only)
       ↓
     END

Booking Details View:
  ↓
Display:
- Event information
- Vendor details
- Package/menu selected
- Guest count
- Total price
- Payment status
- Current status badge
- Status timeline
  ↓
[Decision: Current status?]
  │
  ├─ PENDING VENDOR RESPONSE
  │    ↓
  │  Show: "Waiting for vendor to accept"
  │    ↓
  │  Actions:
  │  - Contact vendor
  │  - Cancel request
  │    ↓
  │  END
  │
  ├─ CONFIRMED - PENDING PAYMENT
  │    ↓
  │  Show: "Booking confirmed, payment required"
  │    ↓
  │  Actions:
  │  - Proceed to payment
  │  - Contact vendor
  │  - Cancel booking
  │    ↓
  │  END
  │
  ├─ CONFIRMED - PAID
  │    ↓
  │  Show: "Booking confirmed and paid"
  │    ↓
  │  Actions:
  │  - View receipt
  │  - Contact vendor
  │  - Request changes
  │  - Manage guests
  │    ↓
  │  END
  │
  ├─ IN PREPARATION
  │    ↓
  │  Show: "Vendor is preparing your order"
  │    ↓
  │  Actions:
  │  - Contact vendor
  │  - View details
  │    ↓
  │  END
  │
  └─ COMPLETED
       ↓
     Show: "Event completed"
       ↓
     Actions:
     - View receipt
     - Leave review
     - Download invoice
       ↓
     END
```

---

### 1.9 Leave Review Flow

```
START: Completed Booking
  ↓
{Click "Leave Review"}
  ↓
Review Form Page
  ↓
{Select overall rating (1-5 stars)}
  ↓
Rating Categories (optional):
  ↓
{Rate Food Quality (1-5 stars)}
  ↓
{Rate Service (1-5 stars)}
  ↓
{Rate Punctuality (1-5 stars)}
  ↓
{Rate Value for Money (1-5 stars)}
  ↓
{Write review (text field)}
  ↓
{Upload photos (optional)}
  ↓
{Would you recommend? Yes/No}
  ↓
[Decision: Submit or cancel?]
  │
  ├─ SUBMIT
  │    ↓
  │  {Click "Submit Review"}
  │    ↓
  │  (System validates review)
  │    ↓
  │  [Decision: Valid?]
  │    ├─ YES
  │    │    ↓
  │    │  (System publishes review)
  │    │    ↓
  │    │  (System notifies vendor)
  │    │    ↓
  │    │  Success Message
  │    │  "Thank you for your review!"
  │    │    ↓
  │    │  Return to Booking Details
  │    │    ↓
  │    │  END
  │    │
  │    └─ NO
  │         ↓
  │       Error Message
  │         ↓
  │       "Please complete all required fields"
  │         ↓
  │       Return to Review Form
  │
  └─ CANCEL
       ↓
     Confirmation Dialog
       ↓
     "Discard review?"
       ↓
     {Click "Yes"}
       ↓
     Return to Booking Details
       ↓
     END
```

---

## 2. Vendor User Flows

### 2.1 Vendor Registration Flow

```
START: Gatherly Homepage
  ↓
{Click "Register as Vendor" or "Vendor Portal"}
  ↓
Vendor Registration Page
  ↓
{Select "I'm a Service Provider"}
  ↓
Registration Form - Step 1: Business Information
  ↓
{Enter business name}
  ↓
{Select business type:}
- Individual/Sole Proprietor
- Company/Corporation
  ↓
{Enter owner name}
  ↓
{Enter business email}
  ↓
{Enter business phone}
  ↓
{Enter password}
  ↓
{Confirm password}
  ↓
{Click "Next"}
  ↓
Registration Form - Step 2: Business Details
  ↓
{Enter business description}
  ↓
{Select cuisine types (multi-select)}
  ↓
{Enter years in business}
  ↓
{Enter service areas/locations}
  ↓
{Enter physical address}
  ↓
{Click "Next"}
  ↓
Registration Form - Step 3: Documents
  ↓
{Upload business license}
  ↓
{Upload health certificates}
  ↓
{Upload insurance documents (optional)}
  ↓
{Upload additional certifications (optional)}
  ↓
{Click "Next"}
  ↓
Registration Form - Step 4: Bank Details
  ↓
{Enter account holder name}
  ↓
{Enter bank name}
  ↓
{Enter IBAN}
  ↓
{Enter account number}
  ↓
{Click "Next"}
  ↓
Registration Form - Step 5: Review & Submit
  ↓
Display summary of all information
  ↓
{Review all details}
  ↓
{Accept Terms & Conditions}
  ↓
{Accept Vendor Agreement}
  ↓
[Decision: Everything correct?]
  │
  ├─ YES
  │    ↓
  │  {Click "Submit Application"}
  │    ↓
  │  (System saves application)
  │    ↓
  │  (System sends to admin for review)
  │    ↓
  │  Application Submitted Confirmation
  │    ↓
  │  Display:
  │  - "Application received"
  │  - "You'll hear from us in 2-3 business days"
  │  - Application tracking number
  │    ↓
  │  (System sends confirmation email)
  │    ↓
  │  Pending Approval Page
  │    ↓
  │  END (wait for admin approval)
  │
  └─ NO
       ↓
     {Click "Edit"}
       ↓
     Return to relevant step
       ↓
     Make corrections
       ↓
     Return to Review & Submit

Admin Approval Flow:
  ↓
(Admin reviews application)
  ↓
[Decision: Approved?]
  │
  ├─ APPROVED
  │    ↓
  │  (System activates vendor account)
  │    ↓
  │  (System sends approval email with login link)
  │    ↓
  │  Vendor receives notification
  │    ↓
  │  {Click login link in email}
  │    ↓
  │  Vendor Login Page
  │    ↓
  │  {Enter credentials}
  │    ↓
  │  Vendor Dashboard
  │    ↓
  │  Welcome/Onboarding Tour (optional)
  │    ↓
  │  END
  │
  └─ REJECTED
       ↓
     (System sends rejection email with reason)
       ↓
     Vendor receives notification
       ↓
     [Decision: Reapply?]
       ├─ YES → {Click "Reapply"}
       │         ↓
       │       Pre-filled Registration Form
       │         ↓
       │       {Fix issues}
       │         ↓
       │       Resubmit
       │         ↓
       │       Return to Admin Approval Flow
       │
       └─ NO → END
```

---

### 2.2 Vendor Profile Setup Flow

```
START: First-time Vendor Login
  ↓
Vendor Dashboard (empty state)
  ↓
"Complete Your Profile" Banner
  ↓
{Click "Complete Profile"}
  ↓
Profile Setup Wizard - Step 1: Business Details
  ↓
{Upload business logo}
  ↓
{Edit business description (if needed)}
  ↓
{Add tagline/motto}
  ↓
{Add cuisine specialties}
  ↓
{Click "Next"}
  ↓
Profile Setup Wizard - Step 2: Service Information
  ↓
{Confirm service areas}
  ↓
{Set delivery radius (km)}
  ↓
{Set operating hours (by day)}
  ↓
{Set lead time required (days)}
  ↓
{Set maximum guest capacity}
  ↓
{Click "Next"}
  ↓
Profile Setup Wizard - Step 3: Contact & Social
  ↓
{Confirm phone numbers}
  ↓
{Add WhatsApp number (optional)}
  ↓
{Add Instagram (optional)}
  ↓
{Add Facebook (optional)}
  ↓
{Add website (optional)}
  ↓
{Click "Next"}
  ↓
Profile Setup Wizard - Step 4: Gallery
  ↓
{Upload food photos (min 3)}
  ↓
{Upload event photos (optional)}
  ↓
{Set featured image}
  ↓
{Click "Next"}
  ↓
Profile Complete!
  ↓
{Click "Go to Dashboard"}
  ↓
Vendor Dashboard
  ↓
"Add Your First Package" Prompt
  ↓
Continue to Package Creation Flow
```

---

### 2.3 Package/Menu Creation Flow

```
START: Vendor Dashboard
  ↓
{Click "+ Add Package" or "Manage Packages"}
  ↓
Packages Page
  ↓
{Click "Create New Package"}
  ↓
Package Creation Form - Step 1: Basic Info
  ↓
{Enter package name}
  ↓
{Enter package description}
  ↓
{Select package type:}
- Buffet
- Plated/Served
- Family Style
- Live Cooking Station
- Other
  ↓
{Upload package image}
  ↓
{Click "Next"}
  ↓
Package Creation Form - Step 2: Menu Items
  ↓
{Click "+ Add Item"}
  ↓
Item Entry:
  ↓
{Enter item name}
  ↓
{Select category:}
- Appetizer
- Main Course
- Side Dish
- Dessert
- Beverage
  ↓
{Enter description}
  ↓
{Add dietary tags (multi-select):}
- Vegetarian
- Vegan
- Halal
- Gluten-free
- Dairy-free
- Nut-free
  ↓
{Add allergen warnings (optional)}
  ↓
{Upload item image (optional)}
  ↓
{Click "Add Item"}
  ↓
(System adds item to package)
  ↓
[Decision: Add more items?]
  ├─ YES → Return to Item Entry
  └─ NO → Continue
  ↓
{Click "Next"}
  ↓
Package Creation Form - Step 3: Pricing
  ↓
{Select pricing model:}
- Per Person
- Fixed Package Price
  ↓
[Decision: Which model?]
  │
  ├─ PER PERSON
  │    ↓
  │  {Enter price per person}
  │    ↓
  │  {Enter minimum guests}
  │    ↓
  │  {Enter maximum guests}
  │    ↓
  │  Continue
  │
  └─ FIXED PRICE
       ↓
     {Enter package price}
       ↓
     {Enter included guest count}
       ↓
     {Enter price per additional guest}
       ↓
     Continue
  ↓
{Add setup fee (optional)}
  ↓
{Add service charge % (optional)}
  ↓
{Click "Next"}
  ↓
Package Creation Form - Step 4: Add-Ons & Extras
  ↓
{Add optional items consumers can add}
  ↓
{Add extra services:}
- Additional waitstaff
- Extended service hours
- Premium cutlery/tableware
- Cleanup service
  ↓
{Set prices for each add-on}
  ↓
{Click "Next"}
  ↓
Package Creation Form - Step 5: Review
  ↓
Display complete package preview
  ↓
{Review all details}
  ↓
[Decision: Everything correct?]
  │
  ├─ YES
  │    ↓
  │  {Toggle "Active" status}
  │    ↓
  │  {Click "Publish Package"}
  │    ↓
  │  (System saves and publishes package)
  │    ↓
  │  Success Message
  │  "Package published successfully!"
  │    ↓
  │  Packages Page (updated with new package)
  │    ↓
  │  END
  │
  └─ NO
       ↓
     {Click "Edit"}
       ↓
     Return to relevant step
       ↓
     Make corrections
       ↓
     Return to Review
```

---

### 2.4 Manage Booking Requests Flow

```
START: Vendor Dashboard
  ↓
(System notification: New booking request)
  ↓
Notification badge on "Bookings" or "Requests"
  ↓
{Click "Bookings" or notification}
  ↓
Booking Requests Page
  ↓
Display tabs:
- Pending Requests
- Confirmed
- Completed
- Cancelled
  ↓
{Select "Pending Requests" tab}
  ↓
Display list of pending requests with:
- Consumer name
- Event type & date
- Guest count
- Package requested
- Timestamp of request
  ↓
{Click request card}
  ↓
Booking Request Details
  ↓
Display:
- Consumer information
- Event details (date, time, location)
- Guest count
- Package selected
- Special requirements
- Dietary needs
- Budget/proposed price
- Consumer message (if any)
  ↓
[Decision: What to do?]
  │
  ├─ ACCEPT BOOKING
  │    ↓
  │  {Review all details carefully}
  │    ↓
  │  [Decision: Can fulfill as-is?]
  │    ├─ YES
  │    │    ↓
  │    │  {Click "Accept Booking"}
  │    │    ↓
  │    │  Confirmation Dialog
  │    │  "Confirm acceptance?"
  │    │    ↓
  │    │  {Click "Yes, Confirm"}
  │    │    ↓
  │    │  (System updates booking status)
  │    │    ↓
  │    │  (System notifies consumer)
  │    │    ↓
  │    │  (System blocks date in calendar)
  │    │    ↓
  │    │  Success Message
  │    │  "Booking accepted!"
  │    │    ↓
  │    │  Booking Details Page
  │    │  Status: "Confirmed - Awaiting Payment"
  │    │    ↓
  │    │  END
  │    │
  │    └─ NO (Need to modify)
  │         ↓
  │       Continue to Propose Alternative
  │
  ├─ PROPOSE ALTERNATIVE QUOTE
  │    ↓
  │  {Click "Propose Alternative"}
  │    ↓
  │  Alternative Quote Form
  │    ↓
  │  {Modify pricing (if needed)}
  │    ↓
  │  {Suggest alternative package (if needed)}
  │    ↓
  │  {Suggest alternative date (if needed)}
  │    ↓
  │  {Add message explaining changes}
  │    ↓
  │  {Click "Send Proposal"}
  │    ↓
  │  (System sends proposal to consumer)
  │    ↓
  │  (System notifies consumer)
  │    ↓
  │  Proposal Sent Confirmation
  │    ↓
  │  Booking Status: "Awaiting Consumer Response"
  │    ↓
  │  END (wait for consumer decision)
  │
  ├─ REQUEST MORE INFORMATION
  │    ↓
  │  {Click "Message Consumer"}
  │    ↓
  │  Message Interface
  │    ↓
  │  {Type questions/clarifications}
  │    ↓
  │  {Click "Send"}
  │    ↓
  │  (System sends message to consumer)
  │    ↓
  │  (System notifies consumer)
  │    ↓
  │  Message Sent Confirmation
  │    ↓
  │  Booking Status: "Awaiting Information"
  │    ↓
  │  END (wait for consumer response)
  │
  └─ DECLINE BOOKING
       ↓
     {Click "Decline"}
       ↓
     Decline Reason Form
       ↓
     {Select reason:}
     - Fully booked on that date
     - Outside service area
     - Guest count exceeds capacity
     - Cannot meet requirements
     - Other (specify)
       ↓
     {Add message to consumer (optional)}
       ↓
     {Click "Confirm Decline"}
       ↓
     Confirmation Dialog
     "Are you sure you want to decline?"
       ↓
     {Click "Yes, Decline"}
       ↓
     (System updates booking status)
       ↓
     (System notifies consumer)
       ↓
     Booking Declined Confirmation
       ↓
     Return to Pending Requests
       ↓
     END
```

---

### 2.5 Manage Active Bookings Flow

```
START: Vendor Dashboard
  ↓
{Click "Bookings" → "Confirmed" tab}
  ↓
Display list of confirmed bookings
  ↓
{Click booking card}
  ↓
Active Booking Details
  ↓
Display:
- Event information
- Consumer contact
- Guest count
- Package details
- Payment status
- Current status
- Timeline
  ↓
[Decision: What to do?]
  │
  ├─ UPDATE STATUS
  │    ↓
  │  {Click "Update Status"}
  │    ↓
  │  Status Options:
  │  - Confirmed
  │  - In Preparation
  │  - Delivered
  │  - Completed
  │    ↓
  │  {Select new status}
  │    ↓
  │  [Decision: Status selected?]
  │    │
  │    ├─ IN PREPARATION
  │    │    ↓
  │    │  {Add preparation notes (optional)}
  │    │    ↓
  │    │  {Click "Update"}
  │    │    ↓
  │    │  (System updates status)
  │    │    ↓
  │    │  (System notifies consumer)
  │    │    ↓
  │    │  Status Updated Confirmation
  │    │    ↓
  │    │  END
  │    │
  │    ├─ DELIVERED
  │    │    ↓
  │    │  {Confirm delivery time}
  │    │    ↓
  │    │  {Add delivery notes (optional)}
  │    │    ↓
  │    │  {Click "Update"}
  │    │    ↓
  │    │  (System updates status)
  │    │    ↓
  │    │  (System notifies consumer)
  │    │    ↓
  │    │  Status Updated Confirmation
  │    │    ↓
  │    │  END
  │    │
  │    └─ COMPLETED
  │         ↓
  │       Completion Confirmation
  │         ↓
  │       "Mark booking as completed?"
  │         ↓
  │       {Click "Yes, Complete"}
  │         ↓
  │       (System updates status)
  │         ↓
  │       (System notifies consumer)
  │         ↓
  │       (System requests consumer review)
  │         ↓
  │       Booking Completed
  │         ↓
  │       Move to "Completed" tab
  │         ↓
  │       END
  │
  ├─ CONTACT CONSUMER
  │    ↓
  │  {Click "Contact Consumer"}
  │    ↓
  │  Contact Options:
  │  - Call
  │  - Message
  │  - Email
  │    ↓
  │  {Select method}
  │    ↓
  │  [Decision: Which method?]
  │    ├─ CALL
  │    │    ↓
  │    │  (System initiates call)
  │    │    ↓
  │    │  END
  │    │
  │    ├─ MESSAGE
  │    │    ↓
  │    │  Message Interface
  │    │    ↓
  │    │  {Type message}
  │    │    ↓
  │    │  {Send}
  │    │    ↓
  │    │  (System notifies consumer)
  │    │    ↓
  │    │  END
  │    │
  │    └─ EMAIL
  │         ↓
  │       Email Interface
  │         ↓
  │       {Compose email}
  │         ↓
  │       {Send}
  │         ↓
  │       END
  │
  ├─ VIEW GUEST LIST
  │    ↓
  │  {Click "View Guest List"}
  │    ↓
  │  Guest List Modal/Page
  │    ↓
  │  Display:
  │  - Total guest count
  │  - Guest names (if shared)
  │  - Dietary requirements
  │  - Special needs
  │    ↓
  │  {Review information}
  │    ↓
  │  {Click "Close" or back}
  │    ↓
  │  Return to Booking Details
  │    ↓
  │  END
  │
  └─ CANCEL BOOKING (Emergency)
       ↓
     {Click "Cancel Booking"}
       ↓
     Cancellation Form
       ↓
     {Select cancellation reason}
       ↓
     {Add detailed explanation}
       ↓
     {Acknowledge refund policy}
       ↓
     {Click "Confirm Cancellation"}
       ↓
     Final Confirmation Dialog
     "This action cannot be undone"
       ↓
     {Click "Yes, Cancel"}
       ↓
     (System cancels booking)
       ↓
     (System processes refund - dummy)
       ↓
     (System notifies consumer)
       ↓
     (System notifies admin)
       ↓
     Cancellation Confirmed
       ↓
     Move to "Cancelled" tab
       ↓
     END
```

---

### 2.6 Vendor Dashboard Overview Flow

```
START: Vendor Login
  ↓
Vendor Dashboard Homepage
  ↓
Display:
  │
  ├─ KEY METRICS CARDS
  │  - Pending Requests (with count badge)
  │  - Upcoming Events This Week
  │  - Total Bookings (All-time)
  │  - Average Rating
  │
  ├─ QUICK ACTIONS
  │  - View Pending Requests
  │  - Add New Package
  │  - Update Availability
  │  - View Messages
  │
  ├─ UPCOMING BOOKINGS LIST
  │  (Next 5 upcoming events)
  │  - Event name & date
  │  - Consumer name
  │  - Guest count
  │  - Quick status update button
  │
  ├─ RECENT ACTIVITY FEED
  │  - New booking request
  │  - Payment received
  │  - Review received
  │  - Message from consumer
  │
  └─ PERFORMANCE SUMMARY
     - Revenue This Month (dummy)
     - Bookings This Month
     - Response Time Average
     - Completion Rate
  ↓
[Decision: What to do?]
  ├─ Check Pending Requests → Go to Booking Requests Flow
  ├─ Manage Packages → Go to Package Management
  ├─ Update Availability → Go to Calendar Management
  ├─ View Analytics → Go to Analytics Page
  └─ Update Profile → Go to Profile Settings
  ↓
END
```

---

## 3. Admin User Flows

### 3.1 Admin Login Flow

```
START: Admin Portal URL
  ↓
Admin Login Page
  ↓
{Enter admin email/username}
  ↓
{Enter password}
  ↓
{Click "Login"}
  ↓
[Decision: Credentials valid?]
  │
  ├─ YES
  │    ↓
  │  [Decision: MFA enabled? (future)]
  │    ├─ YES
  │    │    ↓
  │    │  MFA Verification
  │    │    ↓
  │    │  {Enter 2FA code}
  │    │    ↓
  │    │  [Decision: Valid code?]
  │    │    ├─ YES → Admin Dashboard
  │    │    │         ↓
  │    │    │       END
  │    │    │
  │    │    └─ NO → Error Message
  │    │              ↓
  │    │            Return to MFA Verification
  │    │
  │    └─ NO
  │         ↓
  │       Admin Dashboard
  │         ↓
  │       END
  │
  └─ NO
       ↓
     Error Message
     "Invalid credentials"
       ↓
     {Click "Try Again" or "Forgot Password"}
       ↓
     [Decision: Which?]
       ├─ TRY AGAIN → Return to Login Page
       └─ FORGOT PASSWORD → Password Reset Flow
                             ↓
                           END
```

---

### 3.2 Vendor Approval Flow

```
START: Admin Dashboard
  ↓
(System notification: New vendor application)
  ↓
{Click "Vendor Management" or notification}
  ↓
Vendor Management Page
  ↓
Display tabs:
- Pending Applications
- Approved Vendors
- Rejected Applications
- Suspended Vendors
  ↓
{Select "Pending Applications" tab}
  ↓
Display list of pending vendor applications with:
- Business name
- Application date
- Service type (catering)
- Quick status indicators
  ↓
{Click application card}
  ↓
Vendor Application Details
  ↓
Display:
- Business Information
  - Name, type, owner
  - Email, phone
  - Description
  - Service areas
  - Years in business
- Uploaded Documents
  - Business license (view/download)
  - Health certificates
  - Insurance
  - Other documents
- Bank Details
  - Account information
- Application timestamp
  ↓
{Review all information thoroughly}
  ↓
[Decision: Documents valid and complete?]
  │
  ├─ YES - APPROVE
  │    ↓
  │  {Click "Approve Vendor"}
  │    ↓
  │  Approval Confirmation Dialog
  │  "Approve this vendor application?"
  │    ↓
  │  {Add approval notes (optional)}
  │    ↓
  │  {Click "Confirm Approval"}
  │    ↓
  │  (System activates vendor account)
  │    ↓
  │  (System sends approval email to vendor)
  │    ↓
  │  (System creates vendor login credentials)
  │    ↓
  │  Approval Success Message
  │  "Vendor approved successfully!"
  │    ↓
  │  Move to "Approved Vendors" tab
  │    ↓
  │  Return to Pending Applications List
  │    ↓
  │  END
  │
  ├─ NO - REQUEST MORE INFO
  │    ↓
  │  {Click "Request Information"}
  │    ↓
  │  Request Information Form
  │    ↓
  │  {Select missing/unclear items:}
  │  - Business license unclear
  │  - Health certificate expired
  │  - Missing insurance
  │  - Address verification needed
  │  - Other (specify)
  │    ↓
  │  {Add detailed message to vendor}
  │    ↓
  │  {Click "Send Request"}
  │    ↓
  │  (System sends email to vendor)
  │    ↓
  │  (System updates application status)
  │    ↓
  │  Application Status: "Pending Information"
  │    ↓
  │  Return to Pending Applications
  │    ↓
  │  END (wait for vendor response)
  │
  └─ NO - REJECT
       ↓
     {Click "Reject Application"}
       ↓
     Rejection Form
       ↓
     {Select rejection reason:}
     - Incomplete documents
     - Invalid business license
     - Does not meet requirements
     - Fraudulent application
     - Other (specify)
       ↓
     {Add detailed explanation}
       ↓
     {Click "Confirm Rejection"}
       ↓
     Final Confirmation Dialog
     "Reject this application?"
       ↓
     {Click "Yes, Reject"}
       ↓
     (System updates application status)
       ↓
     (System sends rejection email to vendor)
       ↓
     Rejection Success Message
       ↓
     Move to "Rejected Applications" tab
       ↓
     Return to Pending Applications
       ↓
     END
```

---

### 3.3 Platform Monitoring Flow

```
START: Admin Dashboard
  ↓
Dashboard Overview
  ↓
Display Key Metrics:
  │
  ├─ USER METRICS
  │  - Total Consumers
  │  - Active Consumers (last 30 days)
  │  - New Registrations (this week/month)
  │  - User Growth Chart
  │
  ├─ VENDOR METRICS
  │  - Total Active Vendors
  │  - Pending Applications (with badge)
  │  - Suspended Vendors
  │  - Average Vendor Rating
  │
  ├─ BOOKING METRICS
  │  - Total Bookings (lifetime)
  │  - Active Bookings
  │  - Completed Bookings
  │  - Cancelled Bookings
  │  - Booking Conversion Rate
  │  - Bookings by Status (pie chart)
  │
  ├─ FINANCIAL METRICS (Dummy)
  │  - Total Platform Revenue
  │  - Revenue This Month
  │  - Average Booking Value
  │  - Revenue Trend Chart
  │
  └─ PLATFORM HEALTH
     - System Uptime
     - Average Response Time
     - Active Sessions
     - Error Rate
  ↓
Display Recent Activity Feed:
- Latest User Registrations
- Latest Vendor Applications
- Latest Bookings
- Latest Reviews
- Latest Support Tickets
  ↓
Display Alerts (if any):
- Pending vendor applications (> 48 hours)
- Reported content
- Failed payments
- System errors
  ↓
[Decision: What to investigate?]
  ├─ USER ACTIVITY
  │    ↓
  │  {Click "View All Users"}
  │    ↓
  │  Continue to User Management Flow
  │
  ├─ VENDOR ACTIVITY
  │    ↓
  │  {Click "View All Vendors"}
  │    ↓
  │  Continue to Vendor Management
  │
  ├─ BOOKING OVERSIGHT
  │    ↓
  │  {Click "View All Bookings"}
  │    ↓
  │  Continue to Booking Oversight Flow
  │
  └─ ALERTS/ISSUES
       ↓
     {Click alert item}
       ↓
     Alert Details Page
       ↓
     {Take appropriate action}
       ↓
     END
```

---

### 3.4 User Management Flow

```
START: Admin Dashboard
  ↓
{Click "User Management"}
  ↓
User Management Page
  ↓
Display:
- Search bar
- Filter options
- User list table
  ↓
Users List Table with columns:
- User ID
- Name
- Email
- Registration Date
- Status (Active/Suspended/Banned)
- Total Bookings
- Last Activity
- Actions
  ↓
[Decision: What to do?]
  │
  ├─ SEARCH USER
  │    ↓
  │  {Enter search term (name, email, or ID)}
  │    ↓
  │  {Press search}
  │    ↓
  │  (System filters results)
  │    ↓
  │  Search Results
  │    ↓
  │  Continue to User Actions
  │
  ├─ FILTER USERS
  │    ↓
  │  {Click "Filters"}
  │    ↓
  │  Filter Options:
  │  - Status (active, suspended, banned)
  │  - Registration date range
  │  - Activity level (high, medium, low, inactive)
  │  - Total bookings (range)
  │    ↓
  │  {Apply filters}
  │    ↓
  │  (System filters list)
  │    ↓
  │  Filtered Results
  │    ↓
  │  Continue to User Actions
  │
  └─ VIEW USER DETAILS
       ↓
     {Click user row}
       ↓
     User Details Page
       ↓
     Display:
     - User Information
       - Name, email, phone
       - Registration date
       - Account status
       - Profile completeness
     - Activity Summary
       - Total bookings
       - Active bookings
       - Completed bookings
       - Cancelled bookings
       - Last login
     - Booking History
       - List of all bookings
       - Dates, vendors, amounts
     - Reviews Left
       - All reviews by user
     - Account Actions
       ↓
     [Decision: What action to take?]
       │
       ├─ VIEW BOOKINGS
       │    ↓
       │  {Click "View All Bookings"}
       │    ↓
       │  User's Booking List
       │    ↓
       │  {Click booking for details}
       │    ↓
       │  Booking Details (read-only)
       │    ↓
       │  END
       │
       ├─ SUSPEND USER
       │    ↓
       │  {Click "Suspend User"}
       │    ↓
       │  Suspension Form
       │    ↓
       │  {Select reason:}
       │  - Terms of service violation
       │  - Fraudulent activity
       │  - Payment issues
       │  - Abuse of platform
       │  - Other (specify)
       │    ↓
       │  {Add notes}
       │    ↓
       │  {Set suspension duration (optional)}
       │    ↓
       │  {Click "Confirm Suspension"}
       │    ↓
       │  Confirmation Dialog
       │  "Suspend this user?"
       │    ↓
       │  {Click "Yes"}
       │    ↓
       │  (System suspends user)
       │    ↓
       │  (System sends notification to user)
       │    ↓
       │  (System cancels active bookings)
       │    ↓
       │  Success Message
       │    ↓
       │  User Status: Suspended
       │    ↓
       │  END
       │
       ├─ BAN USER (Permanent)
       │    ↓
       │  {Click "Ban User"}
       │    ↓
       │  Ban Confirmation Dialog
       │  "Permanently ban this user?"
       │  "This action cannot be undone"
       │    ↓
       │  {Enter reason}
       │    ↓
       │  {Click "Confirm Ban"}
       │    ↓
       │  (System bans user permanently)
       │    ↓
       │  (System sends notification)
       │    ↓
       │  (System cancels all bookings)
       │    ↓
       │  Success Message
       │    ↓
       │  User Status: Banned
       │    ↓
       │  END
       │
       ├─ REACTIVATE USER
       │    ↓
       │  {Click "Reactivate"}
       │    ↓
       │  Reactivation Confirmation
       │    ↓
       │  {Add reactivation notes}
       │    ↓
       │  {Click "Confirm"}
       │    ↓
       │  (System reactivates user)
       │    ↓
       │  (System sends notification)
       │    ↓
       │  Success Message
       │    ↓
       │  User Status: Active
       │    ↓
       │  END
       │
       └─ RESET PASSWORD
            ↓
          {Click "Reset Password"}
            ↓
          Confirmation Dialog
          "Send password reset email?"
            ↓
          {Click "Yes"}
            ↓
          (System generates reset link)
            ↓
          (System sends email to user)
            ↓
          Success Message
          "Password reset email sent"
            ↓
          END
```

---

### 3.5 Content Moderation Flow

```
START: Admin Dashboard
  ↓
{Click "Content Moderation"}
  ↓
Content Moderation Page
  ↓
Display tabs:
- Flagged Reviews
- Reported Vendors
- Reported Content
  ↓
{Select tab}
  ↓
[Decision: What to moderate?]
  │
  ├─ FLAGGED REVIEWS
  │    ↓
  │  Flagged Reviews List
  │    ↓
  │  Display:
  │  - Review text
  │  - Reviewer name
  │  - Vendor name
  │  - Flag reason
  │  - Flag date
  │    ↓
  │  {Click review card}
  │    ↓
  │  Review Details
  │    ↓
  │  Display full context:
  │  - Complete review
  │  - Rating given
  │  - Booking details
  │  - Flag reason details
  │  - Vendor response (if any)
  │    ↓
  │  [Decision: Action to take?]
  │    ├─ APPROVE REVIEW (Keep)
  │    │    ↓
  │    │  {Click "Approve"}
  │    │    ↓
  │    │  {Add notes}
  │    │    ↓
  │    │  (System marks review as approved)
  │    │    ↓
  │    │  (System removes flag)
  │    │    ↓
  │    │  (System notifies flagger)
  │    │    ↓
  │    │  END
  │    │
  │    └─ REMOVE REVIEW
  │         ↓
  │       {Click "Remove"}
  │         ↓
  │       Remove Reason Form
  │         ↓
  │       {Select reason:}
  │       - Inappropriate language
  │       - Spam
  │       - False information
  │       - Violates guidelines
  │       - Other
  │         ↓
  │       {Add notes}
  │         ↓
  │       {Click "Confirm Removal"}
  │         ↓
  │       (System removes review)
  │         ↓
  │       (System notifies reviewer)
  │         ↓
  │       (System notifies vendor)
  │         ↓
  │       END
  │
  └─ REPORTED VENDORS
       ↓
     Reported Vendors List
       ↓
     Display:
     - Vendor name
     - Report reason
     - Reporter (consumer)
     - Report date
       ↓
     {Click vendor report}
       ↓
     Report Details
       ↓
     Display:
     - Reporter details
     - Detailed complaint
     - Booking reference (if applicable)
     - Evidence/screenshots
     - Vendor information
       ↓
     [Decision: Action to take?]
       ├─ DISMISS REPORT
       │    ↓
       │  {Add dismissal reason}
       │    ↓
       │  (System closes report)
       │    ↓
       │  (System notifies reporter)
       │    ↓
       │  END
       │
       ├─ WARNING TO VENDOR
       │    ↓
       │  {Compose warning message}
       │    ↓
       │  {Send warning}
       │    ↓
       │  (System logs warning)
       │    ↓
       │  (System notifies vendor)
       │    ↓
       │  END
       │
       └─ SUSPEND VENDOR
            ↓
          Continue to Vendor Suspension Flow
            ↓
          END
```

---

### 3.6 Analytics & Reporting Flow

```
START: Admin Dashboard
  ↓
{Click "Analytics" or "Reports"}
  ↓
Analytics Page
  ↓
Display navigation:
- Overview
- Users
- Vendors
- Bookings
- Revenue
- Custom Reports
  ↓
[Decision: Which analytics to view?]
  │
  ├─ OVERVIEW
  │    ↓
  │  Display dashboard with:
  │  - Key metrics summary
  │  - Growth trends
  │  - Platform health
  │  - Top performers
  │    ↓
  │  {Interact with date range selector}
  │    ↓
  │  {Select: Last 7 days, 30 days, 3 months, 1 year, Custom}
  │    ↓
  │  (System updates all charts and metrics)
  │    ↓
  │  END
  │
  ├─ USER ANALYTICS
  │    ↓
  │  Display:
  │  - User growth over time (line chart)
  │  - Active vs inactive users
  │  - User acquisition sources
  │  - User engagement metrics
  │  - Geographic distribution
  │    ↓
  │  {Export data?}
  │    ↓
  │  {Click "Export"}
  │    ↓
  │  {Select format: CSV or PDF}
  │    ↓
  │  (System generates report)
  │    ↓
  │  {Download}
  │    ↓
  │  END
  │
  ├─ VENDOR ANALYTICS
  │    ↓
  │  Display:
  │  - Vendor growth over time
  │  - Average vendor rating
  │  - Vendor performance rankings
  │  - Most popular vendors
  │  - Vendor response times
  │    ↓
  │  {Filter by:}
  │  - Date range
  │  - Service area
  │  - Rating range
  │    ↓
  │  (System updates data)
  │    ↓
  │  {Export if needed}
  │    ↓
  │  END
  │
  ├─ BOOKING ANALYTICS
  │    ↓
  │  Display:
  │  - Booking trends over time
  │  - Booking conversion funnel
  │  - Average booking value
  │  - Popular event types
  │  - Peak booking periods
  │  - Cancellation rates
  │    ↓
  │  {Drill down into specifics}
  │    ↓
  │  {Export if needed}
  │    ↓
  │  END
  │
  ├─ REVENUE ANALYTICS (Dummy)
  │    ↓
  │  Display:
  │  - Total revenue over time
  │  - Revenue by vendor
  │  - Revenue by event type
  │  - Commission tracking
  │  - Payment method breakdown
  │    ↓
  │  {Export financial report}
  │    ↓
  │  END
  │
  └─ CUSTOM REPORTS
       ↓
     Custom Report Builder
       ↓
     {Select metrics to include}
       ↓
     {Select date range}
       ↓
     {Select filters}
       ↓
     {Select grouping (by day, week, month)}
       ↓
     {Click "Generate Report"}
       ↓
     (System processes request)
       ↓
     Report Preview
       ↓
     [Decision: Satisfied?]
       ├─ YES
       │    ↓
       │  {Click "Export"}
       │    ↓
       │  {Select format}
       │    ↓
       │  {Download}
       │    ↓
       │  END
       │
       └─ NO
            ↓
          {Modify parameters}
            ↓
          {Regenerate}
            ↓
          Return to Report Preview
```

---

## 4. Common Cross-Platform Flows

### 4.1 Notification Handling Flow

```
Any User (Consumer/Vendor/Admin)
  ↓
(System generates notification)
  ↓
Notification channels:
- In-app notification
- Email notification
- SMS notification (optional)
  ↓
User sees notification indicator
  ↓
{Click notification bell/icon}
  ↓
Notifications Panel opens
  ↓
Display notifications list:
- Unread (bold/highlighted)
- Read (dimmed)
  ↓
{Click notification item}
  ↓
[Decision: Notification type?]
  │
  ├─ BOOKING UPDATE
  │    ↓
  │  Navigate to Booking Details
  │    ↓
  │  Mark notification as read
  │    ↓
  │  END
  │
  ├─ MESSAGE RECEIVED
  │    ↓
  │  Navigate to Messages/Chat
  │    ↓
  │  Mark notification as read
  │    ↓
  │  END
  │
  ├─ REVIEW RECEIVED
  │    ↓
  │  Navigate to Review Details
  │    ↓
  │  Mark notification as read
  │    ↓
  │  END
  │
  └─ SYSTEM ALERT
       ↓
     Display alert message
       ↓
     {Take action if needed}
       ↓
     Mark notification as read
       ↓
     END

Additional Actions:
  ↓
{Mark all as read}
  ↓
(System updates all notifications)
  ↓
END

OR
  ↓
{Clear notifications}
  ↓
(System removes read notifications)
  ↓
END
```

---

### 4.2 Error Handling Flow

```
Any Action by Any User
  ↓
{User performs action}
  ↓
(System processes request)
  ↓
[Decision: Success or Error?]
  │
  ├─ SUCCESS
  │    ↓
  │  Success message/confirmation
  │    ↓
  │  Continue normal flow
  │    ↓
  │  END
  │
  └─ ERROR
       ↓
     [Decision: Error type?]
       │
       ├─ NETWORK ERROR
       │    ↓
       │  Display: "Connection error. Please check your internet."
       │    ↓
       │  {Retry button}
       │    ↓
       │  {Click Retry}
       │    ↓
       │  Return to action
       │
       ├─ VALIDATION ERROR
       │    ↓
       │  Display: Error messages next to invalid fields
       │    ↓
       │  {Correct errors}
       │    ↓
       │  Return to action
       │
       ├─ AUTHENTICATION ERROR
       │    ↓
       │  Display: "Session expired. Please log in again."
       │    ↓
       │  Redirect to Login
       │    ↓
       │  {Log in}
       │    ↓
       │  Redirect back to previous action
       │
       ├─ PERMISSION ERROR
       │    ↓
       │  Display: "You don't have permission to perform this action."
       │    ↓
       │  {Contact support or go back}
       │    ↓
       │  END
       │
       ├─ NOT FOUND ERROR
       │    ↓
       │  Display: "The page or resource you're looking for doesn't exist."
       │    ↓
       │  {Go to homepage or go back}
       │    ↓
       │  END
       │
       └─ SERVER ERROR
            ↓
          Display: "Something went wrong. Our team has been notified."
            ↓
          (System logs error)
            ↓
          (System notifies dev team)
            ↓
          {Try again or contact support}
            ↓
          END
```

---

## Summary

This document provides comprehensive user flows for:
- **Consumers:** Registration, browsing, booking, guest management, payments, tracking
- **Vendors:** Registration, profile setup, package creation, booking management
- **Admins:** Vendor approval, user management, content moderation, analytics

Each flow includes decision points, alternative paths, and system responses to ensure a complete understanding of all user journeys in the Gatherly platform.

---

**Document Owner:** Gatherly Product Team  
**Last Updated:** February 15, 2026