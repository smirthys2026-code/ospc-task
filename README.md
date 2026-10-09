# ospc-task
# Decoded Files

Unofficial fan hub for the Tamil YouTube channel **Saravanan Decodes**.
Plain HTML, CSS and vanilla JS. No frameworks and no build step.

> Unofficial fan-made tribute. Not affiliated with or endorsed by Saravanan Decodes.

## Pages

- `index.html`: hero, latest videos, searchable case file library, process timeline, quiz, Fan Lines soundboard, fan club signup
- `community.html`: fan wall, fan-favorite voting, FAQ, share button
- `login.html`: log in, create account, forgot password
- `404.html`: "Case not found" page
- `videos.json`: list of videos used by the site
- `fetch-videos.js`: script that builds `videos.json` from the YouTube API

## 1. Connect Supabase

Open `script.js` and edit the first two lines:

```js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";
```

Find both in the Supabase dashboard under **Project Settings → API**.
Use the **anon / public** key. Never use the `service_role` key.

Tables used (already created): `fan_signups`, `fan_wall`, `video_votes`,
plus the function `get_vote_counts()`. Row Level Security must allow public
inserts, and public reads of approved `fan_wall` rows only.

### Login (Supabase Auth)

1. **Authentication → Providers:** make sure **Email** is enabled.
2. Turn **Confirm email** off while testing, so new accounts can log in right away.
3. **Authentication → URL Configuration:** set **Site URL** to your live site
   link (use `http://localhost:3000` while testing).

Login is optional. Visitors can still use the fan wall, voting and signup
without an account.

## 2. Load all videos

The site works with the 6 placeholder videos in `videos.json`. To load every
video from the channel, use one of these.

### Option A: YouTube Data API key

1. Open Google Cloud Console and create a project.
2. **APIs & Services → Library:** enable **YouTube Data API v3**.
3. **APIs & Services → Credentials:** create an **API key**.
4. Run it in the project folder.

Mac / Linux:

```
YT_API_KEY=yourkey node fetch-videos.js
```

Windows PowerShell:

```
$env:YT_API_KEY="yourkey"; node fetch-videos.js
```

Do NOT commit your key anywhere. Commit the generated `videos.json`.

### Option B: no API key (yt-dlp)

```
brew install yt-dlp
yt-dlp --flat-playlist -J "https://www.youtube.com/@saravanandecodes/videos" > raw.json
node -e 'const r=require("./raw.json");const o=r.entries.filter(e=>e&&e.id&&e.title&&!/^(Private|Deleted) video$/.test(e.title)).map(e=>({id:e.id,title:e.title,publishedAt:null}));require("fs").writeFileSync("videos.json",JSON.stringify(o,null,2));console.log("Wrote",o.length,"vide
