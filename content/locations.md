---
# ─── Venue Locations ──────────────────────────────────────────────────────────
#
# These locations appear in the dropdown when admins edit an event.
# Add, rename, or remove entries freely — no sync needed, changes are live
# the next time the admin page loads.
#
# Each entry:
#   name:     Display label shown in the dropdown and on the registration form
#   capacity: Optional note shown next to the location (informational only)
#
# ─────────────────────────────────────────────────────────────────────────────

locations:
  - name: Clubhouse Hall 1
    capacity: "Seats ~50"

  - name: Clubhouse Hall 2
    capacity: "Seats ~50"

  - name: Clubhouse Hall 3
    capacity: "Seats ~30"

  - name: Badminton Court 1
    capacity: "Singles / Doubles"

  - name: Badminton Court 2
    capacity: "Singles / Doubles"

  - name: Badminton Court 3
    capacity: "Singles / Doubles"

  - name: Main Lawn
    capacity: "Open area ~500"

  - name: Swimming Pool Area
    capacity: "Poolside seating"

  - name: Gym Hall
    capacity: "Seats ~40"

  - name: Terrace Garden
    capacity: "Open terrace"

  - name: Children's Play Area
    capacity: "Outdoor"

  - name: Parking Lot (Zone A)
    capacity: "Open ground"

  - name: Amphitheatre
    capacity: "Open ground"


---



<!--
  HOW TO ADD A LOCATION
  ─────────────────────
  - Add a new  `- name: ...`  entry under locations:
  - Restart the dev server (or redeploy) — no database sync needed.

  HOW TO REMOVE A LOCATION
  ─────────────────────────
  - Delete the entry. Events already assigned to that location keep their
    saved value; the old name simply won't appear in the dropdown for new edits.
-->
