# MB Rooms-Booking WebApp prototype

A browser-only meeting-room booking prototype for COMP90082 / MB-Koala.Can be easily use after download .

It draws inspiration from Google Calendar view and well demonstrates the users’ top‑priority requirements:
Both internal and external users can make bookings smoothly, with no requirement for a Google‑only email address. External users can set up a password and log in upon administrator approval.
All users can quickly and clearly check whether a target room is occupied, and the system blocks bookings with time conflicts.
Users can view full details of their own reservations, while others’ bookings are only shown as occupied to protect user privacy.
Users can complete bookings effortlessly within just a few clicks.
Because its just for prototype validation,no backend server is implemented,so the browser cannot send booking success reminder emails via the room address on its own.but If Outlook is already signed‑in on your device, you can input another valid email address when registering an account. The web popup will auto‑generate an email pre‑filled with booking information; just click confirm to send it.

## How to open

1. Download whole doc.Open `src/index.html` in Chrome or Edge (double-click, or right-click → Open with).
2. If the page looks unstyled, you opened the file from a context that blocked local CSS. In that case drag `index.html` onto a browser window, or from PowerShell:

```powershell
start src/index.html
```

No Node.js, npm, or login to Google is required.

## Demo accounts which already exist.

| Role | Email | Password | What to show |
| --- | --- | --- | --- |
| Administrator | `admin@mbkoala.edu` | `admin123` | Approve registrations, edit rooms, see booking owners, delete bookings, usage |
| Approved user (Acme) | `alex@acme.com` | `user123` | Yellow = own meetings; BrightTech meetings appear as blue **Busy** |
| Approved user (BrightTech) | `sam@brighttech.com` | `user123` | Same calendar, different private details |
| Pending applicant | `morgan@northwind.com` | _(none yet)_ | Waiting for admin approval |

Admin → **Reset demo data** restores these accounts and sample bookings.

## You can play around with it like:

1. Sign in as **Alex**. You can see in2026/8/16, Room 101: yellow *Client workshop*, blue *Busy* (Sam’s booking — title hidden).
2. Click an empty slot, book a room, add attendees, optionally choose weekly repeat. Use **Add to calendar** to download an `.ics` file (opens in Google Calendar / Outlook).
3. For **Room panels**.part.For the room‑panels part, a schematic diagram is provided on Page 2 to demonstrate the synchronization effect between the calendar and the room panels.Set preview time to 10:00 today on Room 101 — outside panel says Occupied, inside screen shows the meeting. Same record as the calendar.
4. Sign out. Register with a **real inbox** (company, name, email). Sign in as **admin**, approve it — your mail app opens a ready-to-send approval email. Send it, then sign in as the new user, create a password, and book a room (a confirmation email draft opens the same way).
5. As admin, open **Usage** and **Bookings** (owner + company + contact email). Delete a leftover reservation.

## What this covers vs the client stories

Can be found in this prototype:

- Register with company, name, email → admin approve / reject
- Create password and sign in after approval
- View rooms and free/busy times
- Reserve a room, add attendees, weekly recurring
- Own bookings yellow with title; others blue without company details
- Admin sees owner, can delete, add/edit rooms (number + email)
- Calendar confirmation as an `.ics` download
- Outside panel + inside screen stay consistent with the booking record
- Simple usage by company, user, and hour


## Privacy note

Passwords in this prototype are stored in plain text in the browser. That is only acceptable for a local demo.

