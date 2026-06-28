---
# ─── Independence Day Events ──────────────────────────────────────────────────
#
# Each event needs a stable `id` (UUID). Once set, do NOT change it —
# it links to registrations stored in the database.
#
# age_group options: children | teens | adults | seniors | all
# event_date: YYYY-MM-DD  (the day the event takes place)
# category: Cultural | Sports | Games | Others  (informational only)
# is_active: set to false to hide an event without deleting it
#
# ─────────────────────────────────────────────────────────────────────────────
#
# SCHEDULE OVERVIEW
#   Aug 13 – Kids & Cultural Day  (8 events)
#   Aug 14 – Sports Day           (10 events)
#   Aug 15 – Independence Day     (7 events)
# ─────────────────────────────────────────────────────────────────────────────

events:

  # ── Aug 13 · Kids & Cultural Day ──────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000001"
    name: 50m Sprint
    category: Sports
    age_group: children
    event_date: "2025-08-13"
    slot_time: "07:00 AM – 08:00 AM"
    max_participants: 30
    location: Parking Lot (Zone A)
    description: 50-metre flat race for kids. Heats + final. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000002"
    name: Drawing Competition
    category: Cultural
    age_group: children
    event_date: "2025-08-13"
    slot_time: "09:00 AM – 10:30 AM"
    max_participants: 40
    location: Clubhouse Hall 1
    description: Open-theme drawing for kids. Bring your own colours. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000003"
    name: Lemon & Spoon Race
    category: Games
    age_group: children
    event_date: "2025-08-13"
    slot_time: "09:30 AM – 10:30 AM"
    max_participants: 30
    location: Main Lawn
    description: Classic outdoor relay race. Team of 3 per entry.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000004"
    name: Kids Solo Singing
    category: Cultural
    age_group: children
    event_date: "2025-08-13"
    slot_time: "11:00 AM – 12:30 PM"
    max_participants: 30
    location: Amphitheatre
    description: Individual singing performance, any song. 3–4 min slot. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000005"
    name: Kids Dance (Solo)
    category: Cultural
    age_group: children
    event_date: "2025-08-13"
    slot_time: "02:00 PM – 03:30 PM"
    max_participants: 30
    location: Amphitheatre
    description: Solo dance performance, any style. 3–5 min. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000006"
    name: Kids Dance (Group)
    category: Cultural
    age_group: children
    event_date: "2025-08-13"
    slot_time: "03:30 PM – 04:30 PM"
    max_participants: 15
    location: Amphitheatre
    description: Group choreography, 3–8 members per group. Register as a group.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000007"
    name: Fancy Dress
    category: Cultural
    age_group: children
    event_date: "2025-08-13"
    slot_time: "04:30 PM – 06:00 PM"
    max_participants: 35
    location: Main Lawn
    description: Best patriotic or character costume. Walk the ramp. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000008"
    name: Musical Chair
    category: Games
    age_group: all
    event_date: "2025-08-13"
    slot_time: "06:00 PM – 07:00 PM"
    max_participants: 40
    location: Main Lawn
    description: Open to all age groups. Elimination rounds.
    is_active: true

  # ── Aug 14 · Sports Day ────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000009"
    name: Badminton (Singles)
    category: Sports
    age_group: children
    event_date: "2025-08-14"
    slot_time: "07:00 AM – 09:00 AM"
    max_participants: 16
    location: Badminton Court 1
    description: Knockout singles for kids. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000010"
    name: Badminton (Singles)
    category: Sports
    age_group: adults
    event_date: "2025-08-14"
    slot_time: "07:00 AM – 09:00 AM"
    max_participants: 16
    location: Badminton Court 2
    description: Knockout singles for adults. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000011"
    name: Chess
    category: Sports
    age_group: children
    event_date: "2025-08-14"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 16
    location: Clubhouse Hall 3
    description: Swiss-format chess for kids. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000012"
    name: Chess
    category: Sports
    age_group: adults
    event_date: "2025-08-14"
    slot_time: "09:00 AM – 12:00 PM"
    max_participants: 16
    location: Clubhouse Hall 2
    description: Swiss-format chess for adults. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000013"
    name: Table Tennis (Singles)
    category: Sports
    age_group: children
    event_date: "2025-08-14"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 16
    location: Gym Hall
    description: Singles table tennis for kids. Knockout. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000014"
    name: Table Tennis (Singles)
    category: Sports
    age_group: adults
    event_date: "2025-08-14"
    slot_time: "11:00 AM – 01:00 PM"
    max_participants: 16
    location: Gym Hall
    description: Singles table tennis for adults. Knockout. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000015"
    name: Chess
    category: Sports
    age_group: seniors
    event_date: "2025-08-14"
    slot_time: "02:00 PM – 04:00 PM"
    max_participants: 12
    location: Clubhouse Hall 3
    description: Friendly chess for residents 60+. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000016"
    name: Carroms
    category: Sports
    age_group: all
    event_date: "2025-08-14"
    slot_time: "02:00 PM – 04:00 PM"
    max_participants: 24
    location: Clubhouse Hall 1
    description: Pairs/doubles carroms tournament. Team of 2 per entry.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000017"
    name: Badminton (Doubles)
    category: Sports
    age_group: adults
    event_date: "2025-08-14"
    slot_time: "04:00 PM – 06:00 PM"
    max_participants: 12
    location: Badminton Court 1
    description: Mixed or same-gender doubles. Team of 2 per entry.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000018"
    name: Volleyball
    category: Sports
    age_group: all
    event_date: "2025-08-14"
    slot_time: "04:00 PM – 06:30 PM"
    max_participants: 60
    location: Main Lawn
    description: Inter-tower volleyball. Teams of 6. Register as a team.
    is_active: true

  # ── Aug 15 · Independence Day ──────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000019"
    name: Treasure Hunt
    category: Others
    age_group: all
    event_date: "2025-08-15"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 50
    location: Society Premises
    description: Clue-based hunt across the society. Teams of 3–5.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000020"
    name: Tug of War
    category: Sports
    age_group: all
    event_date: "2025-08-15"
    slot_time: "11:00 AM – 12:30 PM"
    max_participants: 80
    location: Main Lawn
    description: Inter-tower team competition. Teams of 8.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000021"
    name: Quiz Competition
    category: Others
    age_group: teens
    event_date: "2025-08-15"
    slot_time: "02:00 PM – 03:30 PM"
    max_participants: 30
    location: Clubhouse Hall 1
    description: General knowledge & Independence Day quiz for teens. Individual or pairs.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000022"
    name: Quiz Competition
    category: Others
    age_group: adults
    event_date: "2025-08-15"
    slot_time: "02:00 PM – 03:30 PM"
    max_participants: 30
    location: Clubhouse Hall 2
    description: General knowledge & Independence Day quiz for adults. Individual or pairs.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000023"
    name: Adult Solo Singing
    category: Cultural
    age_group: adults
    event_date: "2025-08-15"
    slot_time: "04:00 PM – 05:30 PM"
    max_participants: 20
    location: Amphitheatre
    description: Solo vocal performance, any language. 3–5 min slot. Individual.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000024"
    name: Musical Instruments
    category: Cultural
    age_group: all
    event_date: "2025-08-15"
    slot_time: "04:00 PM – 05:30 PM"
    max_participants: 25
    location: Clubhouse Hall 3
    description: Solo or ensemble instrumental performance. 5 min slot. Individual or group.
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000025"
    name: Group Singing
    category: Cultural
    age_group: all
    event_date: "2025-08-15"
    slot_time: "06:30 PM – 08:00 PM"
    max_participants: 50
    location: Amphitheatre
    description: Group vocal performance, 5–15 members. Patriotic/folk songs encouraged.
    is_active: true
---

<!--
  HOW TO ADD A NEW EVENT
  ─────────────────────
  Copy any block above, paste at the end of the list, and:
  1. Give it a new unique id  (increment the last digits, e.g. ...000026)
  2. Fill in name, age_group, event_date (YYYY-MM-DD), slot_time,
     max_participants, location, description
  3. Set is_active: true
  4. Run:  npm run sync-events
     This pushes the new event to Supabase so registrations can reference it.

  HOW TO DISABLE AN EVENT (without deleting registrations)
  ──────────────────────────────────────────────────────────
  Set  is_active: false  and run  npm run sync-events

  HOW TO CHANGE SLOT TIME, DATE, OR LOCATION
  ────────────────────────────────────────────
  Edit the values here, then run  npm run sync-events
  Changes will also reflect in the Admin › Schedule Manager.
-->
