"""
md_chunker.py
-------------
Parse Markdown course notes into structured chunks for RAG indexing.
Designed for the PE course modules which are bilingual (FR + EN).
"""

import re
import os
from typing import List, Dict, Any
from dataclasses import dataclass, field, asdict


@dataclass
class RawChunk:
    """A chunk of course content with metadata for RAG indexing."""
    id: str
    content: str
    metadata: Dict[str, str] = field(default_factory=dict)


# Mapping from filename stems to topic metadata
FILE_TOPIC_MAP = {
    "PE_MODULE_01_ZERO_SHOT": {
        "topic": "zero_shot",
        "module": "01",
        "level": "beginner",
    },
    "PE_MODULE_02_FEW_SHOT": {
        "topic": "few_shot",
        "module": "02",
        "level": "intermediate",
    },
    "PE_MODULE_03_CHAIN_OF_THOUGHT": {
        "topic": "chain_of_thought",
        "module": "03",
        "level": "intermediate",
    },
    "PE_MODULE_04_SYSTEM_PROMPTS": {
        "topic": "system_prompts",
        "module": "04",
        "level": "advanced",
    },
    "PE_MODULE_05_STRUCTURED_OUTPUT": {
        "topic": "structured_output",
        "module": "05",
        "level": "intermediate",
    },
}

# Topic filter mapping: which topics are relevant for each PE lab
PE_PAGE_TOPICS = {
    "01_zero_shot": {"zero_shot", "general_pe"},
    "02_few_shot": {"few_shot", "zero_shot", "general_pe"},
    "03_chain_of_thought": {"chain_of_thought", "zero_shot", "general_pe"},
    "04_system_prompts": {"system_prompts", "zero_shot", "general_pe"},
    "05_structured_output": {"structured_output", "system_prompts", "few_shot", "general_pe"},
}


def _split_bilingual(text: str) -> Dict[str, str]:
    """Split a bilingual Markdown file into French and English sections.
    
    The English section starts with a line matching:
    '# Module X — ... (English Version)'
    """
    # Find the English version header
    pattern = r'\n# Module \d+ — .+?\(English Version\)\s*\n'
    match = re.search(pattern, text)
    
    if match:
        fr_text = text[:match.start()].strip()
        en_text = text[match.start():].strip()
        return {"fr": fr_text, "en": en_text}
    else:
        # No English section found — treat entire file as French
        return {"fr": text, "en": ""}


def _split_into_sections(text: str) -> List[Dict[str, str]]:
    """Split Markdown text by ## headers into sections.
    
    Returns list of dicts with 'title' and 'content' keys.
    """
    sections = []
    current_title = "Introduction"
    current_content = []
    
    for line in text.split('\n'):
        # Detect ## headers (h2)
        header_match = re.match(r'^#{2}\s+(.+)$', line)
        if header_match:
            # Save previous section if it has content
            content = '\n'.join(current_content).strip()
            if content and len(content) > 50:  # Skip tiny fragments
                sections.append({"title": current_title, "content": content})
            current_title = header_match.group(1).strip()
            current_content = []
        else:
            current_content.append(line)
    
    # Don't forget the last section
    content = '\n'.join(current_content).strip()
    if content and len(content) > 50:
        sections.append({"title": current_title, "content": content})
    
    return sections


def _chunk_sections(sections: List[Dict[str, str]], max_tokens: int = 400, overlap_tokens: int = 50) -> List[Dict[str, str]]:
    """Split sections that are too long into overlapping chunks.
    
    Rough token estimate: 1 token ≈ 4 characters.
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


def _clean_markdown(text: str) -> str:
    """Light cleanup of Markdown for better embedding quality.
    
    Keeps the text readable but removes formatting noise.
    """
    # Remove the top-level # header (module title)
    text = re.sub(r'^# .+$', '', text, flags=re.MULTILINE)
    
    # Remove horizontal rules
    text = re.sub(r'^---+\s*$', '', text, flags=re.MULTILINE)
    
    # Remove emoji-only lines
    text = re.sub(r'^\s*[🎯📋🔒📦🪜✅❌⚠️💡🔗📚🎭📐📎❓🔄]\s*$', '', text, flags=re.MULTILINE)
    
    # Clean excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()


def process_markdown_file(filepath: str, file_stem: str) -> List[RawChunk]:
    """Process a single Markdown file into a list of RawChunks.
    
    Handles bilingual files by splitting FR and EN sections,
    then chunking each independently.
    
    Args:
        filepath: Path to the .md file
        file_stem: Filename without extension (used for metadata lookup)
    
    Returns:
        List of RawChunk objects ready for embedding
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        raw_text = f.read()
    
    # Get metadata for this file
    meta = FILE_TOPIC_MAP.get(file_stem, {
        "topic": "general_pe",
        "module": "00",
        "level": "beginner",
    })
    
    # Split into FR and EN
    bilingual = _split_bilingual(raw_text)
    
    all_chunks = []
    
    for lang, lang_text in bilingual.items():
        if not lang_text:
            continue
        
        # Clean markdown
        cleaned = _clean_markdown(lang_text)
        
        # Split into sections
        sections = _split_into_sections(cleaned)
        
        # Chunk long sections
        chunked = _chunk_sections(sections)
        
        # Build RawChunk objects
        for i, chunk in enumerate(chunked):
            chunk_id = f"{file_stem}_{lang}_{i:02d}"
            all_chunks.append(RawChunk(
                id=chunk_id,
                content=f"{chunk['title']}\n\n{chunk['content']}",
                metadata={
                    "topic": meta["topic"],
                    "module": meta["module"],
                    "level": meta["level"],
                    "language": lang,
                    "source": f"{file_stem}.md",
                    "section": chunk["title"],
                    "type": "course_notes",
                    "course": "pe",
                    "pages": "all",  # PE chunks are relevant across all PE labs
                }
            ))
    
    return all_chunks
