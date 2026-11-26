# juaija

juaija is a responsive campus resale marketplace prototype for finding, listing, saving and arranging handovers for pre-loved student items.

## Run locally

Open `index.html` in a modern browser. This is a static application with no build step or backend. Bootstrap and Bootstrap Icons load from jsDelivr, so an internet connection is needed for those external assets.

## Demo account

On a new browser profile, the sign-in page is shown with the demo account details prefilled. Select “Sign in” to enter the demo account.

- Username: `@zulhelmi`
- Email: `zulhelmi@juaija.my`
- Password: `juaija123`
- Location: `UiTM Pundana`

Account data, listings, favourites, orders, notifications, theme and language settings persist in that browser. The supplied offer-letter document is stored locally in IndexedDB when used; the remaining application state uses `localStorage`.

## Included features

- Dashboard with marketplace metrics and an activity chart built from listing, order and saved-item events.
- Marketplace search, category and verified-seller filters, sorting, 20/40-item pagination, and responsive grid/list views.
- Listing creation and editing with validation, meetup/postage choice, image uploads and local persistence.
- Product detail galleries with relevant images, favourite items, seller details, notification inbox, profile editor and settings.
- Orders with delivery details, pickup/postage address, WhatsApp contact number, status filters and an order history view.
- UiTM student verification with a 10-digit student number, offer letter (PDF/JPG/PNG up to 5 MB), study-period details and a local expiry check.
- Bahasa Melayu and English, light and dark themes, desktop sidebar navigation, and a mobile navigation bar with a floating sell action.

## Technical notes

- HTML, CSS and JavaScript single-page interface.
- Bootstrap 5.3.9 utilities, Bootstrap Icons and inline SVG charts.
- No server authentication, shared database or real payment processing is included; juaija Pay is a local prototype balance only.

## Development checks

Run `node --test tests/*.test.cjs` to exercise order flows, filters, pagination, verification validation and DOM wiring. These tests do not replace visual browser checks.
