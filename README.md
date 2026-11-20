# juaija

juaija is a responsive campus resale marketplace prototype. Students can find affordable pre-loved items, publish listings, save items, and contact sellers through a simulated handoff flow.

## Run locally

Open `index.html` in Google Chrome. The app is a static site and does not need a build step or database. Bootstrap 5.3 is loaded from jsDelivr; an internet connection is needed for Bootstrap styles and Bootstrap Icons.

## Demo access

The demo account is saved in the browser and is signed in automatically on first launch.

- Username: `alyarahman`
- Email: `alya@juaija.my`
- Password: `juaija123`

The sign-in page also includes a one-click demo login. New accounts use a unique username, email and password. Account, listing, favorite, notification, language, and theme changes persist in `localStorage` for that browser.

## Features

- Home dashboard with a multi-source marketplace activity chart (listings, orders, and saves), category activity, marketplace summary metrics, and featured listings.
- Marketplace search, category filters, sorting, 20/40 item page size, pagination, and grid/list views.
- Listing creation with required-field validation, price checks, pickup location, optional image upload, and local persistence.
- Listing detail view, saved items, seller profile, notification inbox, profile editing, and settings.
- Bahasa Melayu default with English option, plus light and dark appearances.
- Responsive navigation, page metadata, and a structured footer.

## Implementation

- HTML, CSS and JavaScript (single-page navigation with browser storage)
- Bootstrap 5.3.9 utilities and toast styling
- Inline SVG charts, Bootstrap Icons, no backend required

## Orders and student verification

- Orders retain their ID, item name and agreed price. The seller accepts or declines a pending order; acceptance reserves the item. Only the buyer can confirm receipt and complete an accepted order. Cancellation releases the reservation. Completion closes competing pending requests for the same item.
- The Orders page supports status and purchase/sale filters, name/ID search, sorting and 10/20/50 rows per page.
- Student verification requires a 10-digit UiTM student number, an offer letter (PDF/JPG/PNG, up to 5 MB), the intake and duration, and confirmation of active student status. The form reads PDF text or performs OCR locally in the browser, then lets the student check/correct the extracted fields. If extraction is unavailable, the student enters the details from the uploaded letter for admin review.
- PDF.js 4.10.38 and Tesseract.js 5.1.1 are loaded from jsDelivr on demand. OCR language assets require internet access. Documents are not sent to an OCR service. The first six PDF pages are read.
- Offer letters are stored in IndexedDB; application metadata remains in localStorage. Successful submission activates a provisional badge. Admin approval retains it; revocation removes it. Expiry is checked on startup, on visibility changes and every minute while the page is open. Badge rendering also checks the current date directly.
- Each semester is six months. Session 1 defaults to October of the academic year's first year; Session 2 defaults to March of the following year. The starting month can be corrected to match the letter. The badge expires at midnight Malaysia time following the final study month.
- The requested preset for `@alyarahman` is Session 2 2025/2026, six semesters: 1 March 2026 through 28 February 2029. No uploaded letter is invented; the preset displays “Not uploaded yet” until a real letter is submitted.

### Separate local admin account

After refreshing the app, sign out and sign in with:

- Username: `adminjuaija`
- Password: `JuaijaAdmin!2026`

Open **Student verification** to see the review queue. View an uploaded letter before approving it. Revocation requires a reason. A previously revoked application cannot reactivate its own badge by resubmitting. If the admin username already belongs to another account, initialization adds a numeric suffix rather than granting that existing account admin access.

This remains a browser-local application: accounts, credentials, roles and review decisions are stored on the same browser/device. A deployed service needs server authentication, authorization, shared document storage and scheduled expiry; these client-side role checks are not a security boundary. No payments are processed by the order flow.

### Checks

Run `node --test tests/*.test.cjs` for order transitions and permissions, filters/pagination, verification eligibility and expiry, admin decisions, document parsing/validation, and DOM wiring checks. The DOM checks use fixtures from the saved HTML and do not claim to verify browser rendering or live OCR accuracy.

## Reset

Use **Settings → Reset demo data** to restore the starter account and sample listings in the current browser.
