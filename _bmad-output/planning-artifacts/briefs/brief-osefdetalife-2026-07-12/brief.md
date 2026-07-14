---
title: "Product Brief: [TBD]"
status: approved
created: 2026-07-12
updated: 2026-07-12
---

# Product Brief: [TBD]

## Executive Summary

[TBD] is a white-label, embeddable booking widget that lets restaurants accept table reservations directly on their own website — fully branded to match their identity. Restaurants get a simple dashboard to configure their availability and view incoming bookings, while diners get a seamless, fast booking experience that feels native to the restaurant's site.

The product fills a clear gap in the UK restaurant market: existing solutions are either too complex (full floor plan editors designed for large operators) or too basic (simple capacity counters that don't reflect real table configurations). Meanwhile, per-cover commission models from legacy platforms like OpenTable are pushing price-sensitive independent restaurants toward flat-fee alternatives. [TBD] combines white-label control, table-group configuration, and a monthly subscription — giving small restaurants the professionalism of enterprise tools without the complexity or cost.

This is a personal learning project built by a solo developer with Angular + Firebase, designed to grow organically as a side project. The MVP targets restaurants with ~50 covers and a single location, with a clear path toward AI-assisted booking management and third-party integrations (Google Reserve, POS sync) in future releases.

## The Problem

**For restaurants:** Accepting online reservations today means choosing between expensive per-cover platforms (OpenTable at £1-2 per cover), overly complex systems designed for large operators (SevenRooms, ResDiary with full floor plan editors), or basic capacity tools that don't reflect how their dining room actually works. Most small restaurants — the bistro with 3 four-tops and 6 two-tops — don't need a floor plan editor. They need to register their table configuration and let guests book into it. And they want to do it on their own website, under their own brand, not on a third-party marketplace.

**For diners:** The booking experience varies wildly. Some restaurants force you through a third-party platform with its own UI and account creation. Others have no online booking at all — you have to call. When a widget exists on the restaurant's site, it often feels generic and disconnected from the restaurant's brand.

**The cost of the status quo:** Restaurants lose bookings to competitors with better digital experiences. They pay per-cover fees that eat into thin margins (average 4-5% pre-tax). And they surrender customer relationships to platforms that own the diner data.

## The Solution

An embeddable booking widget that restaurants configure and deploy on their own website. The widget reflects the restaurant's brand (colors, logo, custom fields) and handles the booking flow end-to-end: selecting date, time, party size, and submitting the reservation.

**Diner-facing (the widget):**
- Clean, fast booking flow embedded on the restaurant's website
- Date/time/party size selection
- One optional custom field (e.g., dietary requirements, occasion, special requests) — label set by restaurant
- Confirmation screen

**Restaurant-facing (the dashboard):**
- Settings: opening hours, table configuration (e.g., "3 × four-tops, 6 × two-tops"), white-label parameters (colors, custom field)
- Bookings view: read-only list of incoming reservations (date, time, party size, custom field)
- Simple, no-frills interface — designed for the restaurant owner, not a tech team

**Table model:** Table groups with capacity — not full table maps, not simple headcount. A restaurant registers how many tables of each size they have, and the system manages availability across those groups.

## What Makes This Different

1. **White-label by default:** The widget lives on the restaurant's website, looks like the restaurant's brand. No third-party UI, no marketplace branding, no account creation for diners.

2. **Table groups (not maps, not headcount):** The right level of complexity for small restaurants. Sophisticated enough to reflect real dining room configurations, simple enough to configure in 5 minutes.

3. **Flat monthly fee:** No per-cover commission. Predictable cost that doesn't penalize the restaurant for being busy. Aligned with the restaurant's success, not their volume.

4. **Great UX as the differentiator:** In a market of clunky legacy interfaces, a beautifully designed, fast booking experience is the moat. This is where personal learning and craftsmanship shine.

## Who This Serves

**Primary: Restaurant owners/managers**
- Small independent restaurants or small city chains (1-4 locations)
- ~50 covers
- Tech-comfortable but not tech-first — they want something that works without a setup guide
- Price-sensitive, currently paying for OpenTable or using manual processes
- Want to own their customer relationships and brand

**Secondary: Diners**
- Guests who want a quick, frictionless booking experience
- Expect to book on the restaurant's website without creating accounts or switching platforms
- May provide additional information (dietary needs, occasion) if the flow is simple

## Success Criteria

**User success:**
- Restaurant can configure and deploy the widget in under 30 minutes
- Diner completes a booking in under 60 seconds
- Restaurant owner checks daily bookings in the dashboard without training

**Business objectives:**
- First paying customer within 3 months of MVP completion
- 10 paying restaurants within 6 months
- Monthly churn below 5% (restaurants keep using it)

## Scope

### In for MVP
- Embeddable booking widget (date, time, party size, one custom text field)
- Restaurant dashboard: settings (hours, table config, white-label)
- Restaurant dashboard: read-only booking list
- Flat monthly subscription (no payment processing in MVP — manual or Stripe link)

### Explicitly out for MVP
- Edit/delete bookings from dashboard
- No-show management or deposits
- Email/SMS confirmations or reminders
- POS integration
- Google Reserve or third-party channel sync
- AI features
- Multi-location management
- Mobile app

## Vision

If this works, the natural progression is:

- **Near-term:** Edit bookings, email confirmations, basic no-show tracking
- **Mid-term:** Google Reserve integration, POS sync (Toast, Lightspeed), voice AI for phone bookings
- **Long-term:** AI-assisted booking management (predict no-shows, suggest optimal seating, forecast demand), cross-channel loyalty, multi-location dashboard

The vision is a platform that starts simple and grows with the restaurant — from a booking widget to a complete guest management layer, always flat-fee, always white-label.
