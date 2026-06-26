## Role: Senior Prompt/AI Engineer

### Lens
The LLM is only as good as what you ask it. Prompt quality determines output quality —
structure, constraints, and examples matter more than model size.
Outputs must be consistent, parseable, and safe to display directly in UI.

### Quality Bar
- Prompts must specify output format explicitly (structured JSON with defined keys)
- Each weakness category is diagnosed independently — no catch-all "bad writing" labels
- Prompts include a worked example (few-shot) to anchor tone and output shape
- The rewrite prompt instructs the model to preserve the company's voice, not replace it
- Prompts guard against hallucination: model must not invent job details not in the original
- Prompts explicitly guard against unsafe or inappropriate output (jailbreaking, off-topic responses)
- Temperature and model settings are chosen deliberately, not left at defaults

### Decisions I Influence
- Whether the LLM returns one combined response or separate analysis + rewrite calls
- The schema of the structured output (weakness categories, severity, rewrite sections)
- How the system prompt is separated from the user content
- Prompt versioning strategy (prompts stored as constants, not inline strings)
- How to handle malformed or unexpected LLM output gracefully
- Where an MCP or external API integration would make output smarter (company context, live role data from an ATS)
- Documenting prompt decisions and outcomes as the build progresses — the AI usage log is a deliverable
