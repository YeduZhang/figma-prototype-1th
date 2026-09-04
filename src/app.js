(function () {
  "use strict";

  var KEY = "mbkoala-booking-v2";
  var DAY_START = 8 * 60;
  var DAY_END = 18 * 60;
  var SLOT = 30;
  var SLOT_COUNT = (DAY_END - DAY_START) / SLOT;
  var SLOT_W = 72;

  var ui = {
    view: "auth",
    authMode: "login",
    adminTab: "users",
    date: todayStr(),
    displayRoomId: "r-l2-2013",
    previewTime: todayStr() + "T10:00",
    modal: null,
    toast: null,
    error: "",
    pendingEmail: "",
  };

  var db = loadDb();
  var sessionId = sessionStorage.getItem("mbkoala-user") || null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function toLocalISO(d) {
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":00"
    );
  }

  function parseLocal(s) {
    var p = s.split(/[-T:]/);
    return new Date(+p[0], +p[1] - 1, +p[2], +(p[3] || 0), +(p[4] || 0), 0);
  }

  function atOffset(days, h, m) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return toLocalISO(d);
  }

  function dateOf(iso) {
    return iso.slice(0, 10);
  }

  function minsOf(iso) {
    var d = parseLocal(iso);
    return d.getHours() * 60 + d.getMinutes();
  }

  function fmtLong(dateStr) {
    return parseLocal(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function fmtTime(iso) {
    var d = parseLocal(iso);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function fmtRange(a, b) {
    return fmtTime(a) + " – " + fmtTime(b);
  }

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function addDays(dateStr, n) {
    var d = parseLocal(dateStr + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function weekStart(dateStr) {
    var d = parseLocal(dateStr + "T00:00:00");
    var offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d;
  }

  function currentUser() {
    return db.users.find(function (u) {
      return u.id === sessionId;
    }) || null;
  }

  function roomById(id) {
    return db.rooms.find(function (r) {
      return r.id === id;
    });
  }

  function userById(id) {
    return db.users.find(function (u) {
      return u.id === id;
    });
  }

  function seedDb() {
    return {
      users: [
        {
          id: "u-admin",
          name: "Jordan Lee",
          email: "admin@mbkoala.edu",
          company: "MB Facilities",
          password: "admin123",
          role: "admin",
          status: "approved",
        },
        {
          id: "u-alex",
          name: "Alex Chen",
          email: "alex@acme.com",
          company: "Acme Consulting",
          password: "user123",
          role: "user",
          status: "approved",
        },
        {
          id: "u-sam",
          name: "Sam Patel",
          email: "sam@brighttech.com",
          company: "BrightTech",
          password: "user123",
          role: "user",
          status: "approved",
        },
        {
          id: "u-morgan",
          name: "Morgan Wu",
          email: "morgan@northwind.com",
          company: "Northwind Legal",
          password: null,
          role: "user",
          status: "pending",
        },
      ],
      rooms: [
        { id: "r-l1-1013", name: "291-01-1013", email: "291-01-1013-MeetingRm@unimelb.edu.au", capacity: 8, location: "Level 1" },
        { id: "r-l1-1014", name: "291-01-1014", email: "291-01-1014-meetingrm@unimelb.edu.au", capacity: 8, location: "Level 1" },
        { id: "r-l1-1015", name: "291-01-1015", email: "291-01-1015-meetingrm@unimelb.edu.au", capacity: 8, location: "Level 1" },
        { id: "r-l2-2013", name: "291-2-2013", email: "291-2-2013-meetingrm@unimelb.edu.au", capacity: 8, location: "Level 2" },
        { id: "r-l2-2014", name: "291-2-2014", email: "291-2-2014-MeetingRm@unimelb.edu.au", capacity: 8, location: "Level 2" },
        { id: "r-l2-2015", name: "291-2-2015", email: "291-2-2015-MeetingRm@unimelb.edu.au", capacity: 8, location: "Level 2" },
      ],
      bookings: [
        {
          id: "b1",
          roomId: "r-l1-1013",
          userId: "u-alex",
          title: "Client workshop",
          attendees: ["alex@acme.com", "client@example.com"],
          start: atOffset(0, 10, 0),
          end: atOffset(0, 11, 30),
          notes: "Bring projector adapters.",
          seriesId: null,
        },
        {
          id: "b2",
          roomId: "r-l1-1013",
          userId: "u-sam",
          title: "Sprint planning",
          attendees: ["sam@brighttech.com"],
          start: atOffset(0, 14, 0),
          end: atOffset(0, 15, 0),
          notes: "",
          seriesId: null,
        },
        {
          id: "b3",
          roomId: "r-l2-2013",
          userId: "u-alex",
          title: "Design review",
          attendees: ["alex@acme.com", "jamie@acme.com"],
          start: atOffset(1, 9, 0),
          end: atOffset(1, 10, 0),
          notes: "",
          seriesId: null,
        },
        {
          id: "b4",
          roomId: "r-l2-2014",
          userId: "u-sam",
          title: "Weekly leadership",
          attendees: ["sam@brighttech.com", "ceo@brighttech.com"],
          start: atOffset(0, 9, 0),
          end: atOffset(0, 10, 0),
          notes: "Recurring sample",
          seriesId: "s-lead",
        },
        {
          id: "b5",
          roomId: "r-l2-2014",
          userId: "u-sam",
          title: "Weekly leadership",
          attendees: ["sam@brighttech.com", "ceo@brighttech.com"],
          start: atOffset(7, 9, 0),
          end: atOffset(7, 10, 0),
          notes: "Recurring sample",
          seriesId: "s-lead",
        },
        {
          id: "b6",
          roomId: "r-l1-1014",
          userId: "u-alex",
          title: "Interview panel",
          attendees: ["alex@acme.com"],
          start: atOffset(0, 16, 0),
          end: atOffset(0, 17, 0),
          notes: "",
          seriesId: null,
        },
      ],
    };
  }

  function loadDb() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var seeded = seedDb();
    localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  }

  function saveDb() {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  function resetDemo() {
    db = seedDb();
    saveDb();
    sessionId = null;
    sessionStorage.removeItem("mbkoala-user");
    ui.view = "auth";
    ui.toast = { text: "Demo data reset. Sign in again." };
    render();
  }

  function overlaps(a0, a1, b0, b1) {
    return a0 < b1 && b0 < a1;
  }

  function hasConflict(roomId, start, end, ignoreId) {
    return db.bookings.some(function (b) {
      if (b.roomId !== roomId) return false;
      if (ignoreId && b.id === ignoreId) return false;
      return overlaps(start, end, b.start, b.end);
    });
  }

  function icsStamp(iso) {
    var d = parseLocal(iso);
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      "00"
    );
  }

  function downloadIcs(bookings) {
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MB Rooms//EN", "CALSCALE:GREGORIAN"];
    bookings.forEach(function (b) {
      var room = roomById(b.roomId);
      var owner = userById(b.userId);
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + b.id + "@mbrooms.local");
      lines.push("DTSTAMP:" + icsStamp(toLocalISO(new Date())));
      lines.push("DTSTART;TZID=Australia/Melbourne:" + icsStamp(b.start));
      lines.push("DTEND;TZID=Australia/Melbourne:" + icsStamp(b.end));
      lines.push("SUMMARY:" + (b.title || "Meeting").replace(/\n/g, " "));
      lines.push("LOCATION:" + (room ? room.name + " (" + room.email + ")" : ""));
      lines.push("DESCRIPTION:Booked by " + (owner ? owner.name : "") + "\\n" + (b.notes || ""));
      (b.attendees || []).forEach(function (a) {
        lines.push("ATTENDEE;CN=" + a + ":mailto:" + a);
      });
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mb-rooms-booking.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(name) {
    return name
      .split(" ")
      .map(function (p) {
        return p[0];
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function me() {
    return currentUser();
  }

  function goAppHome() {
    var u = me();
    if (!u) {
      ui.view = "auth";
      return;
    }
    if (u.status === "pending") ui.view = "pending";
    else if (u.status === "rejected") ui.view = "rejected";
    else if (u.status === "approved" && !u.password) ui.view = "setpw";
    else ui.view = "calendar";
  }

  /* ---------- render ---------- */

  function render() {
    var root = document.getElementById("app");
    var u = me();
    if (u && u.status === "approved" && u.password && (ui.view === "auth" || ui.view === "pending" || ui.view === "setpw" || ui.view === "rejected")) {
      ui.view = "calendar";
    }
    if (!u) root.innerHTML = renderAuth();
    else if (u.status === "pending") root.innerHTML = renderGate("pending");
    else if (u.status === "rejected") root.innerHTML = renderGate("rejected");
    else if (u.status === "approved" && !u.password) root.innerHTML = renderSetPassword();
    else root.innerHTML = renderShell(u);
    if (ui.toast) {
      var t = document.createElement("div");
      t.className = "toast";
      t.innerHTML =
        "<span>" +
        esc(ui.toast.text) +
        "</span>" +
        (ui.toast.ics
          ? '<button type="button" data-action="ics-last">Add to calendar</button>'
          : "") +
        '<button type="button" data-action="dismiss-toast">Dismiss</button>';
      root.appendChild(t);
    }
  }

  function roomsGrouped() {
    var levels = ["Level 1", "Level 2"];
    var groups = [];
    var used = {};
    levels.forEach(function (level) {
      var list = db.rooms.filter(function (r) {
        return r.location === level;
      });
      if (list.length) {
        groups.push({ level: level, rooms: list });
        list.forEach(function (r) {
          used[r.id] = true;
        });
      }
    });
    var rest = db.rooms.filter(function (r) {
      return !used[r.id];
    });
    if (rest.length) groups.push({ level: "Other", rooms: rest });
    return groups;
  }

  function renderLogo() {
    return '<div class="logo"><img src="mec-logo.svg" alt="Melbourne Entrepreneurial Centre" /></div>';
  }

  function renderTopbar(u) {
    if (!u) return '<div class="topbar">' + renderLogo() + "</div>";
    var nav =
      '<div class="nav">' +
      '<button type="button" class="' +
      (ui.view === "calendar" ? "active" : "") +
      '" data-action="view" data-view="calendar">Calendar</button>' +
      '<button type="button" class="' +
      (ui.view === "displays" ? "active" : "") +
      '" data-action="view" data-view="displays">Room screens</button>' +
      (u.role === "admin"
        ? '<button type="button" class="' +
          (ui.view === "admin" ? "active" : "") +
          '" data-action="view" data-view="admin">Admin</button>'
        : "") +
      "</div>";
    return (
      '<div class="topbar">' +
      renderLogo() +
      nav +
      '<div class="who"><b>' +
      esc(u.name) +
      "</b><span>" +
      esc(u.company) +
      " · " +
      esc(u.role) +
      "</span></div>" +
      '<div class="avatar">' +
      esc(initials(u.name)) +
      "</div>" +
      '<button class="btn btn-ghost" type="button" data-action="logout">Sign out</button>' +
      "</div>"
    );
  }

  function renderAuth() {
    var login = ui.authMode === "login";
    return (
      renderTopbar(null) +
      '<div class="auth-shell">' +
      '<div class="auth-brand">' +
      "<h1>MB Rooms</h1>" +
      "<p>A Google Calendar–style room booking prototype. External visitors register with company, name and email. Administrators approve access before anyone can book.</p>" +
      '<div class="mini-cal">' +
      '<div class="mini-cal-head"><span>Room</span><span>Today · 08:00 — 18:00</span></div>' +
      '<div class="mini-cal-row"><div class="mini-room">291-2-2013</div><div class="mini-track">' +
      '<div class="mini-evt evt-mine" style="left:72px;width:108px">Workshop</div>' +
      '<div class="mini-evt evt-busy" style="left:216px;width:72px">Busy</div>' +
      "</div></div>" +
      '<div class="mini-cal-row"><div class="mini-room">291-01-1013</div><div class="mini-track">' +
      '<div class="mini-evt evt-mine" style="left:288px;width:72px">Interview</div>' +
      "</div></div>" +
      '<div class="mini-cal-row"><div class="mini-room">291-2-2014</div><div class="mini-track">' +
      '<div class="mini-evt evt-busy" style="left:36px;width:72px">Busy</div>' +
      "</div></div>" +
      "</div>" +
      '<p class="hint">Yellow = your booking. Blue = occupied (details hidden). Empty = free.</p>' +
      "</div>" +
      '<div class="auth-panel">' +
      "<h2>" +
      (login ? "Sign in" : "Request access") +
      "</h2>" +
      '<p class="sub">' +
      (login
        ? "Approved users sign in with email and password."
        : "Tell us your company, name and email. An administrator will approve or reject the request.") +
      "</p>" +
      '<div class="tabs">' +
      '<button type="button" class="' +
      (login ? "active" : "") +
      '" data-action="auth-login">Sign in</button>' +
      '<button type="button" class="' +
      (!login ? "active" : "") +
      '" data-action="auth-register">Register</button>' +
      "</div>" +
      (login ? renderLoginForm() : renderRegisterForm()) +
      (ui.error ? '<div class="error">' + esc(ui.error) + "</div>" : "") +
      '<p class="hint">Demo accounts — admin: admin@mbkoala.edu / admin123 · user: alex@acme.com / user123 · other company: sam@brighttech.com / user123</p>' +
      "</div></div>"
    );
  }

  function renderLoginForm() {
    return (
      '<form data-form="login">' +
      "<label>Email</label><input name=\"email\" type=\"email\" required placeholder=\"you@company.com\" />" +
      "<label>Password</label><input name=\"password\" type=\"password\" placeholder=\"Required after approval\" />" +
      '<div class="btn-row"><button class="btn btn-primary" type="submit">Sign in</button></div>' +
      "</form>"
    );
  }

  function renderRegisterForm() {
    return (
      '<form data-form="register">' +
      "<label>Full name</label><input name=\"name\" required placeholder=\"Alex Chen\" />" +
      "<label>Company name</label><input name=\"company\" required placeholder=\"Acme Consulting\" />" +
      "<label>Email</label><input name=\"email\" type=\"email\" required placeholder=\"alex@acme.com\" />" +
      '<div class="btn-row"><button class="btn btn-primary" type="submit">Submit registration</button></div>' +
      "</form>"
    );
  }

  function renderGate(kind) {
    var u = me();
    var ok = kind === "pending";
    return (
      renderTopbar(null) +
      '<div class="auth-shell"><div class="auth-brand"><h1>MB Rooms</h1></div><div class="auth-panel">' +
      "<h2>" +
      (ok ? "Waiting for approval" : "Registration declined") +
      "</h2>" +
      '<div class="notice ' +
      (ok ? "warn" : "bad") +
      '">' +
      (ok
        ? "Hi " +
          esc(u.name) +
          ", your request for <b>" +
          esc(u.company) +
          "</b> is with an administrator. After approval, sign in with <b>" +
          esc(u.email) +
          "</b> to create a password."
        : "This email was not approved for booking access. Contact facilities if you believe this is a mistake.") +
      "</div>" +
      '<div class="btn-row"><button class="btn btn-ghost" data-action="logout" type="button">Back to sign in</button></div>' +
      "</div></div>"
    );
  }

  function renderSetPassword() {
    var u = me();
    return (
      renderTopbar(null) +
      '<div class="auth-shell"><div class="auth-brand"><h1>MB Rooms</h1><p>Access approved. Create a password to start booking rooms.</p></div><div class="auth-panel">' +
      "<h2>Create your password</h2>" +
      '<p class="sub">Welcome, ' +
      esc(u.name) +
      " · " +
      esc(u.email) +
      "</p>" +
      '<form data-form="setpw">' +
      "<label>Password</label><input name=\"password\" type=\"password\" required minlength=\"4\" />" +
      "<label>Confirm password</label><input name=\"confirm\" type=\"password\" required />" +
      '<div class="btn-row"><button class="btn btn-primary" type="submit">Save and continue</button></div>' +
      "</form>" +
      (ui.error ? '<div class="error">' + esc(ui.error) + "</div>" : "") +
      "</div></div>"
    );
  }

  function renderShell(u) {
    return (
      renderTopbar(u) +
      (ui.view === "calendar" ? renderCalendar(u) : "") +
      (ui.view === "admin" && u.role === "admin" ? renderAdmin() : "") +
      (ui.view === "displays" ? renderDisplays() : "") +
      (ui.modal ? renderModal(u) : "")
    );
  }

  function renderCalendar(u) {
    var start = weekStart(ui.date);
    var days = [];
    var i;
    for (i = 0; i < 7; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var ds = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
      days.push({ str: ds, n: d.getDate(), label: ["M", "T", "W", "T", "F", "S", "S"][i] });
    }

    var hours = "";
    for (i = 8; i < 18; i++) {
      hours += '<div class="hour">' + pad(i) + ":00</div>";
    }

    function roomRow(room) {
      var events = db.bookings
        .filter(function (b) {
          return b.roomId === room.id && dateOf(b.start) === ui.date;
        })
        .map(function (b) {
          var mine = b.userId === u.id;
          var admin = u.role === "admin";
          var left = ((minsOf(b.start) - DAY_START) / SLOT) * SLOT_W;
          var width = ((minsOf(b.end) - minsOf(b.start)) / SLOT) * SLOT_W;
          var title = mine || admin ? b.title : "Busy";
          var sub = fmtRange(b.start, b.end);
          return (
            '<button type="button" class="evt ' +
            (mine ? "evt-mine" : "evt-busy") +
            '" style="left:' +
            left +
            "px;width:" +
            Math.max(width - 4, 24) +
            'px" data-action="open-booking" data-id="' +
            b.id +
            '"><b>' +
            esc(title) +
            "</b><span>" +
            esc(sub) +
            "</span></button>"
          );
        })
        .join("");

      var slots = "";
      for (i = 0; i < SLOT_COUNT; i++) {
        slots +=
          '<button class="slot" type="button" data-action="new-booking" data-room="' +
          room.id +
          '" data-mins="' +
          (DAY_START + i * SLOT) +
          '" title="Book ' +
          esc(room.name) +
          '"></button>';
      }

      return (
        '<div class="cal-row">' +
        '<div class="room-cell"><b>' +
        esc(room.name) +
        "</b><small>" +
        esc(room.email) +
        "</small></div>" +
        '<div class="track" style="width:' +
        SLOT_COUNT * SLOT_W +
        'px">' +
        slots +
        events +
        "</div></div>"
      );
    }

    var rows = roomsGrouped()
      .map(function (g) {
        return (
          '<div class="cal-level"><div class="room-cell level-label">' +
          esc(g.level) +
          '</div><div class="level-fill" style="width:' +
          SLOT_COUNT * SLOT_W +
          'px"></div></div>' +
          g.rooms.map(roomRow).join("")
        );
      })
      .join("");

    return (
      '<div class="toolbar">' +
      '<button class="round" type="button" data-action="prev-day" title="Previous day">‹</button>' +
      '<button class="today-btn" type="button" data-action="today">Today</button>' +
      '<button class="round" type="button" data-action="next-day" title="Next day">›</button>' +
      "<h2>" +
      esc(fmtLong(ui.date)) +
      "</h2>" +
      '<input type="date" value="' +
      ui.date +
      '" data-action="pick-date" />' +
      '<div class="weekstrip">' +
      days
        .map(function (d) {
          return (
            '<button type="button" class="dow ' +
            (d.str === ui.date ? "on" : "") +
            '" data-action="set-date" data-date="' +
            d.str +
            '">' +
            d.label +
            "<b>" +
            d.n +
            "</b></button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="legend"><span><i class="swatch free"></i>Free</span><span><i class="swatch busy"></i>Occupied</span><span><i class="swatch mine"></i>My booking</span></div>' +
      "</div>" +
      '<div class="cal-wrap"><div class="cal">' +
      '<div class="cal-times"><div class="corner"></div><div class="hours">' +
      hours +
      "</div></div>" +
      rows +
      "</div></div>"
    );
  }

  function renderAdmin() {
    var tabs =
      '<div class="subtabs">' +
      ["users", "rooms", "bookings", "usage"]
        .map(function (t) {
          var labels = { users: "Registrations", rooms: "Rooms", bookings: "Bookings", usage: "Usage" };
          return (
            '<button type="button" class="' +
            (ui.adminTab === t ? "active" : "") +
            '" data-action="admin-tab" data-tab="' +
            t +
            '">' +
            labels[t] +
            "</button>"
          );
        })
        .join("") +
      "</div>";

    var body = "";
    if (ui.adminTab === "users") body = renderAdminUsers();
    if (ui.adminTab === "rooms") body = renderAdminRooms();
    if (ui.adminTab === "bookings") body = renderAdminBookings();
    if (ui.adminTab === "usage") body = renderUsage();

    return (
      '<div class="page"><h2>Administrator</h2>' +
      tabs +
      body +
      '<p class="hint"><button class="btn btn-ghost" type="button" data-action="reset">Reset demo data</button> Local prototype only — nothing is sent to Google Calendar.</p></div>'
    );
  }

  function renderAdminUsers() {
    var rows = db.users
      .map(function (u) {
        var actions = "";
        if (u.status === "pending") {
          actions =
            '<button class="btn btn-primary" type="button" data-action="approve" data-id="' +
            u.id +
            '">Approve</button> ' +
            '<button class="btn btn-danger" type="button" data-action="reject" data-id="' +
            u.id +
            '">Reject</button>';
        }
        return (
          "<tr><td>" +
          esc(u.name) +
          "</td><td>" +
          esc(u.company) +
          "</td><td>" +
          esc(u.email) +
          "</td><td>" +
          esc(u.role) +
          '</td><td><span class="pill pill-' +
          u.status +
          '">' +
          u.status +
          "</span></td><td>" +
          actions +
          "</td></tr>"
        );
      })
      .join("");
    return (
      "<table><thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>" +
      rows +
      "</tbody></table>"
    );
  }

  function renderAdminRooms() {
    var rows = db.rooms
      .map(function (r) {
        return (
          "<tr><td>" +
          esc(r.name) +
          "</td><td>" +
          esc(r.email) +
          "</td><td>" +
          esc(r.location) +
          "</td><td>" +
          r.capacity +
          '</td><td><button class="btn btn-ghost" type="button" data-action="edit-room" data-id="' +
          r.id +
          '">Edit</button></td></tr>'
        );
      })
      .join("");
    return (
      '<div class="btn-row" style="margin-top:0"><button class="btn btn-primary" type="button" data-action="add-room">Add room</button></div>' +
      "<table><thead><tr><th>Room</th><th>Calendar email</th><th>Location</th><th>Capacity</th><th></th></tr></thead><tbody>" +
      rows +
      "</tbody></table>"
    );
  }

  function renderAdminBookings() {
    var rows = db.bookings
      .slice()
      .sort(function (a, b) {
        return a.start < b.start ? -1 : 1;
      })
      .map(function (b) {
        var owner = userById(b.userId) || { name: "?", company: "?", email: "" };
        var room = roomById(b.roomId) || { name: "?" };
        return (
          "<tr><td>" +
          esc(room.name) +
          "</td><td>" +
          esc(b.title) +
          "</td><td>" +
          dateOf(b.start) +
          " " +
          fmtRange(b.start, b.end) +
          "</td><td>" +
          esc(owner.name) +
          "<br><small>" +
          esc(owner.company) +
          " · " +
          esc(owner.email) +
          "</small></td><td>" +
          esc((b.attendees || []).join(", ")) +
          '</td><td><button class="btn btn-danger" type="button" data-action="delete-booking" data-id="' +
          b.id +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
    return (
      "<table><thead><tr><th>Room</th><th>Title</th><th>When</th><th>Owner</th><th>Attendees</th><th></th></tr></thead><tbody>" +
      rows +
      "</tbody></table>"
    );
  }

  function hoursOf(b) {
    return (parseLocal(b.end) - parseLocal(b.start)) / 3600000;
  }

  function renderUsage() {
    var byCompany = {};
    var byUser = {};
    var byHour = {};
    var i;
    for (i = 8; i < 18; i++) byHour[i] = 0;
    db.bookings.forEach(function (b) {
      var u = userById(b.userId);
      if (!u) return;
      var h = hoursOf(b);
      byCompany[u.company] = (byCompany[u.company] || 0) + h;
      byUser[u.name] = (byUser[u.name] || 0) + h;
      byHour[parseLocal(b.start).getHours()] = (byHour[parseLocal(b.start).getHours()] || 0) + 1;
    });
    var maxC = Math.max.apply(null, Object.keys(byCompany).map(function (k) { return byCompany[k]; }).concat([0.1]));
    var maxU = Math.max.apply(null, Object.keys(byUser).map(function (k) { return byUser[k]; }).concat([0.1]));
    var maxH = Math.max.apply(null, Object.keys(byHour).map(function (k) { return byHour[k]; }).concat([0.1]));

    function bars(map, max) {
      return Object.keys(map)
        .sort(function (a, b) {
          return map[b] - map[a];
        })
        .map(function (k) {
          var val = typeof map[k] === "number" && map[k] % 1 ? map[k].toFixed(1) : map[k];
          return (
            '<div class="bar-row"><span>' +
            esc(k) +
            '</span><div class="bar"><i style="width:' +
            (map[k] / max) * 100 +
            '%"></i></div><span>' +
            val +
            "</span></div>"
          );
        })
        .join("");
    }

    var totalH = db.bookings.reduce(function (s, b) {
      return s + hoursOf(b);
    }, 0);
    var companies = {};
    db.bookings.forEach(function (b) {
      var u = userById(b.userId);
      if (u) companies[u.company] = true;
    });

    return (
      '<div class="cards">' +
      '<div class="card"><div class="n">' +
      db.bookings.length +
      '</div><div class="l">Reservations on record</div></div>' +
      '<div class="card"><div class="n">' +
      totalH.toFixed(1) +
      'h</div><div class="l">Total booked hours</div></div>' +
      '<div class="card"><div class="n">' +
      Object.keys(companies).length +
      '</div><div class="l">Companies with bookings</div></div>' +
      "</div>" +
      "<h3>Hours by company</h3>" +
      bars(byCompany, maxC) +
      "<h3>Hours by user</h3>" +
      bars(byUser, maxU) +
      "<h3>Bookings starting by hour</h3>" +
      bars(
        Object.keys(byHour).reduce(function (o, k) {
          o[pad(k) + ":00"] = byHour[k];
          return o;
        }, {}),
        maxH
      )
    );
  }

  function occupancyAt(roomId, when) {
    return db.bookings.find(function (b) {
      return b.roomId === roomId && b.start <= when && when < b.end;
    }) || null;
  }

  function nextBooking(roomId, when) {
    return db.bookings
      .filter(function (b) {
        return b.roomId === roomId && b.start >= when;
      })
      .sort(function (a, b) {
        return a.start < b.start ? -1 : 1;
      })[0] || null;
  }

  function renderDisplays() {
    var when = (ui.previewTime.length === 16 ? ui.previewTime + ":00" : ui.previewTime) || toLocalISO(new Date());
    var room = roomById(ui.displayRoomId) || db.rooms[0];
    var nowB = occupancyAt(room.id, when);
    var nxt = nextBooking(room.id, when);
    var owner = nowB ? userById(nowB.userId) : null;

    var outside = nowB
      ? '<div class="screen busy"><div class="room">' +
        esc(room.name).toUpperCase() +
        '</div><div class="status">Occupied</div><div class="meta">Until ' +
        fmtTime(nowB.end) +
        (nxt ? "<br>Next: " + fmtTime(nxt.start) : "") +
        "</div></div>"
      : '<div class="screen free"><div class="room">' +
        esc(room.name).toUpperCase() +
        '</div><div class="status">Available</div><div class="meta">' +
        (nxt ? "Next meeting " + fmtTime(nxt.start) : "No further meetings today") +
        "</div></div>";

    var inside = nowB
      ? '<div class="screen busy"><div class="room">NOW IN SESSION</div><div class="status" style="font-size:28px">' +
        esc(nowB.title) +
        '</div><div class="meta">' +
        fmtRange(nowB.start, nowB.end) +
        "<br>Host: " +
        esc(owner ? owner.name : "") +
        " · " +
        esc(owner ? owner.company : "") +
        "</div></div>"
      : '<div class="screen free"><div class="room">' +
        esc(room.name).toUpperCase() +
        '</div><div class="status">This room is free</div><div class="meta">Please keep the door closed when you leave.</div></div>';

    return (
      '<div class="page"><h2>Room screens</h2>' +
      '<p class="muted">Outside panel and inside screen read the same booking record as the calendar, so availability stays consistent.</p>' +
      '<div class="grid-2" style="max-width:640px">' +
      "<div><label>Room</label><select data-action=\"display-room\">" +
      db.rooms
        .map(function (r) {
          return (
            '<option value="' +
            r.id +
            '"' +
            (r.id === room.id ? " selected" : "") +
            ">" +
            esc(r.name) +
            "</option>"
          );
        })
        .join("") +
      "</select></div>" +
      "<div><label>Preview time</label><input type=\"datetime-local\" value=\"" +
      (ui.previewTime || toLocalISO(new Date()).slice(0, 16)) +
      '" data-action="preview-time" /></div></div>' +
      '<div class="screens"><div>' +
      outside +
      '<p class="caption">Outside panel</p></div><div>' +
      inside +
      '<p class="caption">Inside screen</p></div></div></div>'
    );
  }

  function timeOptions(selectedMins) {
    var html = "";
    var m;
    for (m = DAY_START; m <= DAY_END; m += SLOT) {
      var label = pad(Math.floor(m / 60)) + ":" + pad(m % 60);
      html +=
        '<option value="' +
        m +
        '"' +
        (m === selectedMins ? " selected" : "") +
        ">" +
        label +
        "</option>";
    }
    return html;
  }

  function renderModal(u) {
    var m = ui.modal;
    if (m.type === "booking-new") return renderNewBookingModal();
    if (m.type === "booking-view") return renderViewBookingModal(u);
    if (m.type === "room") return renderRoomModal();
    return "";
  }

  function renderNewBookingModal() {
    var m = ui.modal;
    return (
      '<div class="overlay" data-action="close-modal"><div class="modal" data-stop="1">' +
      "<h3>Reserve a room</h3>" +
      '<form data-form="booking">' +
      "<label>Title</label><input name=\"title\" required placeholder=\"Team standup\" />" +
      "<label>Room</label><select name=\"roomId\">" +
      db.rooms
        .map(function (r) {
          return (
            '<option value="' +
            r.id +
            '"' +
            (r.id === m.roomId ? " selected" : "") +
            ">" +
            esc(r.name) +
            "</option>"
          );
        })
        .join("") +
      "</select>" +
      "<label>Date</label><input name=\"date\" type=\"date\" required value=\"" +
      (m.date || ui.date) +
      '" />' +
      '<div class="grid-2"><div><label>Start</label><select name="startMins">' +
      timeOptions(m.startMins) +
      '</select></div><div><label>End</label><select name="endMins">' +
      timeOptions(m.startMins + 60) +
      "</select></div></div>" +
      "<label>Attendees (emails, comma separated)</label>" +
      '<input name="attendees" placeholder="jane@acme.com, lee@acme.com" />' +
      "<label>Repeat weekly for extra weeks</label>" +
      '<select name="repeat"><option value="0">Does not repeat</option>' +
      "<option value=\"3\">Weekly, 4 occurrences</option>" +
      "<option value=\"7\">Weekly, 8 occurrences</option></select>" +
      "<label>Notes</label><textarea name=\"notes\" rows=\"2\"></textarea>" +
      (ui.error ? '<div class="error">' + esc(ui.error) + "</div>" : "") +
      '<div class="btn-row"><button class="btn btn-primary" type="submit">Book</button>' +
      '<button class="btn btn-ghost" type="button" data-action="close-modal">Cancel</button></div>' +
      "</form></div></div>"
    );
  }

  function renderViewBookingModal(u) {
    var b = db.bookings.find(function (x) {
      return x.id === ui.modal.id;
    });
    if (!b) return "";
    var mine = b.userId === u.id;
    var admin = u.role === "admin";
    var room = roomById(b.roomId);
    var owner = userById(b.userId);
    var html;
    if (!mine && !admin) {
      html =
        "<h3>Occupied</h3><div class=\"kv\">This time is already reserved. Details are hidden to protect other companies' booking information.</div>" +
        '<div class="kv"><b>Room</b> ' +
        esc(room.name) +
        "</div><div class=\"kv\"><b>Time</b> " +
        fmtRange(b.start, b.end) +
        "</div>";
    } else {
      html =
        "<h3>" +
        esc(b.title) +
        "</h3>" +
        '<div class="kv"><b>Room</b> ' +
        esc(room.name) +
        " · " +
        esc(room.email) +
        "</div>" +
        '<div class="kv"><b>When</b> ' +
        dateOf(b.start) +
        " · " +
        fmtRange(b.start, b.end) +
        "</div>" +
        '<div class="kv"><b>Owner</b> ' +
        esc(owner.name) +
        " (" +
        esc(owner.company) +
        ", " +
        esc(owner.email) +
        ")</div>" +
        '<div class="kv"><b>Attendees</b> ' +
        esc((b.attendees || []).join(", ") || "—") +
        "</div>" +
        '<div class="kv"><b>Notes</b> ' +
        esc(b.notes || "—") +
        "</div>";
    }
    var actions = '<div class="btn-row">';
    if (mine) {
      actions += '<button class="btn btn-primary" type="button" data-action="ics-one" data-id="' + b.id + '">Add to calendar</button>';
      actions += '<button class="btn btn-danger" type="button" data-action="cancel-booking" data-id="' + b.id + '">Cancel booking</button>';
    }
    if (admin && !mine) {
      actions += '<button class="btn btn-danger" type="button" data-action="delete-booking" data-id="' + b.id + '">Delete</button>';
    }
    actions += '<button class="btn btn-ghost" type="button" data-action="close-modal">Close</button></div>';
    return '<div class="overlay" data-action="close-modal"><div class="modal" data-stop="1">' + html + actions + "</div></div>";
  }

  function renderRoomModal() {
    var r = ui.modal.id
      ? roomById(ui.modal.id)
      : { name: "", email: "", location: "", capacity: 8 };
    return (
      '<div class="overlay" data-action="close-modal"><div class="modal" data-stop="1">' +
      "<h3>" +
      (ui.modal.id ? "Edit room" : "Add room") +
      "</h3>" +
      '<form data-form="room">' +
      '<input type="hidden" name="id" value="' +
      esc(ui.modal.id || "") +
      '" />' +
      "<label>Room number / name</label><input name=\"name\" required value=\"" +
      esc(r.name) +
      '" />' +
      "<label>Calendar email</label><input name=\"email\" type=\"email\" required value=\"" +
      esc(r.email) +
      '" placeholder="room103.meetingroom@gmail.com" />' +
      "<label>Location</label><input name=\"location\" value=\"" +
      esc(r.location) +
      '" />' +
      "<label>Capacity</label><input name=\"capacity\" type=\"number\" min=\"1\" value=\"" +
      esc(r.capacity) +
      '" />' +
      '<div class="btn-row"><button class="btn btn-primary" type="submit">Save</button>' +
      '<button class="btn btn-ghost" type="button" data-action="close-modal">Cancel</button></div>' +
      "</form></div></div>"
    );
  }

  /* ---------- actions ---------- */

  function setSession(id) {
    sessionId = id;
    if (id) sessionStorage.setItem("mbkoala-user", id);
    else sessionStorage.removeItem("mbkoala-user");
  }

  function flash(text, icsBookings) {
    ui.toast = { text: text, ics: icsBookings || null };
    setTimeout(function () {
      ui.toast = null;
      render();
    }, 6000);
  }

  function openMail(to, subject, body, cc) {
    if (!to) return;
    var url =
      "mailto:" +
      encodeURIComponent(to) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    if (cc) url += "&cc=" + encodeURIComponent(cc);
    var a = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function mailApproval(user) {
    openMail(
      user.email,
      "MB Rooms — your booking access is approved",
      "Hi " +
        user.name +
        ",\n\n" +
        "Your registration for " +
        user.company +
        " has been approved.\n\n" +
        "Sign in to MB Rooms with this email (" +
        user.email +
        ") and create a password. After that you can view meeting rooms and make reservations.\n\n" +
        "MB Rooms"
    );
  }

  function mailBooking(user, room, bookings) {
    var lines = bookings.map(function (b) {
      return "• " + dateOf(b.start) + "  " + fmtRange(b.start, b.end);
    });
    var attendees = (bookings[0].attendees || []).filter(function (a) {
      return a.toLowerCase() !== user.email.toLowerCase();
    });
    openMail(
      user.email,
      "Booking confirmed — " + room.name + " — " + bookings[0].title,
      "Hi " +
        user.name +
        ",\n\n" +
        "Your reservation is confirmed.\n\n" +
        "Title: " +
        bookings[0].title +
        "\n" +
        "Room: " +
        room.name +
        " (" +
        room.email +
        ")\n" +
        "When:\n" +
        lines.join("\n") +
        "\n" +
        "Attendees: " +
        (bookings[0].attendees || []).join(", ") +
        (bookings[0].notes ? "\nNotes: " + bookings[0].notes : "") +
        "\n\n" +
        "You can also use Add to calendar in MB Rooms to download an .ics file for Google Calendar or Outlook.\n\n" +
        "MB Rooms",
      attendees.join(",")
    );
  }

  document.body.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    if (el.classList.contains("overlay")) {
      if (e.target.closest(".modal")) {
        var inner = e.target.closest(".modal [data-action]");
        if (!inner) return;
        el = inner;
      } else {
        ui.modal = null;
        ui.error = "";
        render();
        return;
      }
    }
    var action = el.getAttribute("data-action");
    var id = el.getAttribute("data-id");
    if (action === "close-modal") {
      ui.modal = null;
      ui.error = "";
      render();
      return;
    }
    if (action === "auth-login") {
      ui.authMode = "login";
      ui.error = "";
      render();
      return;
    }
    if (action === "auth-register") {
      ui.authMode = "register";
      ui.error = "";
      render();
      return;
    }
    if (action === "logout") {
      setSession(null);
      ui.view = "auth";
      ui.error = "";
      render();
      return;
    }
    if (action === "view") {
      ui.view = el.getAttribute("data-view");
      render();
      return;
    }
    if (action === "admin-tab") {
      ui.adminTab = el.getAttribute("data-tab");
      render();
      return;
    }
    if (action === "today") {
      ui.date = todayStr();
      render();
      return;
    }
    if (action === "prev-day") {
      ui.date = addDays(ui.date, -1);
      render();
      return;
    }
    if (action === "next-day") {
      ui.date = addDays(ui.date, 1);
      render();
      return;
    }
    if (action === "set-date") {
      ui.date = el.getAttribute("data-date");
      render();
      return;
    }
    if (action === "new-booking") {
      ui.error = "";
      ui.modal = {
        type: "booking-new",
        roomId: el.getAttribute("data-room"),
        date: ui.date,
        startMins: +el.getAttribute("data-mins"),
      };
      render();
      return;
    }
    if (action === "open-booking") {
      ui.modal = { type: "booking-view", id: id };
      render();
      return;
    }
    if (action === "approve") {
      var approved = userById(id);
      approved.status = "approved";
      saveDb();
      mailApproval(approved);
      flash("Approved. An email draft to " + approved.email + " has been opened — send it to notify them.");
      render();
      return;
    }
    if (action === "reject") {
      userById(id).status = "rejected";
      saveDb();
      flash("Registration rejected.");
      render();
      return;
    }
    if (action === "add-room") {
      ui.modal = { type: "room", id: "" };
      render();
      return;
    }
    if (action === "edit-room") {
      ui.modal = { type: "room", id: id };
      render();
      return;
    }
    if (action === "delete-booking" || action === "cancel-booking") {
      db.bookings = db.bookings.filter(function (b) {
        return b.id !== id;
      });
      saveDb();
      ui.modal = null;
      flash("Reservation removed. The room is free for that time.");
      render();
      return;
    }
    if (action === "ics-one") {
      var one = db.bookings.find(function (b) {
        return b.id === id;
      });
      if (one) downloadIcs([one]);
      return;
    }
    if (action === "ics-last" && ui.toast && ui.toast.ics) {
      downloadIcs(ui.toast.ics);
      return;
    }
    if (action === "dismiss-toast") {
      ui.toast = null;
      render();
      return;
    }
    if (action === "reset") {
      if (confirm("Reset all bookings, rooms and users back to the demo dataset?")) resetDemo();
      return;
    }
  });

  document.body.addEventListener("change", function (e) {
    var el = e.target;
    var action = el.getAttribute("data-action");
    if (action === "pick-date") {
      ui.date = el.value;
      render();
    }
    if (action === "display-room") {
      ui.displayRoomId = el.value;
      render();
    }
    if (action === "preview-time") {
      ui.previewTime = el.value;
      render();
    }
  });

  document.body.addEventListener("submit", function (e) {
    var form = e.target.closest("[data-form]");
    if (!form) return;
    e.preventDefault();
    var fd = new FormData(form);
    var kind = form.getAttribute("data-form");

    if (kind === "login") {
      var email = String(fd.get("email") || "").trim().toLowerCase();
      var password = String(fd.get("password") || "");
      var user = db.users.find(function (u) {
        return u.email.toLowerCase() === email;
      });
      if (!user) {
        ui.error = "No registration found for that email.";
        render();
        return;
      }
      setSession(user.id);
      ui.error = "";
      if (user.status === "approved" && user.password && user.password !== password) {
        setSession(null);
        ui.error = "Incorrect password.";
        render();
        return;
      }
      goAppHome();
      render();
      return;
    }

    if (kind === "register") {
      var remail = String(fd.get("email") || "").trim().toLowerCase();
      if (
        db.users.some(function (u) {
          return u.email.toLowerCase() === remail;
        })
      ) {
        ui.error = "That email is already registered.";
        render();
        return;
      }
      var nu = {
        id: uid("u"),
        name: String(fd.get("name") || "").trim(),
        email: remail,
        company: String(fd.get("company") || "").trim(),
        password: null,
        role: "user",
        status: "pending",
      };
      db.users.push(nu);
      saveDb();
      setSession(nu.id);
      ui.view = "pending";
      ui.error = "";
      render();
      return;
    }

    if (kind === "setpw") {
      var pw = String(fd.get("password") || "");
      var cf = String(fd.get("confirm") || "");
      if (pw !== cf) {
        ui.error = "Passwords do not match.";
        render();
        return;
      }
      me().password = pw;
      saveDb();
      ui.view = "calendar";
      ui.error = "";
      flash("Password saved. You can now book rooms.");
      render();
      return;
    }

    if (kind === "booking") {
      var u = me();
      var roomId = String(fd.get("roomId"));
      var date = String(fd.get("date"));
      var startMins = +fd.get("startMins");
      var endMins = +fd.get("endMins");
      var repeat = +fd.get("repeat") || 0;
      if (endMins <= startMins) {
        ui.error = "End time must be after start time.";
        render();
        return;
      }
      var title = String(fd.get("title") || "").trim();
      var notes = String(fd.get("notes") || "").trim();
      var attendees = String(fd.get("attendees") || "")
        .split(/[,;\n]+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      if (attendees.indexOf(u.email) === -1) attendees.unshift(u.email);

      var created = [];
      var skipped = 0;
      var week;
      var seriesId = repeat > 0 ? uid("s") : null;
      for (week = 0; week <= repeat; week++) {
        var day = addDays(date, week * 7);
        var start = day + "T" + pad(Math.floor(startMins / 60)) + ":" + pad(startMins % 60) + ":00";
        var end = day + "T" + pad(Math.floor(endMins / 60)) + ":" + pad(endMins % 60) + ":00";
        if (hasConflict(roomId, start, end, null)) {
          skipped += 1;
          continue;
        }
        var booking = {
          id: uid("b"),
          roomId: roomId,
          userId: u.id,
          title: title,
          attendees: attendees,
          start: start,
          end: end,
          notes: notes,
          seriesId: seriesId,
        };
        db.bookings.push(booking);
        created.push(booking);
      }
      if (!created.length) {
        ui.error = "That room is already occupied for the selected time.";
        render();
        return;
      }
      saveDb();
      ui.modal = null;
      ui.error = "";
      ui.date = date;
      mailBooking(u, roomById(roomId), created);
      flash(
        created.length +
          " reservation" +
          (created.length > 1 ? "s" : "") +
          " saved" +
          (skipped ? " (" + skipped + " week(s) skipped due to a clash)" : "") +
          ". An email draft to " +
          u.email +
          " has been opened — send it to confirm.",
        created
      );
      render();
      return;
    }

    if (kind === "room") {
      var rid = String(fd.get("id") || "");
      var payload = {
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        location: String(fd.get("location") || "").trim(),
        capacity: +fd.get("capacity") || 1,
      };
      if (rid) {
        var existing = roomById(rid);
        existing.name = payload.name;
        existing.email = payload.email;
        existing.location = payload.location;
        existing.capacity = payload.capacity;
      } else {
        payload.id = uid("r");
        db.rooms.push(payload);
      }
      saveDb();
      ui.modal = null;
      flash("Room list updated.");
      render();
    }
  });

  goAppHome();
  render();
})();
