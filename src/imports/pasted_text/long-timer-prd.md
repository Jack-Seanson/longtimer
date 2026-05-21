# Long Timer: Product Requirements Document
**Version:** 1.1  
**Date:** May 20, 2026  
**Author:** Sean Jacobs  
**Status:** Draft

---

## 1. Product Overview

### 1.1 Summary
Long Timer is a minimalist web application that lets users create and share countdown timers for meaningful long-term events — paying off a mortgage, finishing student loans, a long-awaited vacation, or any milestone months or years away. The app requires no account, no login, and no backend persistence. All timer data is encoded directly in the URL, making every timer fully self-contained and shareable.

### 1.2 Inspiration
Long Timer is inspired by Josh Worth's *If the Moon Were Only 1 Pixel* ([joshworth.com](https://joshworth.com/dev/pixelspace/pixelspace_solarsystem.html)), which uses physical scroll distance to give users a felt sense of scale. That site also demonstrates a key scroll interaction pattern: the scroll accelerates as you move through vast distances, then decelerates as you approach a destination — preserving the visceral sense of scale while still arriving at a meaningful landmark. Long Timer applies both of these ideas to time.

### 1.3 Product Goals
- Make abstract long-term time feel tangible and real through immersive scroll-based visualization
- Enable effortless timer creation and sharing with zero friction — no login, no account, no backend
- Deliver a calm, focused, beautiful experience free of noise and clutter

---

## 2. Target Users
- Individuals tracking major financial milestones (loan payoff, mortgage freedom)
- Couples or partners counting down to a shared event together
- People counting down to life events (retirement, a move, a reunion, a trip)
- Anyone who wants to share a "we're in this together" countdown with a partner or friend

---

## 3. User Flows

### 3.1 Flow A — Create a Timer
1. User lands on the **Create Page** (the home/root route)
2. User enters a **timer name** (e.g., "Mortgage Freedom Day")
3. User optionally enters a **short description** (e.g., "The day we finally own our home.")
4. User chooses one of two input methods:
   - **Option A: Pick an end date & time** — date picker + time picker + timezone selector
   - **Option B: Set a duration** — input fields for years, months, days, hours
5. User taps/clicks **"Start Timer"**
6. App generates a shareable URL and navigates the user to the **Timer View Page**

### 3.2 Flow B — View a Saved Timer
1. User opens a previously saved or shared URL
2. App decodes timer parameters from the URL
3. App renders the **Timer View Page**, showing current live progress

### 3.3 Flow C — Share a Timer
1. From the Timer View, user taps/clicks the **"Share"** button prominently displayed at the top of the page
2. The full URL (with encoded timer data) is copied to clipboard
3. Confirmation feedback is shown (e.g., "Link copied!")
4. User shares via any channel (text, email, etc.)

---

## 4. Feature Requirements

### 4.1 Timer Creation

| # | Requirement | Priority |
|---|---|---|
| F1 | User can enter a custom timer name (max ~60 characters) | Must Have |
| F2 | User can enter an optional short description (max ~140 characters) | Must Have |
| F3 | User can set an end date and time via a date/time picker | Must Have |
| F4 | User can select a timezone for the end date/time | Must Have |
| F5 | User can alternatively set a duration (years / months / days / hours) | Must Have |
| F6 | App calculates and displays a preview of the end date/time before creating | Nice to Have |
| F7 | Timer creation form validates for past dates and empty required fields | Must Have |

### 4.2 URL Encoding & Sharing

| # | Requirement | Priority |
|---|---|---|
| F8 | All timer data (name, description, start time, end time, timezone) is encoded into the URL — no backend storage required | Must Have |
| F9 | URL encoding uses a compact, URL-safe format (e.g., base64 or query params) | Must Have |
| F10 | Shareable URL can be opened by anyone, anywhere, without logging in | Must Have |
| F11 | A prominent **"Share"** button at the top of the Timer View copies the full URL to clipboard | Must Have |
| F12 | Clipboard copy provides brief visual confirmation feedback | Must Have |
| F13 | URL decoding is resilient — graceful error state if URL is malformed | Must Have |

### 4.3 Timer View — Core Display

| # | Requirement | Priority |
|---|---|---|
| F14 | Timer view displays the **Timer Name** prominently at the top | Must Have |
| F15 | Timer view displays the optional **description** if one was provided | Must Have |
| F16 | Timer view displays the live **countdown** (days / hours / minutes / seconds) | Must Have |
| F17 | Timer view displays the **end date/time** in a human-readable format | Must Have |
| F18 | Countdown updates in real-time — at minimum, once per second | Must Have |
| F19 | When the timer reaches zero, a distinct **completion state** is shown | Must Have |

### 4.4 The Scroll Bar — "Long Timer" Mode (Default)

| # | Requirement | Priority |
|---|---|---|
| F20 | A vertical progress bar is rendered at a scale of **1 pixel = 1 second** of total timer duration | Must Have |
| F21 | The bar is **center-aligned** on the page and is a comfortable, readable width — not full-width on mobile | Must Have |
| F22 | The bar progresses **top to bottom**: top = timer start, bottom = timer end | Must Have |
| F23 | The **elapsed portion** and **remaining portion** are visually distinct — it should be immediately clear what is complete and what remains | Must Have |
| F24 | The **"You are here" indicator** marks the current position (the boundary between elapsed and remaining) — minimal, unobtrusive, but clear | Must Have |
| F25 | **Scale markers** appear along the bar at hour, day, month, and year intervals — subtle labels that help the user orient while scrolling | Must Have |
| F26 | Two **sticky floating navigation buttons** travel with the user as they scroll: **(1) Back to Top** and **(2) Jump to Now** | Must Have |
| F27 | "Jump to Now" triggers a **very rapid scroll** to the current elapsed position — fast enough to feel dramatic, but decelerating as it approaches the destination to preserve the sense of the distance traveled | Must Have |
| F28 | The scroll acceleration/deceleration behavior mimics the *If the Moon Were Only 1 Pixel* model: rapid acceleration through empty time, decelerating dramatically as it approaches "now" | Must Have |
| F29 | The page may be astronomically tall (millions of pixels) — this is intentional | Must Have |

### 4.5 The Scroll Bar — "Short Timer" (Compact) Mode

| # | Requirement | Priority |
|---|---|---|
| F30 | A **toggle button** allows the user to switch between Long Timer mode and Compact mode | Must Have |
| F31 | Compact mode scales the entire progress bar to fit comfortably within the **viewport height** | Must Have |
| F32 | Compact mode shows the same elapsed/remaining visual distinction and "You are here" marker | Must Have |
| F33 | Switching between modes is smooth and animated | Nice to Have |
| F34 | The user's toggle preference is preserved during their session | Nice to Have |

---

## 5. Design Principles & Aesthetic Direction

### 5.1 Core Aesthetic: Calm Minimalism
- The app should feel like a quiet, focused object — not a productivity tool or notification machine
- Typography-first design: the timer name, description, and countdown are the visual heroes
- Generous whitespace throughout
- Muted, neutral color palette (whites, near-blacks, soft grays) with a single intentional accent for the progress indicator
- No ads, no upsells, no clutter

### 5.2 Typography
- Single typeface — a clean, elegant sans-serif (e.g., Inter, DM Sans, or similar)
- Countdown displayed in a large, prominent font using **tabular/monospaced numerals** to prevent layout jitter as digits change
- Timer name treated as a headline; description as a secondary caption

### 5.3 Progress Bar Design Direction
- The bar should be center-aligned and a comfortable, proportionate width (not full-bleed on mobile; perhaps 60–80% of viewport width)
- The visual treatment of elapsed vs. remaining is open to the designer — consider approaches like filled/unfilled, muted/vivid, light/dark contrast, or subtle gradient
- Scale markers (hour, day, month, year) should feel like quiet navigational aids — not loud UI elements
- The "You are here" indicator can include a minimal label, but should feel calm and unobtrusive

### 5.4 Floating Navigation Buttons
- The two sticky buttons ("Back to Top" / "Jump to Now") should float over the scroll bar in a fixed position
- They should feel lightweight — perhaps small pills or icon buttons — and not obscure the progress bar
- Their placement should be consistent on both mobile and desktop
- They should have sufficient tap target size for comfortable mobile use

### 5.5 Motion & Interaction
- The "Jump to Now" scroll behavior should feel dramatic and fast, decelerating meaningfully near the destination to reinforce scale
- All transitions should feel deliberate and unhurried in general — nothing jarring outside of the intentional scroll animations
- Toggle between long/short modes should have a satisfying transition

### 5.6 Responsive Design
- Fully functional on **mobile and desktop**
- The scroll bar visualization is especially well-suited to mobile (natural vertical scroll)
- The creation form should be easy to complete on a phone keyboard
- Floating buttons should be easily tappable on mobile (sufficient tap target size)

---

## 6. Pages / Screens

### Page 1: Create (Home / Root Route)
- App name / wordmark: **"Long Timer"**
- Brief tagline or descriptor
- Timer name input (required)
- Timer description input (optional)
- Input method toggle: **"Pick a Date"** vs. **"Set a Duration"**
  - Date mode: date picker + time picker + timezone selector
  - Duration mode: fields for years, months, days, hours
- Optional: end date/time preview as the user fills in fields
- "Start Timer" CTA

### Page 2: Timer View
**Top of page:**
- Timer name (headline)
- Timer description (if provided)
- Live countdown (Days / Hours / Minutes / Seconds)
- End date in human-readable form
- **"Share" button** — copies URL to clipboard, shows brief confirmation

**Below / Main content:**
- Mode toggle: **"Long View"** ↔ **"Compact View"**
- Vertical progress bar with scale markers
- Two sticky floating buttons (always visible while scrolling):
  - **↑ Top** — snaps back to the top of the page
  - **⊙ Now** — rapid animated scroll to current elapsed position

### Page 3: Error State
- Graceful message if URL is malformed or timer data is missing
- Link to create a new timer

### Page 4: Timer Complete State
- Celebratory — but still minimal and calm
- Shows the timer name and description
- Marks the total elapsed duration
- Link to create a new timer

---

## 7. Technical Notes *(for designer context — not design decisions)*

- **URL Structure:** Timer data (name, description, start timestamp, end timestamp, timezone) will be encoded in the URL using a compact, URL-safe encoding scheme (e.g., base64 + query parameters). No database, server, or login is required.
- **Frontend Only:** This is a fully client-side application. No server-side processing is needed for timer display.
- **Scroll Bar Height:** In Long Timer mode, a 10-year timer generates a bar ~315,000,000 pixels tall. Browsers can handle very tall scroll contexts; performance optimizations (e.g., virtual rendering or CSS transforms) may be applied during development.
- **Real-Time Countdown:** Computed in JavaScript from the encoded end timestamp and updated every second.
- **Scroll Animation:** "Jump to Now" will use a custom easing function that mirrors the *If the Moon Were Only 1 Pixel* behavior — rapid acceleration through empty time, decelerating dramatically as it approaches the current position.

---

## 8. Out of Scope (v1)
- User accounts or login
- Push notifications, email reminders, or alerts
- Multiple timers on one screen
- Timer editing after creation (users create a new URL instead)
- Social sharing integrations (share = copy link only)
- Dark mode *(unless designer wants to explore)*

---

## 9. Open Questions for Designer
1. What is the right visual treatment for the elapsed vs. remaining portions of the bar? (Consider: filled/empty, color contrast, opacity, gradient)
2. How should the scale markers (hour/day/month/year) be displayed — text labels beside the bar, tick marks, or a combination?
3. What is the right size and style for the floating "Top" and "Now" navigation buttons so they don't obstruct the bar on mobile?
4. Should the "You are here" indicator include any text label, or is a visual marker alone sufficient?
5. What is the ideal visual treatment for the timer completion state — celebratory but still minimalist?
6. Should the toggle between Long View and Compact View be a button, a switch/toggle, or a tab?
