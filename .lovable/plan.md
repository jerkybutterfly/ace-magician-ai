

# Show Chain-of-Thought in Chat Messages

## What This Does
When the AI model "thinks" before responding, you'll see a collapsible "Thinking..." section above the actual response, showing the model's internal reasoning process.

## How It Works

**Ollama models** (like Gemma, DeepSeek, QwQ) can return a `thinking` field in their streaming response JSON. Cloud/Google providers can return thinking via `choices[0].delta.reasoning_content` or similar fields. We'll capture these and display them separately.

## Changes

### 1. Update `ChatMessage` type (`src/lib/ollama.ts`)
Add an optional `thinking` field to the `ChatMessage` interface.

### 2. Update all 4 streaming functions (`src/lib/ollama.ts`)
- **Ollama `streamChat`**: Yield structured objects instead of plain strings — separate `thinking` content (from `json.message.thinking` or `<think>...</think>` tags) from regular content.
- **Cloud `streamCloudChat`**: Parse `reasoning_content` from delta if present.
- **Google `streamGoogleChat`**: Same pattern.
- **LM Studio `streamLMStudioChat`**: Same pattern.

The streamers will yield `{ content?: string; thinking?: string }` chunks instead of plain strings.

### 3. Update `Chat.tsx` streaming logic
- Track `streamedThinking` state alongside `streamedContent`.
- Accumulate thinking and content separately from the new structured chunks.
- Pass thinking content to `ChatMessageBubble` and save it in the conversation message.

### 4. Update `ChatMessageBubble` component (`src/components/ChatMessage.tsx`)
- Add a collapsible "Thinking" section using the Collapsible component.
- Shows a `<Brain>` icon with "Thinking..." label that expands to reveal the reasoning text.
- Styled with a subtle border and muted text to differentiate from the main response.

### 5. Handle `<think>` tags as fallback
Many models (DeepSeek, QwQ) wrap thinking in `<think>...</think>` XML tags within the content itself. Add a parser that strips these tags from the visible content and extracts them into the thinking field — so it works even if the API doesn't have a dedicated thinking field.

## Files Modified
- `src/lib/ollama.ts` — ChatMessage type + all 4 streamers
- `src/pages/Chat.tsx` — streaming state + chunk handling
- `src/components/ChatMessage.tsx` — collapsible thinking UI

