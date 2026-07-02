---
# ─── Independence Day Events 2026 ────────────────────────────────────────────
#
# Stable IDs — do NOT change once set (linked to registrations in DB).
#
# age_group:         children | teens | adults | seniors | all
# registration_type: competitive | cultural
# is_team:           true → shows Team Name prompt on registration form
# is_active:         true (all events are active; deactivate only if truly removed)
#
# ┌───────────────────────────────────────────────────────────────────────────┐
# │  REGISTRATION TOGGLES — flip these to open / close each category          │
# └───────────────────────────────────────────────────────────────────────────┘
competitive_registration_status: open     # pending | open | closed
cultural_registration_status: pending     # pending | open | closed

#
# SCHEDULE
#   Competitive events: weekends of 25–26 Jul and 8–9 Aug
#   Cultural events:    15 Aug (Independence Day), except Creative Freedom (8–9 Aug)
# ─────────────────────────────────────────────────────────────────────────────

events:

  # ═══════════════════════════════════════════════════════════════════════════
  # COMPETITIVE EVENTS
  # Ordered: Running → Chess → Badminton Singles → Doubles → Mixed →
  #          Table Tennis Singles → Doubles → Mixed → Treasure Hunt (last)
  # ═══════════════════════════════════════════════════════════════════════════

  # ── Running ───────────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000069"
    name: Toddlers Race
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: Fun dash for toddlers. Individual. Age 1–3.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000026"
    name: 50m Run (Age 3 – 5)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: 50-metre flat race. Individual. Age 3–5.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000027"
    name: 100m Run (Age 5 – 8)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: 100-metre flat race. Individual. Age 5–8.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000028"
    name: 100m Run (Age 8 – 12)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: 100-metre flat race. Individual. Age 8–12.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000066"
    name: Lemon Spoon Race (Age 3 – 5)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: Classic lemon-and-spoon race. Individual. Age 3–5.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000067"
    name: Lemon Spoon Race (Age 5 – 8)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: Classic lemon-and-spoon race. Individual. Age 5–8.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000068"
    name: Lemon Spoon Race (Age 8 – 15)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: Classic lemon-and-spoon race. Individual. Age 8–15.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000029"
    name: Lemon Spoon Race (Age 15+)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 20
    location: ""
    description: Classic lemon-and-spoon race. Individual. Age 15+.
    is_team: false
    is_active: true

  # ── Chess ─────────────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000054"
    name: Chess (Age upto 10)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Swiss-format chess. Individual. Age up to 10.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000064"
    name: Chess (Age 10+)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Swiss-format chess. Individual. Age 10 and above.
    is_team: false
    is_active: true

  # ── Badminton Singles ─────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000070"
    name: Badminton Singles – Girls (Age 5 – 10)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Girls aged 5–10.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000071"
    name: Badminton Singles – Boys (Age 5 – 10)
    registration_type: competitive
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Boys aged 5–10.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000032"
    name: Badminton Singles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Girls aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000033"
    name: Badminton Singles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Boys aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000034"
    name: Badminton Singles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Women aged 16+.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000035"
    name: Badminton Singles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Men aged 16+.
    is_team: false
    is_active: true

  # ── Badminton Doubles ─────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000040"
    name: Badminton Doubles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Girls aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000041"
    name: Badminton Doubles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Boys aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000042"
    name: Badminton Doubles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Women aged 16+.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000043"
    name: Badminton Doubles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Men aged 16+.
    is_team: true
    is_active: true

  # ── Badminton Mixed Doubles ───────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000044"
    name: Badminton Mixed Doubles (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Mixed doubles. Team of 1 man + 1 woman aged 16+.
    is_team: true
    is_active: true

  # ── Table Tennis Singles ──────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000036"
    name: Table Tennis Singles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Girls aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000037"
    name: Table Tennis Singles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Boys aged 10–16.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000038"
    name: Table Tennis Singles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Women aged 16+.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000039"
    name: Table Tennis Singles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 16
    location: ""
    description: Singles knockout. Individual. Men aged 16+.
    is_team: false
    is_active: true

  # ── Table Tennis Doubles ──────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000045"
    name: Table Tennis Doubles – Girls (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Girls aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000046"
    name: Table Tennis Doubles – Boys (Age 10 – 16)
    registration_type: competitive
    age_group: teens
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Boys aged 10–16.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000047"
    name: Table Tennis Doubles – Women (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Women aged 16+.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000048"
    name: Table Tennis Doubles – Men (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Doubles knockout. Team of 2. Men aged 16+.
    is_team: true
    is_active: true

  # ── Table Tennis Mixed Doubles ────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000065"
    name: Table Tennis Mixed Doubles (Age 16+)
    registration_type: competitive
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 12
    location: ""
    description: Mixed doubles. Team of 1 man + 1 woman aged 16+.
    is_team: true
    is_active: true

  # ── Treasure Hunt (last in competitive) ───────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000019"
    name: Treasure Hunt
    registration_type: competitive
    age_group: all
    event_date: null
    slot_time: ""
    max_participants: 50
    location: ""
    description: Clue-based hunt across the society. Teams of 3–5.
    is_team: true
    is_active: true

  # ═══════════════════════════════════════════════════════════════════════════
  # CULTURAL EVENTS — 15 Aug (Independence Day), except Creative Freedom (8–9 Aug)
  # No participation fee. Participants must bring their own consumables / props.
  # Ordered: Group Dance → Group Singing → Solo Dance → Solo Singing →
  #          Fancy Dress → Fashion Show → Musical Instruments →
  #          Musical Chair → Tug of War → Creative Freedom → Flag Hoisting events
  # ═══════════════════════════════════════════════════════════════════════════

  # ── Group Dance ───────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000025"
    name: Group Dance (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 40
    location: ""
    description: Group choreography, 3–15 members. Register as a group.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000063"
    name: Group Dance (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 40
    location: ""
    description: Group choreography, 3–15 members. Register as a group.
    is_team: true
    is_active: true

  # ── Group Singing ─────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000006"
    name: Group Singing (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 40
    location: ""
    description: Group vocal, 3–15 members. Any songs. Register as a group.
    is_team: true
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000062"
    name: Group Singing (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 40
    location: ""
    description: Group vocal, 3–15 members. Patriotic/folk encouraged. Register as a group.
    is_team: true
    is_active: true

  # ── Solo Dance ────────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000005"
    name: Dance (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 30
    location: ""
    description: Solo dance, any style. 3–5 min. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000055"
    name: Dance (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 30
    location: ""
    description: Solo dance, any style. 3–5 min. Individual.
    is_team: false
    is_active: true

  # ── Solo Singing ──────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000004"
    name: Singing (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 30
    location: ""
    description: Solo singing, any song. 3–4 min slot. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000023"
    name: Singing (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 30
    location: ""
    description: Solo singing, any language. 3–5 min slot. Individual.
    is_team: false
    is_active: true

  # ── Fancy Dress & Fashion ─────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000007"
    name: Fancy Dress (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 35
    location: ""
    description: Patriotic or character costume. Walk the ramp. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000056"
    name: Fashion Show – Regional Attire (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 25
    location: ""
    description: Showcase India's diverse regional traditional attire. Individual.
    is_team: false
    is_active: true

  # ── Musical Instruments ───────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000024"
    name: Musical Instruments
    registration_type: cultural
    age_group: all
    event_date: null
    slot_time: ""
    max_participants: 25
    location: ""
    description: Solo instrumental performance. 5 min slot. Bring your own instrument.
    is_team: false
    is_active: true

  # ── Musical Chair ─────────────────────────────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000008"
    name: Musical Chair (Age Till 15)
    registration_type: cultural
    age_group: children
    event_date: null
    slot_time: ""
    max_participants: 25
    location: ""
    description: Fun elimination rounds for kids. Individual.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000058"
    name: Musical Chair (Age 15+)
    registration_type: cultural
    age_group: adults
    event_date: null
    slot_time: ""
    max_participants: 25
    location: ""
    description: Fun elimination rounds for adults. Individual.
    is_team: false
    is_active: true

  # ── Tug of War (moved from competitive) ───────────────────────────────────

  - id: "e1000001-0000-0000-0000-000000000020"
    name: Tug of War
    registration_type: cultural
    age_group: all
    event_date: null
    slot_time: ""
    max_participants: 80
    location: ""
    description: Inter-tower team competition. Teams of 8.
    is_team: true
    is_active: true

  # ── Creative Freedom (8–9 Aug, a week before Independence Day) ────────────

  - id: "e1000001-0000-0000-0000-000000000059"
    name: Express Your Creative Freedom
    registration_type: cultural
    age_group: all
    event_date: "2026-08-09"
    slot_time: ""
    max_participants: 50
    location: ""
    description: Drawing, painting, craft, or any creative expression. No age bar. A week prior to 15th Aug.
    is_team: false
    is_active: true

  # ── Flag Hoisting Events (15 Aug, immediately after ceremony) ────────────

  - id: "e1000001-0000-0000-0000-000000000060"
    name: Sing Your Patriotic Song
    registration_type: cultural
    age_group: all
    event_date: "2026-08-15"
    slot_time: "After Flag Hoisting"
    max_participants: 30
    location: ""
    description: Patriotic songs immediately after the flag hoisting ceremony on 15th Aug.
    is_team: false
    is_active: true

  - id: "e1000001-0000-0000-0000-000000000061"
    name: Patriotic Motivational Speech
    registration_type: cultural
    age_group: all
    event_date: "2026-08-15"
    slot_time: "After Flag Hoisting"
    max_participants: 10
    location: ""
    description: Short patriotic speech immediately after the flag hoisting ceremony on 15th Aug. 3–5 min.
    is_team: false
    is_active: true
---

<!--
  HOW TO OPEN / CLOSE REGISTRATION
  ─────────────────────────────────
  Edit the toggles at the top of this file:
    competitive_registration_open: true   ← set false to lock competitive
    cultural_registration_open:    true   ← set false to lock cultural

  HOW TO ADD A NEW EVENT
  ─────────────────────
  1. Copy any active block, paste at the end of the right section
  2. Give it the next sequential ID (increment last digits)
  3. Set is_active: true
  4. Run: npm run sync-events
-->
