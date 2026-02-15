# Gatherly - Technical Specifications

**Version:** 1.0  
**Date:** February 15, 2026

---

## Overview

This document outlines the technical architecture, technology stack, database design, API structure, and infrastructure requirements for the Gatherly MVP.

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Consumer   │  │    Vendor    │  │    Admin     │     │
│  │   Web App    │  │   Portal     │  │   Console    │     │
│  │  (React/Next)│  │  (React/Next)│  │  (React/Next)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS / REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Gateway / Load Balancer             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Backend API Server (Node.js/Express       │  │
│  │                 or Python/FastAPI)                   │  │
│  │                                                      │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────┐   │  │
│  │  │  Auth   │  │ Business │  │   Integration   │   │  │
│  │  │ Service │  │  Logic   │  │    Services     │   │  │
│  │  └─────────┘  └──────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │  File/Cloud  │     │
│  │   Database   │  │    Cache     │  │   Storage    │     │
│  │   (Primary)  │  │  (Optional)  │  │   (Images)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

External Services:
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│   Email    │  │    SMS     │  │   Maps     │  │  Payment   │
│  Service   │  │  Service   │  │    API     │  │  Gateway   │
│ (SendGrid) │  │  (Twilio)  │  │  (Google)  │  │  (Dummy)   │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend Stack

#### Option A: Next.js (Recommended)
```
Framework: Next.js 14+ (React 18+)
Language: TypeScript
Styling: Tailwind CSS
State Management: Redux Toolkit or Zustand
Form Handling: React Hook Form + Zod validation
HTTP Client: Axios or Fetch API
UI Components: shadcn/ui or Headless UI
Icons: Lucide React or Heroicons
Date Handling: date-fns
```

**Advantages:**
- Server-side rendering (SSR) for SEO
- Built-in routing
- API routes for serverless functions
- Image optimization
- TypeScript support

#### Option B: Create React App
```
Framework: React 18+
Routing: React Router v6
(Rest similar to Option A)
```

---

### 2.2 Backend Stack

#### Option A: Node.js + Express (Recommended)
```
Runtime: Node.js 18+ LTS
Framework: Express.js
Language: TypeScript
Validation: Zod or Joi
Authentication: JWT (jsonwebtoken)
Password Hashing: bcrypt
File Upload: Multer
Email: Nodemailer + SendGrid
ORM: Prisma or TypeORM
Testing: Jest + Supertest
```

**Project Structure:**
```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Request validation
├── types/           # TypeScript types
└── server.ts        # Entry point
```

#### Option B: Python + FastAPI
```
Language: Python 3.10+
Framework: FastAPI
ORM: SQLAlchemy
Authentication: JWT (python-jose)
Password Hashing: passlib + bcrypt
Validation: Pydantic (built-in)
Testing: Pytest
```

---

### 2.3 Database

#### Primary Database: PostgreSQL 14+

**Advantages:**
- ACID compliance
- Strong data integrity
- JSON support
- Robust indexing
- Scalability
- Open source

**Cloud Options:**
- AWS RDS
- Supabase (PostgreSQL + Auth)
- DigitalOcean Managed Database
- Heroku Postgres

---

### 2.4 Caching Layer (Optional for MVP)

```
Redis 7+
- Session management
- API response caching
- Rate limiting
```

---

### 2.5 File Storage

**Cloud Storage Options:**
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces
- Supabase Storage

**File Types:**
- Images: JPEG, PNG, WebP (converted)
- Documents: PDF (for receipts, licenses)
- Max file size: 5MB per file

---

### 2.6 Third-Party Services

#### Email Service
```
Primary: SendGrid or AWS SES
Fallback: Mailgun

Templates:
- Welcome email
- OTP verification
- Booking confirmation
- Password reset
- Vendor approval/rejection
```

#### SMS Service (Optional for MVP)
```
Provider: Twilio
Use Cases:
- OTP verification
- Booking reminders
- Critical notifications
```

#### Maps Integration
```
Provider: Google Maps API
Features:
- Address autocomplete
- Location picker
- Distance calculation (future)
- Service area visualization (future)
```

#### Payment Gateway (Dummy for MVP)
```
MVP: Simulated payment flow
Future: Stripe, PayPal, or local gateway (Benefit, STC Pay)
```

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐
│      Users      │
├─────────────────┤       ┌─────────────────┐
│ id (PK)        │◄──────│    Bookings     │
│ email          │       ├─────────────────┤
│ phone          │       │ id (PK)        │
│ password_hash  │       │ user_id (FK)   │
│ name           │       │ vendor_id (FK) │
│ role           │       │ event_id (FK)  │
│ status         │       │ package_id (FK)│
│ created_at     │       │ status         │
│ updated_at     │       │ total_amount   │
└─────────────────┘       │ payment_status │
                          │ created_at     │
┌─────────────────┐       │ updated_at     │
│     Vendors     │       └─────────────────┘
├─────────────────┤              │
│ id (PK)        │◄─────────────┘
│ user_id (FK)   │              │
│ business_name  │              │
│ description    │              │
│ status         │              │
│ rating_avg     │              │
│ total_bookings │              │
│ created_at     │              │
│ updated_at     │              │
└─────────────────┘              │
         │                       │
         │                       │
         ▼                       │
┌─────────────────┐              │
│    Packages     │              │
├─────────────────┤              │
│ id (PK)        │──────────────┘
│ vendor_id (FK) │
│ name           │
│ description    │
│ price_type     │
│ base_price     │
│ min_guests     │
│ max_guests     │
│ is_active      │
│ created_at     │
│ updated_at     │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│  Package_Items  │
├─────────────────┤
│ id (PK)        │
│ package_id (FK)│
│ name           │
│ description    │
│ category       │
│ dietary_tags   │
│ order          │
└─────────────────┘

┌─────────────────┐
│      Events     │
├─────────────────┤
│ id (PK)        │
│ user_id (FK)   │
│ name           │
│ event_type     │
│ date           │
│ time_start     │
│ time_end       │
│ guest_count    │
│ location       │
│ venue_type     │
│ budget_range   │
│ status         │
│ created_at     │
│ updated_at     │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│      Guests     │
├─────────────────┤
│ id (PK)        │
│ event_id (FK)  │
│ name           │
│ email          │
│ phone          │
│ category       │
│ dietary_prefs  │
│ rsvp_status    │
│ notes          │
│ created_at     │
└─────────────────┘

┌─────────────────┐
│     Reviews     │
├─────────────────┤
│ id (PK)        │
│ booking_id (FK)│
│ vendor_id (FK) │
│ user_id (FK)   │
│ rating_overall │
│ rating_food    │
│ rating_service │
│ rating_value   │
│ review_text    │
│ would_recommend│
│ status         │
│ created_at     │
└─────────────────┘

┌─────────────────┐
│  Notifications  │
├─────────────────┤
│ id (PK)        │
│ user_id (FK)   │
│ type           │
│ title          │
│ message        │
│ link           │
│ is_read        │
│ created_at     │
└─────────────────┘
```

---

### 3.2 Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'consumer', -- consumer, vendor, admin
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, banned
  profile_picture_url TEXT,
  default_location TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

#### Vendors Table
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100), -- individual, company
  owner_name VARCHAR(255),
  description TEXT,
  cuisine_types TEXT[], -- Array of cuisine types
  years_in_business INTEGER,
  service_areas TEXT[], -- Array of areas
  physical_address TEXT,
  logo_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, suspended
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  response_time_avg INTEGER, -- in minutes
  operating_hours JSONB, -- {monday: {open: "09:00", close: "18:00"}, ...}
  bank_details JSONB, -- Encrypted bank info
  documents JSONB, -- Array of document URLs
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_rating ON vendors(rating_avg DESC);
CREATE INDEX idx_vendors_cuisine_types ON vendors USING GIN(cuisine_types);
```

#### Packages Table
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  package_type VARCHAR(100), -- buffet, plated, family_style, etc.
  price_type VARCHAR(50) NOT NULL, -- per_person, fixed
  base_price DECIMAL(10,2) NOT NULL,
  min_guests INTEGER,
  max_guests INTEGER,
  setup_fee DECIMAL(10,2) DEFAULT 0,
  service_charge_percent DECIMAL(5,2) DEFAULT 0,
  image_url TEXT,
  dietary_tags TEXT[], -- vegetarian, vegan, halal, etc.
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_packages_vendor_id ON packages(vendor_id);
CREATE INDEX idx_packages_is_active ON packages(is_active);
```

#### Package Items Table
```sql
CREATE TABLE package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- appetizer, main, dessert, beverage
  dietary_tags TEXT[],
  allergen_warnings TEXT[],
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_package_items_package_id ON package_items(package_id);
```

#### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- birthday, corporate, wedding, etc.
  date DATE NOT NULL,
  time_start TIME,
  time_end TIME,
  guest_count INTEGER NOT NULL,
  location TEXT NOT NULL,
  venue_type VARCHAR(100), -- home, external
  venue_name VARCHAR(255),
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  special_requirements TEXT,
  dietary_requirements TEXT[],
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed, cancelled
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
```

#### Guests Table
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  category VARCHAR(100), -- VIP, family, friends, colleagues
  dietary_preferences TEXT[],
  rsvp_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, declined
  plus_one_allowed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_event_id ON guests(event_id);
```

#### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL, -- e.g., GH-2024-001234
  user_id UUID NOT NULL REFERENCES users(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  event_id UUID NOT NULL REFERENCES events(id),
  package_id UUID NOT NULL REFERENCES packages(id),
  guest_count INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, in_preparation, delivered, completed, cancelled
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- unpaid, paid, refunded
  payment_method VARCHAR(50), -- card, bank_transfer, cash
  subtotal DECIMAL(10,2) NOT NULL,
  service_charges DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  special_requirements TEXT,
  vendor_notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
```

#### Booking Items Table (for customized packages)
```sql
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- package_item, addon, extra_service
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_items_booking_id ON booking_items(booking_id);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_food INTEGER CHECK (rating_food >= 1 AND rating_food <= 5),
  rating_service INTEGER CHECK (rating_service >= 1 AND rating_service <= 5),
  rating_punctuality INTEGER CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
  rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
  review_text TEXT,
  would_recommend BOOLEAN,
  images TEXT[], -- Array of image URLs
  status VARCHAR(50) DEFAULT 'published', -- published, flagged, removed
  vendor_response TEXT,
  vendor_response_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating_overall DESC);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- booking_update, message, review, system
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB, -- Additional data
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

#### Messages Table (for vendor-consumer communication)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

#### Vendor Availability Table
```sql
CREATE TABLE vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, date)
);

CREATE INDEX idx_vendor_availability_vendor_date ON vendor_availability(vendor_id, date);
```

---

## 4. API Design

### 4.1 API Architecture

**Style:** RESTful API  
**Format:** JSON  
**Authentication:** JWT (JSON Web Tokens)  
**Base URL:** `https://api.gatherly.com/v1`

---

### 4.2 Authentication Flow

```
1. User submits login credentials
   POST /auth/login
   
2. Server validates and returns JWT
   Response: { token, refreshToken, user }
   
3. Client stores JWT (httpOnly cookie or localStorage)

4. Subsequent requests include JWT in header
   Authorization: Bearer <token>
   
5. Server validates JWT on each request
   Middleware: verifyToken()
```

---

### 4.3 API Endpoints

#### Authentication Endpoints

```
POST   /auth/register          # Consumer registration
POST   /auth/login             # User login
POST   /auth/logout            # User logout
POST   /auth/verify-otp        # Verify OTP
POST   /auth/resend-otp        # Resend OTP
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
POST   /auth/refresh-token     # Refresh JWT token
GET    /auth/me                # Get current user info
```

#### User Endpoints

```
GET    /users/:id              # Get user profile
PUT    /users/:id              # Update user profile
DELETE /users/:id              # Delete user account
PUT    /users/:id/password     # Change password
POST   /users/:id/avatar       # Upload profile picture
```

#### Vendor Endpoints

```
POST   /vendors/register       # Vendor application
GET    /vendors                # List all vendors (with filters)
GET    /vendors/:id            # Get vendor details
PUT    /vendors/:id            # Update vendor profile
POST   /vendors/:id/gallery    # Upload gallery images
DELETE /vendors/:id/gallery/:imageId  # Delete gallery image
GET    /vendors/:id/packages   # Get vendor packages
GET    /vendors/:id/reviews    # Get vendor reviews
GET    /vendors/:id/availability  # Get vendor availability
PUT    /vendors/:id/availability  # Update availability
```

#### Package Endpoints

```
POST   /packages               # Create package (vendor)
GET    /packages/:id           # Get package details
PUT    /packages/:id           # Update package
DELETE /packages/:id           # Delete package
POST   /packages/:id/items     # Add item to package
PUT    /packages/:id/items/:itemId  # Update package item
DELETE /packages/:id/items/:itemId  # Delete package item
```

#### Event Endpoints

```
POST   /events                 # Create event
GET    /events                 # List user's events
GET    /events/:id             # Get event details
PUT    /events/:id             # Update event
DELETE /events/:id             # Delete event
GET    /events/:id/guests      # Get event guest list
POST   /events/:id/guests      # Add guest
PUT    /events/:id/guests/:guestId  # Update guest
DELETE /events/:id/guests/:guestId  # Delete guest
POST   /events/:id/guests/import    # Import guests from CSV
POST   /events/:id/guests/share     # Share event details with guests
```

#### Booking Endpoints

```
POST   /bookings               # Create booking request
GET    /bookings               # List bookings (with filters)
GET    /bookings/:id           # Get booking details
PUT    /bookings/:id           # Update booking
PUT    /bookings/:id/status    # Update booking status (vendor)
POST   /bookings/:id/accept    # Accept booking (vendor)
POST   /bookings/:id/decline   # Decline booking (vendor)
POST   /bookings/:id/propose-alternative  # Propose alternative quote (vendor)
DELETE /bookings/:id           # Cancel booking
POST   /bookings/:id/payment   # Process payment (dummy)
GET    /bookings/:id/receipt   # Get booking receipt
```

#### Review Endpoints

```
POST   /reviews                # Create review
GET    /reviews                # List reviews (with filters)
GET    /reviews/:id            # Get review details
PUT    /reviews/:id            # Update review
DELETE /reviews/:id            # Delete review
POST   /reviews/:id/response   # Vendor response to review
POST   /reviews/:id/flag       # Flag review as inappropriate
```

#### Notification Endpoints

```
GET    /notifications          # List user notifications
GET    /notifications/:id      # Get notification details
PUT    /notifications/:id/read # Mark notification as read
PUT    /notifications/read-all # Mark all as read
DELETE /notifications/:id      # Delete notification
```

#### Message Endpoints

```
POST   /messages               # Send message
GET    /messages               # List conversations
GET    /messages/conversation/:bookingId  # Get messages for booking
PUT    /messages/:id/read      # Mark message as read
```

#### Admin Endpoints

```
GET    /admin/dashboard        # Admin dashboard stats
GET    /admin/vendors          # List all vendors
GET    /admin/vendors/:id      # Get vendor application
PUT    /admin/vendors/:id/approve    # Approve vendor
PUT    /admin/vendors/:id/reject     # Reject vendor
PUT    /admin/vendors/:id/suspend    # Suspend vendor
GET    /admin/users            # List all users
GET    /admin/users/:id        # Get user details
PUT    /admin/users/:id/suspend      # Suspend user
PUT    /admin/users/:id/ban          # Ban user
GET    /admin/bookings         # List all bookings
GET    /admin/reviews/flagged  # List flagged reviews
PUT    /admin/reviews/:id/approve    # Approve review
PUT    /admin/reviews/:id/remove     # Remove review
GET    /admin/analytics        # Platform analytics
```

#### Utility Endpoints

```
POST   /upload                 # Upload file/image
GET    /search                 # Global search
GET    /autocomplete/location  # Location autocomplete (Google Maps)
```

---

### 4.4 Request/Response Examples

#### Example: Create Booking

**Request:**
```http
POST /bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "vendor_id": "660e8400-e29b-41d4-a716-446655440001",
  "package_id": "770e8400-e29b-41d4-a716-446655440002",
  "guest_count": 50,
  "special_requirements": "No nuts please",
  "subtotal": 2500.00,
  "service_charges": 250.00,
  "total_amount": 2750.00
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Booking request created successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "booking_reference": "GH-2024-001234",
    "status": "pending",
    "total_amount": 2750.00,
    "created_at": "2024-02-15T10:30:00Z"
  }
}
```

---

### 4.5 Error Handling

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - No permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## 5. Security

### 5.1 Authentication & Authorization

```
- JWT tokens with expiration (15 minutes for access token)
- Refresh tokens (7 days)
- HttpOnly cookies for web
- Password hashing with bcrypt (salt rounds: 10)
- Role-based access control (RBAC)
- OTP verification for sensitive actions
```

### 5.2 API Security

```
- HTTPS only (TLS 1.3)
- CORS configuration (whitelist domains)
- Rate limiting (100 requests/minute per IP)
- Request size limits (10MB max)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF tokens for state-changing operations
```

### 5.3 Data Security

```
- Encrypted sensitive data at rest (bank details)
- PII (Personal Identifiable Information) protection
- Secure file upload (type validation, virus scanning)
- Database backups (daily automated)
- Access logs and audit trails
```

---

## 6. Performance Optimization

### 6.1 Frontend Optimization

```
- Code splitting (lazy loading routes)
- Image optimization (WebP format, responsive images)
- CDN for static assets
- Service worker for caching (future)
- Bundle size optimization (<200KB initial)
- Lighthouse score target: 90+
```

### 6.2 Backend Optimization

```
- Database indexing on frequently queried fields
- Connection pooling
- Query optimization (avoid N+1 queries)
- API response caching (Redis)
- Pagination for large datasets
- Background jobs for heavy tasks (email sending)
```

---

## 7. Deployment & Infrastructure

### 7.1 Hosting Options

#### Option A: All-in-one Platform (Easiest for MVP)
```
Platform: Vercel (Frontend) + Railway/Render (Backend + DB)

Advantages:
- Quick deployment
- Auto-scaling
- CI/CD built-in
- Cost-effective for MVP
```

#### Option B: AWS (Scalable)
```
Frontend: AWS Amplify or S3 + CloudFront
Backend: AWS Elastic Beanstalk or ECS
Database: AWS RDS (PostgreSQL)
Storage: AWS S3
```

#### Option C: DigitalOcean (Simple)
```
Frontend: DigitalOcean App Platform
Backend: DigitalOcean App Platform
Database: DigitalOcean Managed Database
Storage: DigitalOcean Spaces
```

---

### 7.2 CI/CD Pipeline

```
Version Control: GitHub
CI/CD: GitHub Actions

Pipeline Steps:
1. Code push to GitHub
2. Run tests (unit, integration)
3. Build frontend and backend
4. Deploy to staging environment
5. Run E2E tests
6. Manual approval
7. Deploy to production
```

**Example GitHub Actions Workflow:**
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up
```

---

### 7.3 Environment Configuration

```
Development: Local development
Staging: Pre-production testing
Production: Live environment

Environment Variables:
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- SENDGRID_API_KEY
- TWILIO_API_KEY
- GOOGLE_MAPS_API_KEY
- AWS_S3_BUCKET
- FRONTEND_URL
- BACKEND_URL
```

---

## 8. Monitoring & Logging

### 8.1 Application Monitoring

```
APM: New Relic or Sentry
- Error tracking
- Performance monitoring
- User session tracking
- Uptime monitoring
```

### 8.2 Logging

```
Backend Logging:
- Winston or Pino (Node.js)
- Log levels: error, warn, info, debug
- Centralized logging (e.g., Logtail, Papertrail)

Log Retention: 30 days
```

### 8.3 Metrics to Track

```
- API response times
- Error rates
- User registration rate
- Booking conversion rate
- Vendor response time
- Database query performance
- Server CPU/Memory usage
```

---

## 9. Testing Strategy

### 9.1 Frontend Testing

```
Unit Tests: Jest + React Testing Library
- Component rendering
- User interactions
- Form validation

E2E Tests: Playwright or Cypress
- User registration flow
- Booking flow
- Payment flow

Coverage Target: 70%+
```

### 9.2 Backend Testing

```
Unit Tests: Jest or Pytest
- Business logic functions
- Utility functions

Integration Tests:
- API endpoints
- Database operations
- Authentication flow

Load Testing: k6 or Artillery
- Simulate 100+ concurrent users
- API stress testing

Coverage Target: 80%+
```

---

## 10. Scalability Considerations

### 10.1 Horizontal Scaling

```
- Stateless API servers (can scale horizontally)
- Load balancer for traffic distribution
- Database read replicas for scaling reads
- CDN for global content delivery
```

### 10.2 Vertical Scaling

```
- Upgrade server resources as needed
- Database indexing and optimization
- Caching layer (Redis) to reduce DB load
```

### 10.3 Future Enhancements

```
Phase 2:
- Microservices architecture (if needed)
- Message queue (RabbitMQ, AWS SQS) for async tasks
- Elasticsearch for advanced search
- GraphQL API (optional)
- Kubernetes for container orchestration
```

---

## 11. Development Timeline Estimate

```
Phase 1: Setup & Core Backend (2 weeks)
- Project setup
- Database design
- Authentication system
- Core API endpoints

Phase 2: Consumer Frontend (3 weeks)
- UI components
- Vendor browsing
- Event creation
- Booking flow
- Guest management

Phase 3: Vendor Portal (2 weeks)
- Vendor dashboard
- Package management
- Booking management

Phase 4: Admin Console (1 week)
- Admin dashboard
- Vendor approval
- Platform monitoring

Phase 5: Integration & Testing (2 weeks)
- API integration
- End-to-end testing
- Bug fixes
- Performance optimization

Phase 6: Deployment & Launch (1 week)
- Production deployment
- Documentation
- User acceptance testing

Total: ~11-12 weeks for MVP
```

---

## 12. Recommended Tech Stack Summary

**For Fastest MVP Development:**

```
Frontend:
- Next.js 14 + TypeScript
- Tailwind CSS
- Redux Toolkit
- React Hook Form

Backend:
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL 14+

Hosting:
- Vercel (Frontend)
- Railway (Backend + Database)
- Cloudflare R2 (File Storage)

Third-party:
- SendGrid (Email)
- Google Maps API
- Sentry (Error tracking)
```

---

**Document Owner:** Gatherly Product Team  
**Last Updated:** February 15, 2026