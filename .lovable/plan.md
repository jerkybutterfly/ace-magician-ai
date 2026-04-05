

## Fix: Cloud AI "Failed to fetch" Error

### What happened
The backend function (chat) wasn't deployed, so Cloud AI requests were returning 404 errors. I've already deployed it and verified it works — Cloud AI now responds correctly.

### Remaining fix needed
The error message in the chat always says "Make sure Ollama is running" even when using Cloud AI. This is confusing on mobile.

### Plan

**1. Update error message in `src/pages/Chat.tsx`**
- Make the catch block provider-aware
- When `provider === 'cloud'`: show "Cloud AI error: [message]. Please try again."
- When `provider === 'ollama'`: keep "Make sure Ollama is running."

This is a one-line change in the catch block (~line 113).

