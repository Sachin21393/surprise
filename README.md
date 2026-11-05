## Updated editor

Use **Add memory → choose photo → paste 10–15 lines into the one letter box → Save memory → View my book**. Extra settings are under More options. Your saved memories now appear in the reader on this device; open reader tabs refresh after saving. Publish a website ZIP to update the book on other devices. Your existing browser draft is preserved if you replace files at the same website address. Download a draft backup before updating your deployment.

# Happy Birthday Neemisha ♡

A complete, dependency-free birthday notebook PWA for GitHub Pages. The reader has a lavender cover, text on the left, a photo on the right, 10–15 consistent text lines, paw page numbers, 3D page turns, touch/mouse gestures, and an “I love you” voice on every committed turn. No navigation buttons or sound toggle appear in the reader.

## Deploy the included sample

1. Extract this project ZIP.
2. Create a GitHub repository, such as `neemisha-birthday`.
3. Upload the files **inside** this folder to the repository root. `index.html` and `admin.html` must be at the top level, alongside `assets/` and `data/`. Include `.nojekyll` when using Git; no build step is needed.
4. In the repository, open **Settings → Pages**. Under Build and deployment, select **Deploy from a branch**, choose **main**, choose **/ (root)**, and Save.
5. Wait for deployment. Open `https://YOUR-USERNAME.github.io/neemisha-birthday/` using the URL shown in Pages settings. It can take up to ten minutes to publish.
6. The source includes four sample memories, with illustrated photo placeholders. Replace them through the studio before sharing the birthday surprise.

GitHub instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Add your photos and 10–15-line letters

1. Open `https://YOUR-USERNAME.github.io/neemisha-birthday/admin.html`.
2. Add a memory, choose a JPEG, PNG or WebP photo, and fill in its title and **10–15 lines in one text box**. Paste your whole letter into the single box and press Enter between lines. There is no per-line character limit or width restriction. Use View my book to judge overflow and adjust your wording. Optional captions allow 48 characters; titles allow 24.
3. Click **Save memory**. Use Import photos for a batch, then complete each letter. The limit is 100 memories, each with two pages (up to 200 inside pages).
4. Reorder memories with the up/down buttons. Your book uses this order.
5. Use **View my book** after saving. The main book now shows complete saved memories on your own device automatically; an already open book tab refreshes after saving. Other visitors still read the published book. An incomplete memory will not appear until it has a photo and 10–15 valid lines. To explicitly inspect the public version, open `?published=1`.
6. Optional: choose an audio recording in the voice section. MP3 or M4A is recommended for mobile compatibility. Keep it short, ideally saying “I love you”; the size limit is 8 MB. The reader uses the recording instead of the device voice. Without a recording, English speech synthesis is used when available. Device speech may depend on installed voices and browser support; your uploaded recording is the reliable way to get the same voice on every phone.
7. Download a **backup** regularly. Browser drafts are stored with IndexedDB, on this device and this website address only. Clearing browser data or changing devices does not preserve them. Restore the backup to continue editing on another device. This is an editor backup, not a deployable website.
8. Click **Download website ZIP** once every memory is complete. This ZIP includes the entire website, optimized photos, book data, icons and your recording.
9. Extract the exported ZIP and upload **its contents** to the same GitHub repository, replacing matching files. Commit the update. The published reader will now show the new book on all phones.

**How the admin works:** this is a local editing studio, without a server or login. It cannot write directly to GitHub. Local changes become public updates only after you export and commit the site. Another visitor can edit their own local draft, but cannot change your deployed book through this admin screen. Accessing an installed PWA and a browser may use different storage on some platforms; use backups to move drafts.

**Publishing visibility:** normal GitHub Pages publishes the book and its media as public website files, even for many private-repository setups. Use photos and recordings you are comfortable sharing this way. This project does not provide private sharing or server-side authentication.

## Phone installation

- **iPhone/iPad:** open the site in Safari → Share → Add to Home Screen. Open the new icon.
- **Android:** open the site in Chrome → Install app (or Add to Home screen). There is also an Install button in the book.
- The manifest requests **landscape** by default. Browsers/phones differ in support; if automatic rotation is blocked, the portrait guide asks you to turn your phone sideways. Disable the phone's rotation lock if necessary. The book does not force a sideways CSS rotation.
- Your first tap/swipe enables voice playback. The website cannot override a muted phone, device volume or browser audio restrictions.
- Swipe/drag left for the next spread. A medium right swipe goes back. A long right swipe across **75% or more of the book width** closes the book. Starting near the left edge gives you enough room. At the first spread, going back naturally returns to the cover.
- Arrow keys also navigate on desktop. Touch and mouse use the same pointer-based gesture logic. Releasing an incomplete gesture restores the current page. Reduced-motion settings are respected.

The PWA needs HTTPS (GitHub Pages provides it), or localhost for development. **Do not open `index.html` or `admin.html` directly from Files / a `file://` URL.** The studio loads resources and exports the site from a web server.

## Offline reading and updates

The service worker caches the application shell, then all published photos and the recording while the reader is open online. Keep the reader open online until all photos have loaded; the Install dialog reports when offline saving is complete. Then installed/offline reading works on that device, subject to browser storage availability. Browser cache cleanup or insufficient storage can remove offline files. Draft previews use local IndexedDB photos and are separate from the published reader.

Each admin-exported ZIP changes the service worker cache version and generates new photo filenames. New deployments activate the new cache and reload an already-controlled reader once. GitHub/CDN publication delays still apply. If an older book remains visible, close and reopen the installed app while online. If necessary clear site data **only after backing up your admin draft**.

If you edit files by hand instead of exporting, change the `__BUILD_ID__` text in `sw.js` to a new unique version string every time. Change uploaded photo filenames when replacing their contents. Photos removed from the new book can be deleted from the repository too; replacing a ZIP's files does not automatically delete old GitHub files.

## Local development

No dependencies or bundler are required. With Python installed:

```sh
cd neemisha-notebook
python3 -m http.server 8000
```

Open `http://localhost:8000/` and `http://localhost:8000/admin.html`. Deployment to GitHub Pages is the easiest way to test installation and orientation on your phone; a plain HTTP LAN address normally cannot install a PWA.

The source ZIP includes tests; the admin-exported deployment ZIP contains the runtime files only. With Node.js 20 or newer, run the unit tests:

```sh
node --test tests/*.test.mjs
```

## Files

- `index.html`, `book.css`, `reader.js`: birthday experience.
- `admin.html`, `admin.css`, `admin.js`: local editor, import/export and voice upload.
- `core.js`: shared book validation, escaping and gesture classification.
- `storage.js`: IndexedDB draft persistence.
- `zip.js`: dependency-free ZIP export, with CRC32.
- `data/book.json`: published content, with 10–15 strings per letter and relative image paths.
- `assets/`: photos, icons and optional recording.
- `manifest.webmanifest`, `sw.js`, `pwa.js`: installation, orientation and offline storage.
- `resources.json`: shell files included by the admin site exporter. If adding a required source file, list it here and in the service worker shell list as appropriate.
- `tests/`: validation, gestures, ZIP, reader face/state and service worker tests.

All paths are relative, so repository subpaths work without configuration. No analytics, remote font requests, API keys, CDN runtime dependencies, or account setup are required.
