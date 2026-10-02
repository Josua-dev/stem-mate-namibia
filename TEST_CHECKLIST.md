# TEST_CHECKLIST.md — STEMMate Namibia v1.0.0

Manual QA checklist for the offline-first planning app. Every case lists the
steps, the expected result, and a Pass/Fail column to record execution.

Automated coverage: 39 Vitest unit tests pass (`npx vitest run`) covering the
kit clash logic, the privacy validator and the sync queue storage logic.
Cases marked **(unit test)** are verified automatically.

Run the app: `npm install && npm run dev`, then open the printed localhost URL.

| # | Area | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| 1 | Navigation | Click each sidebar link (Dashboard, Activities, Plans, Sync Queue, Kits, Settings). Press the ☰/✕ toggle in the top bar. | Each page opens with its own heading; focus moves to the page heading. Toggle hides/shows the sidebar; hidden on small screens. | ☐ Pass ☐ Fail |
| 2 | Search | On Activities, type "water" in the search box, then a nonsense term like "zzz". | Results narrow to matching activities; a nonsense term shows an empty state with recovery guidance ("Try adjusting your search or filter criteria"). | ☐ Pass ☐ Fail |
| 3 | Filters | Set Level = Primary and Duration = 90 minutes, then reset both to All. | Only matching activities show; the count line updates ("Showing X of 8 activities"); clearing restores the full list. | ☐ Pass ☐ Fail |
| 4 | Offline saving | On Activities, press "Save Offline" on an activity. Toggle offline (Settings → connection simulation, or DevTools). | Button flips to "✓ Saved", the card shows "Available offline ✓", and the offline counter at the bottom increments. Saved activities stay usable while offline. | ☐ Pass ☐ Fail |
| 5 | Plan creation | On Plans, press "+ New Plan", fill a title, pick an activity, set participants, press "Complete Plan". | Plan card appears with a green "Final" chip and the correct activity, duration and participant count; the Dashboard "Completed plans" count increments. | ☐ Pass ☐ Fail |
| 6 | Draft recovery | Create a draft (do not complete). Reload the browser (F5), close and reopen the browser tab. | The draft is still listed with a yellow "Draft" chip. Opening it via Edit restores all fields. Drafts survive refresh and restart. | ☐ Pass ☐ Fail |
| 7 | Auto-save | In the plan form, type a title and pause. | The indicator changes from "Draft saves automatically as you type" to "Draft saved at [time] — keeps saving as you type". Recent-activity log gains only one "Created plan" entry, not one per keystroke. | ☐ Pass ☐ Fail |
| 8 | Sync queue (offline) | Complete a plan while offline (toggle offline first). Open Sync Queue. | The plan appears with "⚠ Pending", its creation time, and the Pending count is 1. Sync Now is disabled and explains why while offline. | ☐ Pass ☐ Fail |
| 9 | Synchronisation | Toggle back online while the Sync Queue page is open. | Auto-sync runs; synced items are removed from the queue automatically; a summary announces "✅ N plans synced successfully". Statuses update without re-entering any plan. | ☐ Pass ☐ Fail |
| 10 | Sync retry (failed state) | Queue several plans and press Sync Now repeatedly (the simulated network fails ~10% of the time) until an item fails. | Failed items show "❌ Failed" with a retry count; pressing Retry re-queues them; the summary names the failure count and points to Retry. | ☐ Pass ☐ Fail |
| 11 | Kit clashes | On Kits, request "Microscope Kit" for a date. Request the same kit for the same date again. | The first request saves. The second shows "⚠ Clash Detected" naming the kit, date and existing facilitator, and the duplicate is blocked. | ☐ Pass ☐ Fail |
| 12 | Kit clash (different date) | Request the same kit for a different date. | No clash warning; the request saves. | ☐ Pass ☐ Fail |
| 13 | Kit return views | Press "Mark Returned" on a current request. Check Current and Returned tabs. | The request moves to the Returned tab with a returned time; Current count decrements; tabs show separate counts. | ☐ Pass ☐ Fail |
| 14 | Privacy validation | In any form, type pupil data text (e.g. description "Write each pupil name on the sheet", or notes "ID: 20230123") and save. | The save is blocked with a visible warning naming the violation (⚠ Cannot save / Privacy Check Failed). Legitimate content ("Students record their observations", "150 learners attended") saves normally. | ☐ Pass ☐ Fail (unit test) |
| 15 | Accessibility — keyboard | Tab from the address bar through the app. Open a dialog, press Tab/Shift+Tab repeatedly, then Escape. | A skip link appears first; all controls are reachable in order; a visible focus ring shows on every control; focus is trapped inside open dialogs (with Escape available) and returns to the trigger on close. | ☐ Pass ☐ Fail |
| 16 | Accessibility — screen reader statuses | Toggle online/offline and complete a sync with a screen reader or by inspecting the live regions. | Status changes are announced: the connection chip and sync summary sit in aria-live/role=status regions; errors use role=alert. | ☐ Pass ☐ Fail |
| 17 | Accessibility — zoom & reflow | Zoom to 200% and narrow the window to 320px wide. | No horizontal scrolling; cards stack to one column; all text remains readable; the sidebar is collapsed by default below 768px. | ☐ Pass ☐ Fail |
| 18 | Export | On Settings, press "Export data (JSON)" and open the downloaded file. | A JSON file downloads containing savedActivities, plans, kitRequests, syncQueue, settings and recentActivity. | ☐ Pass ☐ Fail |
| 19 | Reset | On Settings, press "Reset all data" and confirm in the dialog ("Reset all data" / "Keep my data"). | An accessible confirmation dialog opens (Escape cancels). Confirming clears all saved data and restores defaults; cancelling keeps everything. | ☐ Pass ☐ Fail |
| 20 | Sign out (shared device) | Press "Sign out" on Settings. | Facilitator names and activity logs are cleared; unsynced plans are kept; the app returns to the entry state. | ☐ Pass ☐ Fail |
| 21 | Dark mode & font size | Toggle dark mode; cycle font size (Base/Large/XL). | Surfaces, cards and status chips switch to a dark scheme with readable contrast; text scales up across every page. | ☐ Pass ☐ Fail |
| 22 | Error resilience | (Optional, DevTools) Temporarily break a page module or trigger a render error. | The error boundary shows calm recovery guidance ("Your saved activities, plans and requests are safe on this device") with a working "Try again" button — no blank screen. | ☐ Pass ☐ Fail |
| 23 | Empty states | Clear all data (Settings → Reset), then visit each page. | Every page shows a helpful empty state with a next action (e.g. Plans → "Create your first session plan"). | ☐ Pass ☐ Fail |
| 24 | Version label | Scroll to the footer on any page. | "STEMMate Namibia v1.0.0 — offline-first planning for Namibian STEM education" is visible. | ☐ Pass ☐ Fail |
