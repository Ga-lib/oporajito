# Oporajito — Prototype / Demo

This is a **clickable, front-end-only prototype** of Oporajito for your proposal (Section 11).
It uses fake/sample data (no backend, no database, no real SMS) so it's quick to run and
purely for showing what the app could look like: Login → OTP → Home/Search → Chat → Profile.

Built with React + Vite. Styled to look like a real mobile app, in a Bangladesh-inspired
green/marigold palette.

---

## 1. Install prerequisites (one-time)

You need **Node.js** installed (this gives you `npm`).

1. Go to https://nodejs.org
2. Download and install the **LTS** version (big green button).
3. To check it worked, open a terminal and run:
   ```
   node -v
   npm -v
   ```
   Both should print a version number.

You also need **VS Code**: https://code.visualstudio.com

---

## 2. Open the project in VS Code

1. Unzip `oporajito-prototype.zip` somewhere on your computer (e.g. Desktop).
2. Open **VS Code**.
3. Go to **File → Open Folder...** and select the unzipped `oporajito-prototype` folder.

---

## 3. Install dependencies

1. In VS Code, open a terminal: **Terminal → New Terminal** (or `` Ctrl+` ``).
2. Make sure you're inside the `oporajito-prototype` folder (the terminal prompt should show it).
3. Run:
   ```
   npm install
   ```
   This downloads the packages the project needs. It only takes a minute, and you only
   need to do this once (or again if you delete the `node_modules` folder).

---

## 4. Run the app

In the same terminal, run:

```
npm run dev
```

You'll see something like:

```
  VITE  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

Hold `Ctrl` (or `Cmd` on Mac) and click that `http://localhost:5173/` link — or copy it
into your browser. The app will open there.

To stop the server later, click into the terminal and press `Ctrl + C`.

---

## 5. Try the flow (for your screenshots)

1. **Login** — type any phone number (e.g. `01712-345678`) → *Send verification code*.
2. **OTP** — type any 6 digits → *Verify & continue*.
3. **Home** — search a skill, tap a district or skill chip, tap *Request* on a neighbor card.
4. **Chats** (bottom nav) — open a conversation, type a message and press Enter to send it.
5. **Profile** (bottom nav) — tap *Edit* to see the editable bio/skills state.

For the best-looking screenshots, keep your browser window narrow (around 450–500px wide),
or zoom out slightly — the app is designed to look like a phone screen.

---

## Notes

- All data (users, messages, ratings) is fake and defined in `src/data/mockData.js` — feel
  free to edit names/messages there if you want different content in your screenshots.
- Nothing here talks to a real server, database, or SMS provider. It's a visual/interactive
  mockup only, meant to illustrate the proposed UI and flow described in the proposal.
- If port `5173` is already busy, Vite will automatically pick the next free port and show
  you the correct URL in the terminal.
