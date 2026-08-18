# MB Rooms prototype

A browser-only meeting-room booking prototype for COMP90082 / MB-Koala.

It mimics a Google Calendar resource view: rooms on the left, time on the right, occupied slots in blue, your own bookings in yellow. Data stays in this browser (`localStorage`). There is no server and no live Google Calendar connection.

## How to open

1. Open `src/index.html` in Chrome or Edge (double-click, or right-click → Open with).
2. If the page looks unstyled, you opened the file from a context that blocked local CSS. In that case drag `index.html` onto a browser window, or from PowerShell:

```powershell
start src/index.html
```

No Node.js, npm, or login to Google is required.

## Demo accounts

| Role | Email | Password | What to show |
| --- | --- | --- | --- |
| Administrator | `admin@mbkoala.edu` | `admin123` | Approve registrations, edit rooms, see booking owners, delete bookings, usage |
| Approved user (Acme) | `alex@acme.com` | `user123` | Yellow = own meetings; BrightTech meetings appear as blue **Busy** |
| Approved user (BrightTech) | `sam@brighttech.com` | `user123` | Same calendar, different private details |
| Pending applicant | `morgan@northwind.com` | _(none yet)_ | Waiting for admin approval |

Admin → **Reset demo data** restores these accounts and sample bookings.

## Suggested demo path (about 5 minutes)

1. Sign in as **Alex**. Point out Room 101: yellow *Client workshop*, blue *Busy* (Sam’s booking — title hidden).
2. Click an empty slot, book a room, add attendees, optionally choose weekly repeat. Use **Add to calendar** to download an `.ics` file (opens in Google Calendar / Outlook).
3. Open **Room screens**. Set preview time to 10:00 today on Room 101 — outside panel says Occupied, inside screen shows the meeting. Same record as the calendar.
4. Sign out. Register with a **real inbox** (company, name, email). Sign in as **admin**, approve it — your mail app opens a ready-to-send approval email. Send it, then sign in as the new user, create a password, and book a room (a confirmation email draft opens the same way).
5. As admin, open **Usage** and **Bookings** (owner + company + contact email). Delete a leftover reservation.

## What this covers vs the client stories

Covered in the prototype:

- Register with company, name, email → admin approve / reject
- Create password and sign in after approval
- View rooms and free/busy times
- Reserve a room, add attendees, weekly recurring
- Own bookings yellow with title; others blue without company details
- Admin sees owner, can delete, add/edit rooms (number + email)
- Calendar confirmation as an `.ics` download
- Outside panel + inside screen stay consistent with the booking record
- Simple usage by company, user, and hour

Intentionally not built (too heavy for this prototype):

- Live Google Calendar API / Gmail room mailboxes (needs a Google Cloud project, OAuth consent, and a Workspace calendar for every room)
- Real email notifications
- Physical tablet hardware

If the client later provides a Google Workspace admin account, Calendar API sync can be added as a follow-on.

## Privacy note

Passwords in this prototype are stored in plain text in the browser. That is only acceptable for a local demo.

