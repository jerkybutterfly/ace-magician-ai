
## Phase 1: File Upload to Chat
- Add a file input button (paperclip icon) next to the send button
- Support text files, images, and common document types
- Read file contents and include them in the message sent to the AI
- Show attached file names in the input area

## Phase 2: Voice Input (Speech-to-Text)
- Use the browser's built-in Web Speech API (no API key needed)
- Add a microphone button next to the send button
- Show recording state with visual indicator
- Transcribed text fills the input box

## Phase 3: Voice Output (Text-to-Speech)
- Use browser's built-in SpeechSynthesis API (no API key needed)
- Add a speaker button on each AI message to read it aloud
- Stop button to cancel speech

## Phase 4: Image Generation
- Detect when user asks to generate an image (or add a `/image` command)
- Use the Lovable AI gateway with `google/gemini-2.5-flash-image` model
- Display generated images inline in chat
- Create a new edge function `generate-image` to handle the API call
