# Architecture rules
- Local tool integrations use the configured mini PC helper, not cloud execution, so software runs on the user's own hardware.
- Artemis setup runs as a detached Windows process with a log and completion marker because the helper's terminal requests have a short execution timeout.