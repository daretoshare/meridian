---
# ─── Independence Day Events ──────────────────────────────────────────────────
#
# Each event needs a stable `id` (UUID). Once set, do NOT change it —
# it links to registrations stored in the database.
#
# age_group options: children | teens | adults | seniors | all
# is_active: set to false to hide an event without deleting it
#
# ─────────────────────────────────────────────────────────────────────────────

events:
  - id: "e1000001-0000-0000-0000-000000000001"
    name: Painting Competition
    age_group: children
    slot_time: "09:00 AM – 10:30 AM"
    max_participants: 25
    location: Clubhouse Hall 1
    description: Open theme painting for kids aged 4–12
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000002"
    name: Painting Competition
    age_group: teens
    slot_time: "11:00 AM – 12:30 PM"
    max_participants: 25
    location: Clubhouse Hall 1
    description: Open theme painting for teens aged 13–18
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000003"
    name: Chess Tournament
    age_group: adults
    slot_time: "10:00 AM – 01:00 PM"
    max_participants: 16
    location: Clubhouse Hall 2
    description: Swiss-format chess tournament for adults
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000004"
    name: Chess Tournament
    age_group: seniors
    slot_time: "03:00 PM – 05:00 PM"
    max_participants: 16
    location: Clubhouse Hall 2
    description: Friendly chess for residents 60+
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000005"
    name: Badminton (Singles)
    age_group: teens
    slot_time: "07:00 AM – 09:00 AM"
    max_participants: 20
    location: Badminton Court 1
    description: Singles knockout for teens
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000006"
    name: Badminton (Singles)
    age_group: adults
    slot_time: "07:00 AM – 09:00 AM"
    max_participants: 20
    location: Badminton Court 2
    description: Singles knockout for adults
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000007"
    name: Badminton (Doubles)
    age_group: adults
    slot_time: "05:00 PM – 07:00 PM"
    max_participants: 24
    location: Badminton Court 1
    description: Doubles tournament for adults
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000008"
    name: Cultural Programme
    age_group: all
    slot_time: "06:30 PM – 09:00 PM"
    max_participants: 200
    location: Main Lawn
    description: Song, dance, and skit performances
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000009"
    name: Tug of War
    age_group: all
    slot_time: "04:00 PM – 05:00 PM"
    max_participants: 40
    location: Main Lawn
    description: Inter-tower team competition
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000010"
    name: Independence Day Quiz
    age_group: teens
    slot_time: "02:00 PM – 03:30 PM"
    max_participants: 30
    location: Clubhouse Hall 1
    description: History and general knowledge quiz
    is_active: true
---

<!--
  HOW TO ADD A NEW EVENT
  ─────────────────────
  Copy any block above, paste at the end of the list, and:
  1. Give it a new unique id  (increment the last digits, e.g. ...000011)
  2. Fill in name, age_group, slot_time, max_participants, location, description
  3. Set is_active: true
  4. Run:  npm run sync-events
     This pushes the new event to Supabase so registrations can reference it.

  HOW TO DISABLE AN EVENT (without deleting registrations)
  ──────────────────────────────────────────────────────────
  Set  is_active: false  and run  npm run sync-events

  HOW TO CHANGE SLOT TIME OR LOCATION
  ────────────────────────────────────
  Edit the values here, then run  npm run sync-events
  Changes will also reflect in the Admin › Schedule Manager.
-->
