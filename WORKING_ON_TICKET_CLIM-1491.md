# WORKING ON TICKET CLIM-1491

Ephemeral. This file sits in a commit that Renoir reverts before review. It gives an agent the facts it needs on every frontend session in this repo, so that Renoir does not explain them again.

## Current ticket

CLIM-1491: on S2D decadal frequencies, the Time Periods slider thumb becomes a pill that covers half of the track.

- Ticket doc: [[LLM-Context-ClimateData-Ticket-CLIM-1491#English Ticket Description]].
- Work state, decisions, findings and the session-2 prompt: the Context-Fabric workspace `PAI_For_Renoir/Context-Fabric/repo/per-machine/work-at-luqia-for-research/sessions/2026100101-ClimateData-CLIM-1491/`. Read its `RESUME.md` first.
- Commits named `WIP<n>` hold ticket code while Renoir iterates. He squashes them into one commit only once the ticket work is really closed. See [[LLM-Context-Programming-Convention-GitHistoryChangeset#Commit Message Prefix Grammar]].

## Ladle

- Ladle runs with `./dev.sh ladle-apps` in the herdr tab labelled `ladle-apps`. An agent may restart it there, with `herdr pane` commands on that tab's pane. Never start a second Ladle anywhere else.
- Pages: <http://localhost:61000>. A story URL is `?story=<title-path>--<kebab-export-name>`, for example `?story=sidebar-menu-items--time-periods-control--decadal-pill-thumb-container-units`. A title change changes every story ID.
- Story args go in the URL as `&arg-<name>=<value>`.
- Live reload needs `LADLE_HMR_PORT` in the developer's `compose.override.yaml`. See `docs/developing-with-ladle.md`.
- `apps/.ladle/components.tsx` wraps every story in the Redux store and `LocaleProvider`. A story that renders a real sidebar control also needs a `ClimateVariableContext.Provider` and seeded store state.

## Browser checks (claude-in-chrome)

- Load the tools in one ToolSearch call. Call `tabs_context_mcp` first. Work in a new tab of the extension's group. The extension cannot reach Renoir's own tabs.
- Measure layout with `getBoundingClientRect` through `javascript_tool`. Screenshots can time out. Stop after one retry.

## Sources and dependencies

- `apps/node_modules` reads are denied. Read a package's source from unpkg at the installed version (see `apps/package-lock.json`).
- Synthetic data for stories and tests goes in a sibling `<name>.examples.ts` file. See [[LLM-Context-ClimateData-Programming#Examples File Pattern]].
- Before any code edit, read the docs that [[LLM-Context-Programming-Focus-Rules#⚠️ GATE: Read Full Conventions Before Code Changes]] requires.
