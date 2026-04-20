"""
chunker.py
----------
Parse LaTeX course notes into structured chunks for RAG indexing.
Each chunk is a self-contained text segment with metadata.
"""

import re
import fitz  # PyMuPDF
from typing import List, Dict, Any
from dataclasses import dataclass, field, asdict


@dataclass
class RawChunk:
    """A chunk of course content with metadata for RAG indexing."""
    id: str
    content: str
    metadata: Dict[str, str] = field(default_factory=dict)


# Mapping from LaTeX filename stems to topic metadata
FILE_TOPIC_MAP = {
    "bellman_state_value_derivation_v3": {
        "topic": "policy_evaluation",
        "pages": "policy_evaluation_lab",
        "level": "intro",
    },
    "bellman_action_value_derivation": {
        "topic": "policy_evaluation",
        "pages": "policy_evaluation_lab",
        "level": "intermediate",
    },
    "value_iteration_frozenlake": {
        "topic": "value_iteration",
        "pages": "value_iteration_lab",
        "level": "intro",
    },
    "policy_iteration_frozenlake": {
        "topic": "policy_iteration",
        "pages": "policy_iteration_lab",
        "level": "intro",
    },
    "q_learning_frozenlake": {
        "topic": "q_learning",
        "pages": "q_learning_lab",
        "level": "intro",
    },
    "sarsa_frozenlake": {
        "topic": "sarsa",
        "pages": "general",
        "level": "intro",
    },
    "td0_policy_evaluation_frozenlake": {
        "topic": "td_learning",
        "pages": "general",
        "level": "intro",
    },
    "monte_carlo_control_frozenlake": {
        "topic": "monte_carlo",
        "pages": "general",
        "level": "intro",
    },
    "double_q_learning_frozenlake": {
        "topic": "double_q_learning",
        "pages": "general",
        "level": "intermediate",
    },
    "dqn_frozenlake": {
        "topic": "dqn",
        "pages": "general",
        "level": "intermediate",
    },
    "comparative_synthesis_8_rl_algorithms": {
        "topic": "general_rl",
        "pages": "all",
        "level": "intro",
    },
}

# Chapter-to-topic mapping for Sutton & Barto textbook
SUTTON_BARTO_CHAPTERS = {
    "ch1": {
        "title": "Introduction",
        "page_start": 23,
        "page_end": 43,
        "topic": "general_rl",
        "pages": "all",
        "level": "intro",
    },
    "ch2": {
        "title": "Multi-armed Bandits",
        "page_start": 47,
        "page_end": 67,
        "topic": "general_rl",
        "pages": "q_learning_lab",
        "level": "intro",
    },
    "ch3": {
        "title": "Finite Markov Decision Processes",
        "page_start": 69,
        "page_end": 93,
        "topic": "mdp_basics",
        "pages": "all",
        "level": "intro",
    },
    "ch4": {
        "title": "Dynamic Programming",
        "page_start": 95,
        "page_end": 112,
        "topic": "dynamic_programming",
        "pages": "policy_evaluation_lab,value_iteration_lab,policy_iteration_lab",
        "level": "intro",
    },
    "ch6": {
        "title": "Temporal-Difference Learning",
        "page_start": 141,
        "page_end": 162,
        "topic": "td_learning",
        "pages": "q_learning_lab",
        "level": "intro",
    },
}

# Topics that are relevant for each lab page (used by retriever for stage-1 filtering)
PAGE_TOPIC_FILTER = {
    "policy_evaluation_lab": ["policy_evaluation", "mdp_basics", "general_rl"],
    "value_iteration_lab": ["value_iteration", "policy_evaluation", "mdp_basics", "general_rl"],
    "policy_iteration_lab": ["policy_iteration", "policy_evaluation", "mdp_basics", "general_rl"],
    "q_learning_lab": ["q_learning", "td_learning", "general_rl", "mdp_basics"],
}


def strip_latex(text: str) -> str:
    """Remove LaTeX markup and return readable plain text.
    
    Preserves mathematical content in a simplified readable form.
    """
    # Remove comments
    text = re.sub(r'%.*$', '', text, flags=re.MULTILINE)
    
    # Remove document class, usepackage, and preamble commands
    text = re.sub(r'\\(documentclass|usepackage|geometry|setlength|titleformat|definecolor|tcbuselibrary|newtcolorbox|newtheorem|DeclareMathOperator|newcommand|renewcommand|hypersetup)\b[^\\]*?(?=\\|\n\n)', '', text, flags=re.DOTALL)
    
    # Remove begin/end document
    text = re.sub(r'\\begin\{document\}', '', text)
    text = re.sub(r'\\end\{document\}', '', text)
    
    # Remove title/center blocks
    text = re.sub(r'\\begin\{center\}.*?\\end\{center\}', '', text, flags=re.DOTALL)
    
    # Convert section commands to readable headers
    text = re.sub(r'\\section\*?\{([^}]*)\}', r'\n## \1\n', text)
    text = re.sub(r'\\subsection\*?\{([^}]*)\}', r'\n### \1\n', text)
    text = re.sub(r'\\subsubsection\*?\{([^}]*)\}', r'\n#### \1\n', text)
    text = re.sub(r'\\paragraph\{([^}]*)\}', r'\n**\1**\n', text)
    
    # Convert emphasis and bold
    text = re.sub(r'\\emph\{([^}]*)\}', r'\1', text)
    text = re.sub(r'\\textbf\{([^}]*)\}', r'\1', text)
    text = re.sub(r'\\textit\{([^}]*)\}', r'\1', text)
    text = re.sub(r'\\text\{([^}]*)\}', r'\1', text)
    
    # Convert display math to readable form  
    text = re.sub(r'\\\[', r' ', text)
    text = re.sub(r'\\\]', r' ', text)
    text = re.sub(r'\\begin\{align\*?\}', r' ', text)
    text = re.sub(r'\\end\{align\*?\}', r' ', text)
    text = re.sub(r'\\begin\{equation\*?\}', r' ', text)
    text = re.sub(r'\\end\{equation\*?\}', r' ', text)
    
    # Convert theorem/definition environments to readable text
    text = re.sub(r'\\begin\{(definition|theoreme|theorem|lemma|proposition)\}\[([^\]]*)\]', r'\n**\1: \2**\n', text)
    text = re.sub(r'\\begin\{(definition|theoreme|theorem|lemma|proposition)\}', r'\n**\1**\n', text)
    text = re.sub(r'\\end\{(definition|theoreme|theorem|lemma|proposition)\}', '', text)
    
    # Convert itemize/enumerate
    text = re.sub(r'\\begin\{(itemize|enumerate)\}(\[.*?\])?', '', text)
    text = re.sub(r'\\end\{(itemize|enumerate)\}', '', text)
    text = re.sub(r'\\item\s*', r'- ', text)
    
    # Remove tcolorbox and other environments
    text = re.sub(r'\\begin\{[^}]*\}(\[.*?\])?', '', text)
    text = re.sub(r'\\end\{[^}]*\}', '', text)
    
    # Simplify common LaTeX math commands to readable form
    text = re.sub(r'\\given', '|', text)
    text = re.sub(r'\\mathcal\s*\{?(\w)\}?', r'\1', text)
    text = re.sub(r'\\mathbb\s*\{?(\w)\}?', r'\1', text)
    text = re.sub(r'\\E_?\{?\\pi\}?', 'E_pi', text)
    text = re.sub(r'\\E', 'E', text)
    text = re.sub(r'\\R', 'R', text)
    text = re.sub(r'\\left[(\[{]', '', text)
    text = re.sub(r'\\right[)\]}]', '', text)
    text = re.sub(r'\\(le|leq)', '<=', text)
    text = re.sub(r'\\(ge|geq)', '>=', text)
    text = re.sub(r'\\infty', 'infinity', text)
    text = re.sub(r'\\(sum|prod)', r'\\\1', text)  # keep \sum, \prod
    text = re.sub(r'\\(frac)\{([^}]*)\}\{([^}]*)\}', r'(\2)/(\3)', text)
    text = re.sub(r'\\(pi|gamma|alpha|beta|epsilon|theta|delta|lambda|mu|sigma|varepsilon)', r'\\\1', text)
    text = re.sub(r'\\argmax', 'argmax', text)
    text = re.sub(r'\\max', 'max', text)
    text = re.sub(r'\\min', 'min', text)
    text = re.sub(r'\\sup', 'sup', text)
    
    # Remove remaining LaTeX commands
    text = re.sub(r'\\[a-zA-Z]+\*?(\{[^}]*\})*', '', text)
    
    # Clean up braces and special chars
    text = re.sub(r'[{}]', '', text)
    text = re.sub(r'\$', '', text)
    text = re.sub(r'\\\\', ' ', text)
    text = re.sub(r'\\&', '&', text)
    text = re.sub(r'~', ' ', text)
    
    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    text = re.sub(r'^\s+$', '', text, flags=re.MULTILINE)
    
    return text.strip()


def split_into_sections(text: str) -> List[Dict[str, str]]:
    """Split plain text (with ## headers) into sections.
    
    Returns list of dicts with 'title' and 'content' keys.
    """
    sections = []
    current_title = "Introduction"
    current_content = []
    
    for line in text.split('\n'):
        # Detect section headers (## or ###)
        header_match = re.match(r'^#{2,4}\s+(.+)$', line)
        if header_match:
            # Save previous section if it has content
            content = '\n'.join(current_content).strip()
            if content and len(content) > 30:  # Skip tiny fragments
                sections.append({"title": current_title, "content": content})
            current_title = header_match.group(1).strip()
            current_content = []
        else:
            current_content.append(line)
    
    # Don't forget the last section
    content = '\n'.join(current_content).strip()
    if content and len(content) > 30:
        sections.append({"title": current_title, "content": content})
    
    return sections


def chunk_sections(sections: List[Dict[str, str]], max_tokens: int = 400, overlap_tokens: int = 50) -> List[Dict[str, str]]:
    """Split sections that are too long into overlapping chunks.
    
    Rough token estimate: 1 token ≈ 4 characters for French text.
    """
    chunks = []
    chars_per_token = 4
    max_chars = max_tokens * chars_per_token
    overlap_chars = overlap_tokens * chars_per_token
    
    for section in sections:
        content = section["content"]
        title = section["title"]
        
        if len(content) <= max_chars:
            chunks.append({"title": title, "content": content})
        else:
            # Split on paragraph boundaries
            paragraphs = content.split('\n\n')
            current_chunk = []
            current_len = 0
            
            for para in paragraphs:
                para_len = len(para)
                if current_len + para_len > max_chars and current_chunk:
                    # Save current chunk
                    chunks.append({
                        "title": title,
                        "content": '\n\n'.join(current_chunk)
                    })
                    # Overlap: keep last paragraph
                    if overlap_chars > 0 and current_chunk:
                        last = current_chunk[-1]
                        current_chunk = [last]
                        current_len = len(last)
                    else:
                        current_chunk = []
                        current_len = 0
                
                current_chunk.append(para)
                current_len += para_len
            
            # Last chunk
            if current_chunk:
                chunks.append({
                    "title": title,
                    "content": '\n\n'.join(current_chunk)
                })
    
    return chunks


def process_latex_file(filepath: str, file_stem: str) -> List[RawChunk]:
    """Process a single LaTeX file into a list of RawChunks.
    
    Args:
        filepath: Path to the .tex file
        file_stem: Filename without extension (used for metadata lookup)
    
    Returns:
        List of RawChunk objects ready for embedding
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        raw_latex = f.read()
    
    # Get metadata for this file
    meta = FILE_TOPIC_MAP.get(file_stem, {
        "topic": "general_rl",
        "pages": "all",
        "level": "intro",
    })
    
    # Strip LaTeX → plain text
    plain_text = strip_latex(raw_latex)
    
    # Split into sections
    sections = split_into_sections(plain_text)
    
    # Chunk long sections
    chunked = chunk_sections(sections)
    
    # Build RawChunk objects
    chunks = []
    for i, chunk in enumerate(chunked):
        chunk_id = f"{file_stem}_{i:02d}"
        chunks.append(RawChunk(
            id=chunk_id,
            content=f"{chunk['title']}\n\n{chunk['content']}",
            metadata={
                "topic": meta["topic"],
                "pages": meta["pages"],
                "level": meta["level"],
                "source": f"{file_stem}.tex",
                "section": chunk["title"],
                "type": "theory",
            }
        ))
    
    return chunks


def process_pdf_chapters(filepath: str) -> List[RawChunk]:
    """Process selected chapters from a PDF textbook into chunks.
    
    Extracts text from predefined page ranges, splits by sections,
    and creates chunks with appropriate metadata.
    """
    doc = fitz.open(filepath)
    all_chunks = []
    
    for ch_id, ch_info in SUTTON_BARTO_CHAPTERS.items():
        # Extract text from the chapter's page range
        chapter_text = ""
        for page_num in range(ch_info["page_start"] - 1, ch_info["page_end"]):  # 0-indexed
            page = doc[page_num]
            chapter_text += page.get_text() + "\n\n"
        
        # Clean up PDF extraction artifacts
        chapter_text = _clean_pdf_text(chapter_text)
        
        # Split into sections based on section headers (e.g., "4.1", "4.2")
        sections = _split_pdf_sections(chapter_text, ch_info["title"])
        
        # Chunk long sections
        chunked = chunk_sections(sections)
        
        # Build RawChunk objects
        for i, chunk in enumerate(chunked):
            chunk_id = f"sutton_{ch_id}_{i:02d}"
            all_chunks.append(RawChunk(
                id=chunk_id,
                content=f"{chunk['title']}\n\n{chunk['content']}",
                metadata={
                    "topic": ch_info["topic"],
                    "pages": ch_info["pages"],
                    "level": ch_info["level"],
                    "source": f"sutton_barto_{ch_id}",
                    "section": chunk["title"],
                    "type": "textbook",
                }
            ))
    
    doc.close()
    return all_chunks


def _clean_pdf_text(text: str) -> str:
    """Clean common PDF extraction artifacts."""
    import re
    # Remove page numbers and headers
    text = re.sub(r'\n\d+\n', '\n', text)
    text = re.sub(r'\nChapter \d+:.*\n', '\n', text)
    # Fix common PDF ligature issues
    text = text.replace('ﬁ', 'fi')
    text = text.replace('ﬂ', 'fl')
    text = text.replace('ﬀ', 'ff')
    text = text.replace('ﬃ', 'ffi')
    text = text.replace('ﬄ', 'ffl')
    # Fix broken math notation from PDF
    text = text.replace('⇡', '_π')
    text = text.replace('⇤', '*')
    text = text.replace('2 S', '∈ S')
    text = text.replace('2 A', '∈ A')
    # Clean excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()


def _split_pdf_sections(text: str, chapter_title: str) -> List[Dict[str, str]]:
    """Split PDF chapter text into sections based on numbered headers.
    
    Detects patterns like "4.1 Policy Evaluation" or "6.3 Sarsa".
    """
    import re
    sections = []
    # Match section headers: digit.digit followed by title text
    pattern = r'\n(\d+\.\d+)\s+([A-Z][^\n]+)'
    
    parts = re.split(pattern, text)
    
    if len(parts) <= 1:
        # No section headers found — treat entire chapter as one section
        sections.append({"title": chapter_title, "content": text.strip()})
        return sections
    
    # First part is the chapter intro (before first section)
    intro = parts[0].strip()
    if intro and len(intro) > 50:
        sections.append({"title": f"{chapter_title} - Introduction", "content": intro})
    
    # Remaining parts are groups of (section_num, section_title, section_content)
    i = 1
    while i < len(parts) - 2:
        sec_num = parts[i]
        sec_title = parts[i + 1].strip()
        sec_content = parts[i + 2].strip()
        
        if sec_content and len(sec_content) > 50:
            sections.append({
                "title": f"{sec_num} {sec_title}",
                "content": sec_content
            })
        i += 3
    
    return sections
