# FixMyCampus public landing page

## Scope
- Replace the placeholder home page with a redirect from `/` to `/dashboard`.
- Build the complete public product landing page at `/dashboard` using the requested dark charcoal and green/teal visual system.
- Keep `/login` and `/register` as the destinations for account actions; do not introduce or change authentication logic.

## Page composition
- Add a compact responsive navigation bar with brand, section links, theme control, login, account creation, and a mobile menu.
- Build the hero with the supplied messaging, clear calls to action, trust points, and a lightweight live-ticket workflow visual.
- Present the scattered-channel problem, its consequences, and the four-step report-to-resolution workflow as one compact visual story.
- Create an editorial features section with centralized complaint management as the lead feature and five concise supporting capabilities.
- Add two equal demo-access panels with copyable credentials and login actions.
- Finish with a restrained call to action and compact footer.

## Technical details
- Use TanStack Router routes and hash links only for sections within `/dashboard`.
- Define all colors, typography, surfaces, and interaction states as semantic tokens in the global design system.
- Use the existing button component and Lucide icons; add no dependencies.
- Add route-specific metadata for `/dashboard`, `/login`, and `/register` if those routes need to be created to keep requested destinations valid.
- Verify the page at desktop and mobile widths, including menu behavior, theme control, copying credentials, navigation, overflow, and current build health.

## Important constraint
The checked project currently contains only the template `/` route; no existing `/dashboard`, `/login`, `/register`, student portal, admin portal, or authentication code is present. The implementation will therefore avoid inventing authentication or dashboard behavior and will keep the requested account URLs available as simple destination pages unless those existing files appear before implementation.
