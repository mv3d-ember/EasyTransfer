# Alex Rivera Photography

A static photography portfolio site: a hero landing page, a filterable gallery organized by
category, an about page, and a contact page. No backend, no build step — just HTML, CSS, and JS,
deployable straight to GitHub Pages.

## Structure

```
index.html          Home page (hero + featured work)
gallery.html         Full gallery with category filter tabs + lightbox
about.html            Bio, stats, equipment
contact.html          Contact info + form
css/style.css          All styling
js/photos-data.js      The list of photos (edit this to add/remove/reorder photos)
js/main.js              Shared behavior: header scroll state, mobile nav, grid render, lightbox
images/placeholders/    Placeholder photo tiles (SVG) — swap these for real photos
images/hero.svg          Placeholder hero background
images/profile.svg       Placeholder profile photo for the about page
```

## Customizing

**Your name and tagline** — currently "Alex Rivera" everywhere. Find/replace `Alex Rivera` across
the `.html` files, and edit the tagline text in the `.hero-content` block of `index.html`.

**Adding your real photos**
1. Drop your image files into `images/` (e.g. `images/photos/sunset.jpg`).
2. Open `js/photos-data.js` and edit the `PHOTOS` array — each entry needs an `id`, a `category`
   (must match one of `portraits`, `landscapes`, `street`, `architecture`, or a new category you
   add), a `title`, and a `src` pointing at your image file.
3. To add a new category, also add it to `CATEGORY_LABELS` in the same file, and add a matching
   filter button in `gallery.html`'s `#filter-tabs`.
4. `FEATURED_IDS` in `photos-data.js` controls which 6 photos show on the home page — update it to
   point at your best shots.
5. Delete the files in `images/placeholders/` (and `images/hero.svg`, `images/profile.svg`) once
   you've swapped them out, or keep them as a fallback.

**Bio, stats, equipment** — edit directly in `about.html`.

**Contact form** — the form in `contact.html` currently posts to a placeholder Formspree endpoint
and won't deliver anywhere until you connect it:
1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Create a new form; Formspree gives you a form ID.
3. In `contact.html`, replace `YOUR_FORM_ID` in the `<form action="https://formspree.io/f/YOUR_FORM_ID">`
   line with your real ID, and delete the `.form-note` paragraph below the submit button.

Alternatively, just remove the `<form>` entirely and rely on the email link — no setup required.

## Running locally

No install needed — any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed local URL.

## Deploying to GitHub Pages

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick the branch this code is on, folder **/ (root)**, then **Save**.
5. GitHub gives you a URL like `https://<username>.github.io/<repo>/` within a minute or two.

Every push to that branch will redeploy automatically — no further setup needed since this is a
plain static site.
