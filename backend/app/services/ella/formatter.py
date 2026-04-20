import json
import re
from app.services.ella.models import AssistantResponse

# Unicode math symbols that Llama 3.1 often uses instead of LaTeX commands
_UNICODE_TO_LATEX = {
    "\u2211": r"\sum",       # ∑
    "\u03c0": r"\pi",        # π
    "\u03b3": r"\gamma",     # γ
    "\u03b8": r"\theta",     # θ
    "\u0394": r"\Delta",     # Δ
    "\u03b4": r"\delta",     # δ
    "\u03b1": r"\alpha",     # α
    "\u03b2": r"\beta",      # β
    "\u03b5": r"\epsilon",   # ε
    "\u03bb": r"\lambda",    # λ
    "\u03bc": r"\mu",        # μ
    "\u03c3": r"\sigma",     # σ
    "\u2200": r"\forall",    # ∀
    "\u2208": r"\in",        # ∈
    "\u221e": r"\infty",     # ∞
    "\u2264": r"\leq",       # ≤
    "\u2265": r"\geq",       # ≥
    "\u2260": r"\neq",       # ≠
    "\u2248": r"\approx",    # ≈
    "\u22c5": r"\cdot",      # ⋅
    "\u00d7": r"\times",     # ×
    "\u2192": r"\rightarrow",# →
    "\u2190": r"\leftarrow", # ←
    "\u2202": r"\partial",   # ∂
}

# LaTeX commands whose backslash is eaten by JSON escape sequences.
# When the LLM outputs \frac in a JSON string, json.loads interprets
# \f as form feed (0x0C), producing "\x0crac" instead of "\\frac".
# Same for \t (tab), \n (newline), \r (carriage return), \b (backspace).
_JSON_ESCAPED_LATEX = {
    "\x0crac": r"\frac",
    "\x0corall": r"\forall",
    "\x0clat": r"\flat",
    "\text": r"\text",       # \t (tab) + ext
    "\theta": r"\theta",     # \t (tab) + heta
    "\times": r"\times",     # \t (tab) + imes
    "\tau": r"\tau",         # \t (tab) + au
    "\to": r"\to",           # \t (tab) + o
    "\nu": r"\nu",           # \n (newline) + u
    "\nabla": r"\nabla",     # \n (newline) + abla
    "\neq": r"\neq",         # \n (newline) + eq
    "\neg": r"\neg",         # \n (newline) + eg
    "\rho": r"\rho",         # \r (carriage return) + ho
    "\rightarrow": r"\rightarrow",  # \r + ightarrow
    "\rangle": r"\rangle",   # \r + angle
    "\x08eta": r"\beta",     # \b (backspace) + eta
    "\x08ar": r"\bar",       # \b (backspace) + ar
    "\x08egin": r"\begin",   # \b (backspace) + egin
}

def sanitize_latex(block: str) -> str:
    """Clean up LaTeX blocks produced by the LLM.

    Handles these known issues from Llama 3.1:
    1. Unicode math symbols used instead of LaTeX commands
    2. Double-escaped backslashes from JSON round-tripping
    3. Corrupted \\[ sequences (mangled \\sum, \\pi, etc.)
    4. Forbidden \\begin{} / \\end{} environment blocks
    5. \\text{} wrappers that the frontend cannot render
    6. Line breaks inside a single LaTeX expression
    7. Incomplete equations (ending with = and nothing after)
    """
    # 0. Restore LaTeX commands whose backslash was eaten by JSON escape sequences
    for mangled, correct in _JSON_ESCAPED_LATEX.items():
        block = block.replace(mangled, correct)

    # 1. Replace Unicode symbols with LaTeX commands
    for unicode_char, latex_cmd in _UNICODE_TO_LATEX.items():
        block = block.replace(unicode_char, latex_cmd)

    # 2. Collapse double-escaped backslashes: \\\\sum -> \\sum
    block = re.sub(r"\\{2,}(?=[a-zA-Z])", "\\\\", block)

    # 3. Fix corrupted \\[ pattern -> \\sum (best-effort recovery)
    block = re.sub(r"\\+\[(?=\s*[a-zA-Z(])", r"\\sum ", block)

    # 4. Remove \\begin{...}...\\end{...} environment blocks
    block = re.sub(r"\\?begin\{[^}]*\}.*?\\?end\{[^}]*\}", "", block, flags=re.DOTALL)

    # 5. Unwrap \\text{...} -> contents only
    block = re.sub(r"\\?text\{([^}]*)\}", r"\1", block)

    # 6. Replace newlines with spaces (prevents vertical rendering)
    block = re.sub(r"\n+", " ", block)

    # 7. Strip and discard incomplete equations
    block = block.strip()
    if re.match(r"^.*=\s*$", block):
        return ""

    return block


def parse_llm_response(raw_text: str) -> AssistantResponse:
    """Parses the raw JSON string from the LLM into a structured AssistantResponse.
    Falls back gracefully if the LLM fails to output valid JSON.
    """
    try:
        data = json.loads(raw_text)
        if not isinstance(data, dict):
            raise ValueError("LLM returned non-object JSON")
        return AssistantResponse(
            answer=data.get("answer", "No answer provided.") if data.get("answer") else data.get("error", "An error occurred."),
            connection_to_page=data.get("connection_to_page", ""),
            intuition=data.get("intuition", ""),
            misconception=data.get("misconception", ""),
            latex_blocks=data.get("latex_blocks", []),
            suggested_resources=data.get("suggested_resources", "")
        )
    except (json.JSONDecodeError, ValueError):
        return AssistantResponse(
            answer=raw_text,
            connection_to_page="",
            intuition="",
            misconception="",
            latex_blocks=[],
            suggested_resources=""
        )

def format_for_ui(response: AssistantResponse) -> str:
    """Takes a structured AssistantResponse and normalizes it into pedagogical markdown."""
    md = f"{response.answer}\n\n"
    
    if response.intuition:
        md += f"💡 **Intuition**: {response.intuition}\n\n"
        
    if response.connection_to_page:
        md += f"🔗 **Connection to Current Lab**: {response.connection_to_page}\n\n"
        
    if response.misconception:
        md += f"⚠️ **Common Misconception**: {response.misconception}\n\n"

    if response.suggested_resources:
        md += f"\n📚 **Go Further**:\n{response.suggested_resources}\n"
        md += f"\n_Links are curated but may change over time — please verify availability._\n\n"

    for block in response.latex_blocks:
        if isinstance(block, str) and block.strip():
            cleaned = sanitize_latex(block)
            if cleaned:
                md += f"\n$${cleaned}$$\n"
    
    return md.strip()
