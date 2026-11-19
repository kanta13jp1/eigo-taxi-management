# Reviewer frontend integration check

Run with Node 24 from the repository root:

```powershell
node tests/reviewer-ui/run.mjs outputs/reviewer-frontend-NEW-RUN
```

The output directory must not already exist. The script builds the real App into that new directory, substitutes a synthetic identity and in-memory GAS responses, and serves it on an ephemeral localhost port. HTTP and WebSocket traffic outside that server is blocked. It never authenticates a real Google user or writes a Google Sheet/Calendar.

Eight checks exercise the restricted administrator/parent portals, fixed historical-date completion through the actual UI, balance 5→4→2→12 with reload, logout, full administrator account management, and the exact boolean capability gate. Existing reviewer records remain visible when the capability is unavailable, but cannot be saved as reviewer in that state. A normal full administrator can change the role or remove that registration.

`results.json` records source hashes, browser version, PASS/FAIL results, unexpected network attempts, browser errors and source changes during the run. Screenshots are saved for each check. These are local synthetic integration results, not live Google acceptance results or customer acceptance completion.

The separate API contract suite is `scripts/test_portals.cjs`. Set `EIGO_TEST_OUTPUT_DIR` to a fresh output directory to preserve earlier records.
