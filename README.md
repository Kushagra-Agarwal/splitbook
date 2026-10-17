# Splitbook

Split shared expenses for trips, flats and events. Splitbook is an installable Progressive Web App (PWA): it opens from the home screen like a native app, works offline, and keeps all data on the device. There's no server, account or tracking.

**Features**

- **Accounts**: one per reason for splitting (Trip, Flat / Home, Event, General or Other). Each has its own people, transactions and balances. A new account starts with just "Me".
- **Add**: debit (paid) or credit (received), amount, date, category, who paid or received it, and who it's split among, equally or with custom shares. Choose **New category…** to type your own category.
- **Balances**: who owes whom, the fewest payments to settle up, and **Mark paid** to record a settlement.
- **Dashboard**: totals, monthly chart, spending by category, and every transaction with search, filters, sorting, edit and delete.
- **Export**: the split as a PDF (each person's share for every item, totals, balances and settle-up) or as CSV. On phones this opens the share sheet, so you can send it straight to WhatsApp or Mail.
- **Backup**: save and restore a backup file from Settings to move data between devices.

The whole app is about 130 KB: plain HTML, CSS and JavaScript with no build step and no dependencies.

---

## Deploy on GitHub Pages (free)

1. Create a new repository on github.com, for example `splitbook`. It can be public, or private on a paid plan.
2. Upload every file in this folder to the root of the repository, including the hidden `.nojekyll` file. Either drag them into **Add file → Upload files**, or use git:
   ```bash
   git init && git add . && git commit -m "Splitbook PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/splitbook.git
   git push -u origin main
   ```
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
4. After a minute the app is live at `https://YOUR-USERNAME.github.io/splitbook/`.

All paths in the app are relative, so it works from a sub-folder like `/splitbook/` without changes.

## Deploy on Vercel (free)

**Option A, from GitHub:** push the folder to a GitHub repository as above, then on vercel.com choose **Add New → Project**, import the repository, leave **Framework Preset** as **Other** with no build command, and click **Deploy**.

**Option B, from your computer:**
```bash
npm i -g vercel
cd splitbook
vercel        # first deploy, answer the prompts
vercel --prod # publish to your production URL
```

`vercel.json` makes sure browsers always fetch the latest service worker, so updates reach people promptly.

## Install on a phone

- **iPhone or iPad (Safari):** open the site, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the site and tap **Install** in the banner, or use the menu → **Install app**.
- **Desktop Chrome or Edge:** click the install icon in the address bar.

Once installed, Splitbook opens full-screen and works with no connection.

## Publishing an update

1. Edit the files.
2. In `sw.js`, change `CACHE` to a new version, for example `splitbook-v1.0.1`.
3. Deploy again. People with the app open will see **"A new version of Splitbook is ready" → Update**.

## About the data

Everything is saved in the browser's local storage on that device. Data doesn't sync between devices; use **Settings → Save a backup file** and **Restore** to move it. On iPhone, installing to the Home Screen keeps the data safe from Safari's automatic clean-up of unused websites.

The PDF uses the standard PDF font, which has no ₹ symbol, so rupee amounts appear as "Rs." in the PDF. The app itself shows ₹.

## Files

```
index.html             App page
styles.css             Styles (light and dark mode)
app.js                 App logic: accounts, transactions, balances, dashboard, exports, settings
pdf.js                 Small built-in PDF generator for the split report
sw.js                  Service worker for offline use and updates
manifest.webmanifest   App name, icons and colors for installing
icons/                 App icons (including iPhone home screen icon)
vercel.json            Vercel headers
.nojekyll              Tells GitHub Pages to serve files as they are
```
