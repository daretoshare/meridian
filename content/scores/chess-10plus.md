---
title: "Chess Tournament — Age 10+"
subtitle: "9 Players | Two Groups Round-Robin → Semifinals → Final"
sport: chess
status: upcoming
live_stream_url: "https://www.youtube.com/live/CHESS_STREAM_PLACEHOLDER"
event_date: "2026-07-26"

time_controls:
  groups: "5+5 Blitz"
  semifinals: "5+5 Blitz"
  final: "Rapid 15+10"
  third_place: "Rapid 15+10"

scoring:
  win: 1
  draw: 0.5
  loss: 0
  bye: 1

tiebreaks:
  - Head-to-head
  - Sonneborn-Berger
  - Most wins

participants:
  - name: "Arshit"
    location: "Building 5 - Tower 4"
    apt: "54183"
  - name: "Amit Kumar"
    location: "Building 5 - Tower 7"
    apt: "57081"
  - name: "Aarav Jain"
    location: "Building 5 - Tower 8"
    apt: "58033"
  - name: "Aarush Pradish"
    location: "Building 5 - Tower 9"
    apt: "59033"
  - name: "Arjun Madiraju"
    location: "Building 5 - Tower 9"
    apt: "59273"
  - name: "Nisha Bansal"
    location: "Building 6 - Tower 5"
    apt: "65094"
  - name: "Samaira Agrawal"
    location: "Building 6 - Tower 5"
    apt: "65094"
  - name: "Tanmay Gupta"
    location: "Building 5 - Tower 10"
    apt: "510114"
  - name: "Yuvika Gupta"
    location: "Building 5 - Tower 10"
    apt: "510114"

groups:
  A: ["Arshit", "Aarush Pradish", "Arjun Madiraju", "Tanmay Gupta", "Yuvika Gupta"]
  B: ["Amit Kumar", "Aarav Jain", "Nisha Bansal", "Samaira Agrawal"]

schedule:
  group_a:
    - round: 1
      bye: "Arshit"
      games:
        - { white: "Aarush Pradish", black: "Yuvika Gupta", result: null }
        - { white: "Arjun Madiraju", black: "Tanmay Gupta", result: null }
    - round: 2
      bye: "Tanmay Gupta"
      games:
        - { white: "Yuvika Gupta", black: "Arjun Madiraju", result: null }
        - { white: "Arshit", black: "Aarush Pradish", result: null }
    - round: 3
      bye: "Aarush Pradish"
      games:
        - { white: "Arjun Madiraju", black: "Arshit", result: null }
        - { white: "Tanmay Gupta", black: "Yuvika Gupta", result: null }
    - round: 4
      bye: "Yuvika Gupta"
      games:
        - { white: "Arshit", black: "Tanmay Gupta", result: null }
        - { white: "Aarush Pradish", black: "Arjun Madiraju", result: null }
    - round: 5
      bye: "Arjun Madiraju"
      games:
        - { white: "Tanmay Gupta", black: "Aarush Pradish", result: null }
        - { white: "Yuvika Gupta", black: "Arshit", result: null }

  group_b:
    - round: 1
      games:
        - { white: "Amit Kumar", black: "Samaira Agrawal", result: null }
        - { white: "Aarav Jain", black: "Nisha Bansal", result: null }
    - round: 2
      games:
        - { white: "Samaira Agrawal", black: "Nisha Bansal", result: null }
        - { white: "Amit Kumar", black: "Aarav Jain", result: null }
    - round: 3
      games:
        - { white: "Aarav Jain", black: "Samaira Agrawal", result: null }
        - { white: "Nisha Bansal", black: "Amit Kumar", result: null }

knockout:
  semifinals:
    - id: sf1
      label: "SF1: Winner A vs Runner-up B"
      player1: null
      player2: null
      result: null
    - id: sf2
      label: "SF2: Winner B vs Runner-up A"
      player1: null
      player2: null
      result: null
  final:
    label: "Final — Rapid 15+10"
    player1: null
    player2: null
    result: null
  third_place:
    label: "3rd Place — Rapid 15+10"
    player1: null
    player2: null
    result: null
---

## Rules & Format

### Group Stage
- Round-robin within each group (everyone plays everyone once)
- Group A: 5 players → 10 games across 5 rounds (1 bye per round)
- Group B: 4 players → 6 games across 3 rounds (no byes)
- Both groups play in parallel; Group B players take a break during Group A's rounds 4–5
- Time control: **5 minutes + 5 seconds increment (Blitz)**
- Scoring: Win = 1 pt, Draw = ½ pt, Loss = 0, Bye = 1 pt
- Tiebreaks: Head-to-head → Sonneborn-Berger → Most wins

### Knockout Stage
- Top 2 from each group advance: A1, A2, B1, B2
- **Semifinals** (5+5 Blitz): Best-of-2; Armageddon tiebreak if tied
- **Final & 3rd Place** (Rapid 15+10): Best-of-2; Armageddon tiebreak if tied
