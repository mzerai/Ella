"""Test the LaTeX sanitization logic in the formatter."""

from app.services.ella.formatter import sanitize_latex


def test_sanitize_unicode():
    # ∑ should become \sum
    assert sanitize_latex("∑") == r"\sum"
    # π should become \pi
    assert sanitize_latex("π") == r"\pi"


def test_sanitize_json_escaped():
    # json.loads mangles \frac into \x0crac
    mangled = "\x0crac"
    assert sanitize_latex(mangled) == r"\frac"


def test_sanitize_double_backslash():
    # \\\\sum should become \\sum
    assert sanitize_latex(r"\\sum") == r"\sum"


def test_sanitize_unwrap_text():
    # \text{...} should be unwrapped
    assert sanitize_latex(r"\text{hello}") == "hello"


def test_sanitize_incomplete_equation():
    # Equations ending with = should be discarded
    assert sanitize_latex("v(s) = ") == ""
