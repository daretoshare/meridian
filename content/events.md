---
# ─── Independence Day Events 2026 ────────────────────────────────────────────
#
# Stable IDs — do NOT change once set (linked to registrations in DB).
#
# age_group:         children | teens | adults | seniors | all
# registration_type: competitive | cultural | open
# event_date:        YYYY-MM-DD
# is_team:           true → shows Team Name prompt on registration form
# is_active:         false → hidden from form without deleting DB row
#
# REGISTRATION WINDOWS
#   competitive: open now, closes July 11 2026
#   cultural:    toggle below — set to false to lock, true to open
#
# ┌──────────────────────────────────────────────────────────────┐
# │  CULTURAL REGISTRATION TOGGLE — change this to enable/disable │
# └──────────────────────────────────────────────────────────────┘
cultural_registration_open: true
#
# CONFIRMED SCHEDULE (2026)
#   19 Jul  – Running & Field Events
#   25 Jul  – Chess (evening start, continues 26 Jul)
#   2  Aug  – Treasure Hunt & Tug of War
#   8–9 Aug – Badminton (all categories, evening to morning)
#   9  Aug  – Table Tennis (all categories, morning)
#   9  Aug  – Creative Freedom (cultural, afternoon)
#   15 Aug  – Independence Day (cultural events, afternoon to evening)
# ─────────────────────────────────────────────────────────────────────────────

events:

  # ═══════════════════════════════════════════════════════════════════════════
  # CULTURAL EVENTS — toggle: cultural_registration_open (see frontmatter)
  # No participation fee. Participants must bring their own consumables.
  # ═══════════════════════════════════════════════════════════════════════════

  # ── Solo ──────────────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000004"
    name: Singing (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 30
    location: Amphitheatre
    description: Solo singing, any song. 3–4 min slot. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000005"
    name: Dance (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 30
    location: Amphitheatre
    description: Solo dance, any style. 3–5 min. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000023"
    name: Singing (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 30
    location: Amphitheatre
    description: Solo singing, any language. 3–5 min slot. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000055"
    name: Dance (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 30
    location: Amphitheatre
    description: Solo dance, any style. 3–5 min. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000007"
    name: Fancy Dress (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 35
    location: Amphitheatre
    description: Patriotic or character costume. Walk the ramp. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000056"
    name: Fashion Show – Regional Attire (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 25
    location: Amphitheatre
    description: Showcase India's diverse regional traditional attire. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000057"
    name: Stand Up Comedy
    registration_type: cultural
    age_group: all
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 15
    location: Amphitheatre
    description: Original stand-up comedy set. 5 min slot. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000024"
    name: Musical Instruments
    registration_type: cultural
    age_group: all
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 25
    location: Amphitheatre
    description: Solo instrumental performance. 5 min slot. Bring your own instrument.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000008"
    name: Musical Chair (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 25
    location: Main Lawn
    description: Fun elimination rounds for kids. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000058"
    name: Musical Chair (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 25
    location: Main Lawn
    description: Fun elimination rounds for adults. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000059"
    name: Creative Freedom for All
    registration_type: cultural
    age_group: all
    event_date: "2026-08-09"
    slot_time: "Afternoon"
    max_participants: 50
    location: Main Lawn
    description: Express yourself freely — any art, performance, or creativity. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000060"
    name: Sing Your Patriotic Song
    registration_type: cultural
    age_group: all
    event_date: "2026-08-15"
    slot_time: "After Flag Hoisting"
    max_participants: 30
    location: Main Lawn
    description: Patriotic songs to celebrate Independence Day. After the flag hoisting ceremony.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000061"
    name: Speech
    registration_type: cultural
    age_group: all
    event_date: "2026-08-15"
    slot_time: "After Flag Hoisting"
    max_participants: 10
    location: Main Lawn
    description: Short speech on a patriotic theme. 3–5 min. After the flag hoisting ceremony.
    is_team: false
    is_active: true

  # ── Group ─────────────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000006"
    name: Group Singing (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 40
    location: Amphitheatre
    description: Group vocal, 3–15 members. Any songs. Register as a group.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000025"
    name: Group Dance (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 40
    location: Amphitheatre
    description: Group choreography, 3–15 members. Register as a group.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000062"
    name: Group Singing (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 40
    location: Amphitheatre
    description: Group vocal, 3–15 members. Patriotic/folk encouraged. Register as a group.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000063"
    name: Group Dance (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "Afternoon to Evening"
    max_participants: 40
    location: Amphitheatre
    description: Group choreography, 3–15 members. Register as a group.
    is_team: true
    is_active: true

  # ═══════════════════════════════════════════════════════════════════════════
  # COMPETITIVE EVENTS — closes July 11, 2026
  # ═══════════════════════════════════════════════════════════════════════════

  # ── 19 Jul · Running & Field ───────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000026"
    name: 50m Run (Age 3 – 5)
    registration_type: competitive
    age_group: children
    event_date: "2026-07-19"
    slot_time: "10:00 AM"
    max_participants: 20
    location: Futsal Court
    description: 50-metre flat race. Heats + final. Individual. Age 3–5.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000027"
    name: 100m Run (Age 5 – 8)
    registration_type: competitive
    age_group: children
    event_date: "2026-07-19"
    slot_time: "10:00 AM"
    max_participants: 20
    location: Futsal Court
    description: 100-metre flat race. Heats + final. Individual. Age 5–8.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000028"
    name: 100m Run (Age 8 – 12)
    registration_type: competitive
    age_group: children
    event_date: "2026-07-19"
    slot_time: "10:00 AM"
    max_participants: 20
    location: Futsal Court
    description: 100-metre flat race. Heats + final. Individual. Age 8–12.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000029"
    name: Lemon Spoon Race (Age 15+)
    registration_type: competitive
    age_group: teens
    event_date: "2026-07-19"
    slot_time: "11:00 AM"
    max_participants: 20
    location: Futsal Court
    description: Classic lemon-and-spoon relay race. Team of 3. Age 15+.
    is_team: true
    is_active: true

  # ── 25–26 Jul · Chess ─────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000054"
    name: Chess (Age upto 10)
    registration_type: competitive
    age_group: children
    event_date: "2026-07-25"
    slot_time: "Evening 4pm onwards (25–26 Jul)"
    max_participants: 16
    location: Clubhouse Hall 3
    description: Swiss-format chess. Individual. Age up to 10.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000030"
    name: Chess (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-07-25"
    slot_time: "Evening 4pm onwards (25–26 Jul)"
    max_participants: 16
    location: Clubhouse Hall 3
    description: Swiss-format chess. Individual. Age 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000031"
    name: Chess (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-07-25"
    slot_time: "Evening 4pm onwards (25–26 Jul)"
    max_participants: 16
    location: Clubhouse Hall 2
    description: Swiss-format chess. Individual. Age 16 and above.
    is_team: false
    is_active: true

  # ── 2 Aug · Treasure Hunt & Tug of War ────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000019"
    name: Treasure Hunt
    registration_type: competitive
    age_group: all
    event_date: "2026-08-02"
    slot_time: "3pm onwards"
    max_participants: 50
    location: Society Premises
    description: Clue-based hunt across the society. Teams of 3–5.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000020"
    name: Tug of War
    registration_type: competitive
    age_group: all
    event_date: "2026-08-02"
    slot_time: "4:30pm onwards"
    max_participants: 80
    location: Futsal Court
    description: Inter-tower team competition. Teams of 8.
    is_team: true
    is_active: true

  # ── 8–9 Aug · Badminton Singles ───────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000032"
    name: Badminton Singles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 16
    location: Badminton Court 1
    description: Singles knockout. Individual. Girls aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000033"
    name: Badminton Singles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 16
    location: Badminton Court 2
    description: Singles knockout. Individual. Boys aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000034"
    name: Badminton Singles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 16
    location: Badminton Court 1
    description: Singles knockout. Individual. Women aged 16+.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000035"
    name: Badminton Singles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 16
    location: Badminton Court 2
    description: Singles knockout. Individual. Men aged 16+.
    is_team: false
    is_active: true

  # ── 8–9 Aug · Badminton Doubles ───────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000040"
    name: Badminton Doubles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 12
    location: Badminton Court 1
    description: Doubles knockout. Team of 2. Girls aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000041"
    name: Badminton Doubles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 12
    location: Badminton Court 2
    description: Doubles knockout. Team of 2. Boys aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000042"
    name: Badminton Doubles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 12
    location: Badminton Court 1
    description: Doubles knockout. Team of 2. Women aged 16+.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000043"
    name: Badminton Doubles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 12
    location: Badminton Court 2
    description: Doubles knockout. Team of 2. Men aged 16+.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000044"
    name: Badminton Mixed Doubles (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-08"
    slot_time: "Evening to Morning (8–9 Aug)"
    max_participants: 12
    location: Badminton Court 1
    description: Mixed doubles. Team of 1 man + 1 woman aged 16+.
    is_team: true
    is_active: true

  # ── 9 Aug · Table Tennis Singles ─────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000036"
    name: Table Tennis Singles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 16
    location: TT Hall
    description: Singles knockout. Individual. Girls aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000037"
    name: Table Tennis Singles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 16
    location: TT Hall
    description: Singles knockout. Individual. Boys aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000038"
    name: Table Tennis Singles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 16
    location: TT Hall
    description: Singles knockout. Individual. Women aged 16+.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000039"
    name: Table Tennis Singles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 16
    location: TT Hall
    description: Singles knockout. Individual. Men aged 16+.
    is_team: false
    is_active: true

  # ── 9 Aug · Table Tennis Doubles ─────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000045"
    name: Table Tennis Doubles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 12
    location: TT Hall
    description: Doubles knockout. Team of 2. Girls aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000046"
    name: Table Tennis Doubles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 12
    location: TT Hall
    description: Doubles knockout. Team of 2. Boys aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000047"
    name: Table Tennis Doubles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 12
    location: TT Hall
    description: Doubles knockout. Team of 2. Women aged 16+.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000048"
    name: Table Tennis Doubles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-09"
    slot_time: "Morning 10am onwards"
    max_participants: 12
    location: TT Hall
    description: Doubles knockout. Team of 2. Men aged 16+.
    is_team: true
    is_active: true

  # ── DEACTIVATED — kept for referential integrity ──────────────────────────

  - id: "e1000001-0000-0000-0000-000000000050"
    name: Drawing (Age 3 – 5)
    registration_type: competitive
    age_group: children
    event_date: "2026-08-13"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 30
    location: Clubhouse Hall 1
    description: Open-theme drawing. Individual. Age 3–5.
    is_team: false
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000051"
    name: Drawing (Age 5 – 8)
    registration_type: competitive
    age_group: children
    event_date: "2026-08-13"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 30
    location: Clubhouse Hall 1
    description: Open-theme drawing. Individual. Age 5–8.
    is_team: false
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000052"
    name: Drawing (Age 8 – 12)
    registration_type: competitive
    age_group: children
    event_date: "2026-08-13"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 30
    location: Clubhouse Hall 2
    description: Open-theme drawing. Individual. Age 8–12.
    is_team: false
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000053"
    name: Drawing (Age 12+)
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-13"
    slot_time: "09:00 AM – 11:00 AM"
    max_participants: 30
    location: Clubhouse Hall 2
    description: Open-theme drawing. Individual. Age 12+.
    is_team: false
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000016"
    name: Carrom
    registration_type: competitive
    age_group: all
    event_date: "2026-08-14"
    slot_time: "02:00 PM – 04:00 PM"
    max_participants: 24
    location: Clubhouse Hall 1
    description: Pairs/doubles carrom tournament. Team of 2 per entry.
    is_team: true
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000018"
    name: Volleyball
    registration_type: competitive
    age_group: all
    event_date: "2026-08-14"
    slot_time: "04:00 PM – 06:30 PM"
    max_participants: 60
    location: Main Lawn
    description: Inter-tower volleyball. Teams of 6.
    is_team: true
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000021"
    name: Quiz Competition
    registration_type: competitive
    age_group: teens
    event_date: "2026-08-15"
    slot_time: "02:00 PM – 03:30 PM"
    max_participants: 30
    location: Clubhouse Hall 1
    description: General knowledge quiz. Individual or pairs.
    is_team: false
    is_active: false

  - id: "e1000001-0000-0000-0000-000000000022"
    name: Quiz Competition
    registration_type: competitive
    age_group: adults
    event_date: "2026-08-15"
    slot_time: "02:00 PM – 03:30 PM"
    max_participants: 30
    location: Clubhouse Hall 2
    description: General knowledge quiz. Individual or pairs.
    is_team: false
    is_active: false
---

<!--
  HOW TO ADD A NEW EVENT
  ─────────────────────
  1. Copy any active block, paste at the end, give it the next sequential id
  2. Set registration_type: competitive OR cultural
  3. Set is_team: true if participants register as a group/pair
  4. Set is_active: true
  5. Run: npm run sync-events

  HOW TO DISABLE WITHOUT DELETING
  ─────────────────────────────────
  Set is_active: false, then sync.
-->
