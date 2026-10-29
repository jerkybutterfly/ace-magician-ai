# Architecture rules
- Local tool integrations use the configured mini PC helper, not cloud execution, so software runs on the user's own hardware.
- Artemis setup runs as a detached Windows process with a log and completion marker because the helper's terminal requests have a short execution timeout.
- The helper's LLM brain is LangChain (`lc_run_agent` in public/agent.py): all model-driven PC control goes through its tool-calling AgentExecutor; new agent capabilities are added as LangChain tools there, not as new chat tags.