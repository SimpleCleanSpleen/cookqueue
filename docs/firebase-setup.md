# Turning on sign-in and community recipes (Firebase)

This takes about 10 minutes in a browser (a phone works too, but a computer
is easier). Everything here is on Firebase's free **Spark** plan, which has
no billing account and no card, so it **can't charge you**. If a free limit
is ever reached, that feature just pauses until the next day.

You'll finish with two things to send Claude:
1. the `firebaseConfig` block from step 2, and
2. "done" once the rules are published in step 4.

---

## 1. Create a separate Firebase project

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. **Create a project** (sometimes shown as "Add project" or "Get started").
   - Name: `cookqueue` (Firebase may add a few characters to make it unique).
   - Keep it separate from your game's project.
   - Google Analytics: **turn it off**. It isn't needed.
3. Wait for it to finish, then click **Continue**.

Don't click "Upgrade" or pick the Blaze plan anywhere. Spark is the default.

## 2. Register the website and copy its settings

1. On the project's overview page, click the **Web** icon (`</>`). It may
   be under "Add app".
2. App nickname: `CookQueue site`. Leave **Firebase Hosting unchecked**
   (the site stays on GitHub Pages).
3. Click **Register app**. Firebase shows a code snippet with
   `const firebaseConfig = { apiKey: "…", authDomain: "…", … };`
4. **Copy that `firebaseConfig` block and paste it to Claude.**

   These values aren't passwords. Every website that uses Firebase shows
   them to its visitors. The data is protected by the rules in step 4.

## 3. Turn on Google sign-in

1. Left menu: **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Google** → switch **Enable** on → choose your
   email as the support email → **Save**.
3. **Settings** tab → **Authorized domains** → **Add domain** →
   `simplecleanspleen.github.io` → **Add**.
   (`localhost` is already listed, which lets you test on your own computer.)

## 4. Create the database and publish the rules

1. Left menu: **Build → Firestore Database → Create database**.
   - If it asks for an edition, choose **Standard**.
   - Location: pick one near you, e.g. `nam5 (United States)`. This
     can't be changed later.
   - Choose **Start in production mode** (locked down). The rules below
     open up exactly what's needed.
2. When it's ready, open the **Rules** tab.
3. Delete everything in the editor, then paste the whole contents of
   [`firestore.rules`](../firestore.rules) from this repo.
   (On GitHub, open the file and use the copy button at the top right of the file view.)
4. Click **Publish**.
5. Tell Claude it's done.

Whenever `firestore.rules` changes in a future update, Claude will tell
you and you'll repeat steps 2–4 of this section.

---

## What happens next

Claude pastes your config into `js/firebase-config.js` and opens a pull
request. Once that's merged, the live site shows a **Sign in** button.
Then:

1. Sign in with Google, then pick a username (it's shown on your recipes;
   your email is not).
2. Use **➕ Add your recipe**. Fill in the form, or paste a recipe's JSON
   from Gemini into the box at the top.
3. The rule check on the right has to be all green before **Publish** works.
4. Open the account menu (your username, top right) → **My recipes** to
   edit or delete. Nobody else can change your recipes, and you can't
   change theirs.

## Free limits (Spark plan)

| What | Free per day | What CookQueue uses |
|---|---|---|
| Database reads | 50,000 | ~1 per recipe per visit, plus 1 per recipe author |
| Database writes | 20,000 | 1–3 per save |
| Stored data | 1 GiB total | ~100–300 KB per recipe with a photo |
| Google sign-ins | 50,000 users/month | You and some friends |

Photos are shrunk in the browser and stored inside the recipe, because
Firebase's file storage needs the paid plan.

## Optional: letting Claude publish rules itself

Pasting the rules takes a minute and only happens when they change, so this
isn't needed. If it ever gets tedious, the alternative is a Google Cloud
**service account key** saved as a secret in your Claude environment settings.
It's a powerful credential that can change anything in the project, so it's
off by default. Ask Claude first if you want to set it up.
