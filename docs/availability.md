# Availability and Blocked Dates

## Blocked dates vs booking requests

When a vendor blocks a date in the Availability calendar, that date is stored in `Vendor.availability.blockedDates`. This is used for the vendor's own planning (e.g. vacation, personal days, other commitments).

**Blocked dates do not prevent consumers from submitting booking requests.** The booking creation API does not check blocked dates. A consumer can request any date, including dates the vendor has blocked.

### Flow

1. **Vendor** blocks a date → stored in `Vendor.availability.blockedDates`
2. **Consumer** submits a booking request for that date → request is created as usual (status: pending)
3. **Vendor** receives the request and can accept or decline manually

### Rationale

Blocked dates are for vendor planning only. Vendors must manually accept or decline each booking request. This gives vendors full control over their schedule while keeping the consumer booking flow simple.
