#!/bin/sh
# Wipes the emulator's fake users and data so the e2e test starts clean.
curl -s -X DELETE "http://127.0.0.1:8085/emulator/v1/projects/demo-prepdash/databases/(default)/documents" >/dev/null
curl -s -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/demo-prepdash/accounts" >/dev/null
