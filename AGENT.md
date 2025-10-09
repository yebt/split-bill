# AGENT

## Overview

This application manages groups of friends (“squads”), splits bills, and tracks expenses in social gatherings.  
The goal is to make splitting costs easier and reduce mistakes in group settings.

- **Mobile first** design, but should work well on both mobile and desktop.
- Works fully **offline** using `localStorage` (or `IndexedDB` in the future).
- **No login and no backend**. Everything is local to the device.
- Supports **import/export** of data across devices.
- Users can **duplicate a squad** to avoid rebuilding from scratch.

---

## Domain Model

### Squad

A “squad” represents a social context (e.g., a trip, a dinner).

- Always contains **at least one group** by default.
- Has a **unique name** across the entire application.
- Can be duplicated. Duplication copies groups and people but **does not copy bills**.
- Attributes:
  - `id`
  - `name` (unique globally)
  - `groups[]`
  - `bills[]`

### Group

A group belongs to a single squad.

- The **group name is unique inside its squad** but may be reused in other squads.
- Each group can have a color to distinguish them in the UI.
- Colors: start with a predefined palette, allow adding custom colors if needed.
- Attributes:
  - `id`
  - `name`
  - `color`
  - `people[]`

### Person

A person always belongs to a group inside a squad.

- The **name of a person must be unique inside the squad**, avoiding duplicates in large groups.
- A person can exist in multiple squads with no restriction.
- A person can be active or inactive in a squad. Inactive people don’t participate in bill splits.
- A person can be moved between groups inside the same squad.
- Attributes:
  - `id`
  - `name` (unique per squad)
  - `active` (boolean)

### Bill

A bill belongs to a squad.

- There are **two bill types**:
  - **Equal** → splits the total evenly among active participants, excluding exonerated people.
  - **Distributed** → people select their consumed products, and any remaining amount is split equally among active non-exonerated people.
- A person can be **exonerated per bill** (temporary, not permanent).
- Bills support **shared products** (a single product can be split across multiple people).
- Decimal handling → amounts are rounded to the nearest decimal, not necessarily integers.
- Bills are saved and visible in the history of the squad.
- Attributes:
  - `id`
  - `squadId`
  - `type` (equal | distributed)
  - `products[]`
  - `exoneratedPeople[]`
  - `createdAt`

### Product

Represents an item in a bill.

- A product can be fully assigned to one person or shared among several.
- Attributes:
  - `id`
  - `name`
  - `quantity`
  - `price`
  - `assignedTo[]` (list of person IDs)

---

## Features

### F1 - Squad, Groups, and People Management

- CRUD squads (create, list, edit, delete).
- Duplicate squad (copies groups and people, no bills).
- CRUD groups within a squad.
- CRUD people within a group.
- Mark people as active/inactive per squad.
- Move people between groups.
- Counters at squad level:
  - Total people.
  - Active people.

### F2 - Bills Management

- Create bills inside a squad.
- Two modes of splitting:
  - Equal.
  - Distributed.
- Exonerate people from paying per bill.
- Assign products to people (supports shared assignment).
- Real-time calculation of bill splits.
- Bill creation modes:
  - Manual (add product one by one with name, quantity, and price).
  - From image (future: OCR with Gemini, for now just store the photo).

### Reporting

- Bill summary per squad.
- Show who owes how much.
- Export/share results to WhatsApp in:
  - Text format (copy-paste friendly).
  - Image format (shareable in chats).

---

## Functional Requirements

- Mobile-first design.
- Dark mode and light mode.
- Custom modal component (no native confirm).
- Optimized UX/UI (clear colors and flows).
- Local storage persistence with **Repository Pattern** to allow future DB migration.
- Import/export squads and bills (e.g., JSON file).
- Real-time calculation for bill splitting.

---

## Non-Functional Requirements

- Clean architecture with repository pattern.
- Support for future persistence with DB.
- Correct decimal handling.
- No login or authentication.

---

## Future Enhancements (TODO)

- OCR integration for bills (e.g., with Gemini).
- More export options (PDF, CSV).
- Multi-language support.
