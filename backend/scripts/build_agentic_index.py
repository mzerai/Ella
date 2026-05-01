"""
build_agentic_index.py
----------------------
Build the RAG index from Agentic AI module JSON cells.

Unlike PE (which reads raw Markdown files), Agentic AI content lives directly
in module_XX_cells.json files. This script extracts "content" type cells,
chunks them by paragraph, and builds the same index format as PE.

Usage:
    cd ella/backend
    python scripts/build_agentic_index.py

Reads:  data/agentic_ai/modules/module_*_cells.json
Writes: data/agentic_ai/index/chunks.json
        data/agentic_ai/index/embeddings.npy
        data/agentic_ai/index/tfidf.pkl
"""

import os
import sys
import json
import glob
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Module ID → topic + module number mapping
AGENTIC_TOPIC_MAP = {
    "00_course_positioning": {"topic": "positioning", "module": "00"},
    "01_anatomy_of_enterprise_ai_agent": {"topic": "anatomy", "module": "01"},
    "02_design_agentic_workflow": {"topic": "workflow", "module": "02"},
    "03_tool_calling_api_enterprise_integration": {"topic": "tool_calling", "module": "03"},
    "04_rag_memory_context_management": {"topic": "rag_memory", "module": "04"},
    "05_single_agent_multi_agent_architectures": {"topic": "architectures", "module": "05"},
    "06_security_governance_compliance": {"topic": "security", "module": "06"},
    "07_evaluation_observability_production_readiness": {"topic": "evaluation", "module": "07"},
    "08_deploy_enterprise_ai_agent_pilot": {"topic": "pilot", "module": "08"},
}

# Approximate max tokens per chunk (splitting on paragraphs)
MAX_CHUNK_TOKENS = 400
# Rough estimate: 1 token ≈ 4 characters for mixed FR/EN
CHARS_PER_TOKEN = 4
MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN


def load_embedding_model():
    """Load the sentence-transformers model for encoding chunks."""
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print(f"Loaded embedding model: all-MiniLM-L6-v2")
        return model
    except ImportError:
        print("ERROR: sentence-transformers not installed.")
        print("Run: pip install sentence-transformers")
        sys.exit(1)


def split_into_chunks(text: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Split text into chunks on paragraph boundaries, respecting max size."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current = []
    current_len = 0

    for para in paragraphs:
        para_len = len(para)
        # If a single paragraph exceeds max, split it further on newlines
        if para_len > max_chars:
            # Flush current buffer first
            if current:
                chunks.append("\n\n".join(current))
                current = []
                current_len = 0
            # Split long paragraph on single newlines
            lines = para.split("\n")
            sub_current = []
            sub_len = 0
            for line in lines:
                if sub_len + len(line) + 1 > max_chars and sub_current:
                    chunks.append("\n".join(sub_current))
                    sub_current = []
                    sub_len = 0
                sub_current.append(line)
                sub_len += len(line) + 1
            if sub_current:
                chunks.append("\n".join(sub_current))
            continue

        if current_len + para_len + 2 > max_chars and current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0

        current.append(para)
        current_len += para_len + 2  # +2 for "\n\n"

    if current:
        chunks.append("\n\n".join(current))

    return chunks


def extract_chunks_from_module(filepath: str, filename: str) -> list[dict]:
    """Extract and chunk content cells from a single module JSON file."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    module_id = data.get("module_id", "")
    topic_info = AGENTIC_TOPIC_MAP.get(module_id)
    if not topic_info:
        print(f"  WARNING: Unknown module_id '{module_id}' — skipping")
        return []

    topic = topic_info["topic"]
    module_num = topic_info["module"]

    chunks = []
    for cell in data.get("cells", []):
        if cell.get("type") != "content":
            continue

        cell_title = cell.get("title", {})
        content = cell.get("content", {})

        # Process both languages
        for lang_code in ("fr", "en"):
            text = content.get(lang_code, "")
            if not text.strip():
                continue

            section_title = cell_title.get(lang_code, cell_title.get("fr", ""))
            text_chunks = split_into_chunks(text)

            for i, chunk_text in enumerate(text_chunks):
                chunk_id = f"{module_id}_{lang_code}_{len(chunks):02d}"
                chunks.append({
                    "id": chunk_id,
                    "content": chunk_text,
                    "metadata": {
                        "topic": topic,
                        "module": module_num,
                        "level": "intermediate-advanced",
                        "language": lang_code,
                        "source": filename,
                        "section": section_title,
                        "type": "course_notes",
                        "course": "agentic",
                        "pages": "all",
                    }
                })

    return chunks


def main():
    modules_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'agentic_ai', 'modules')
    index_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'agentic_ai', 'index')
    resources_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'agentic_ai', 'resources.json')

    os.makedirs(index_dir, exist_ok=True)

    # Find all module JSON files
    pattern = os.path.join(modules_dir, 'module_*_cells.json')
    module_files = sorted(glob.glob(pattern))

    if not module_files:
        print(f"ERROR: No module files found in {os.path.abspath(modules_dir)}")
        sys.exit(1)

    print(f"Found {len(module_files)} module files in {os.path.abspath(modules_dir)}")

    # Extract chunks from all modules
    all_chunks = []
    for filepath in module_files:
        filename = os.path.basename(filepath)
        chunks = extract_chunks_from_module(filepath, filename)
        print(f"  {filename}: {len(chunks)} chunks")
        all_chunks.extend(chunks)

    # --- Load curated resources as additional chunks ---
    if os.path.exists(resources_path):
        with open(resources_path, 'r', encoding='utf-8') as f:
            res_data = json.load(f)

        resources_list = res_data.get('resources', [])
        for i, res in enumerate(resources_list):
            # Build a rich text chunk from the resource
            content_parts = [res.get('title', '')]
            if res.get('author'):
                content_parts.append(f"Author: {res['author']}")
            if res.get('description_en'):
                content_parts.append(res['description_en'])
            if res.get('description_fr'):
                content_parts.append(res['description_fr'])
            if res.get('url'):
                content_parts.append(f"URL: {res['url']}")

            chunk_content = '\n'.join(content_parts)
            chunk_id = f"agentic_resource_{i:02d}"

            all_chunks.append({
                'id': chunk_id,
                'content': chunk_content,
                'metadata': {
                    'topic': 'resources',
                    'module': 'all',
                    'level': 'intermediate-advanced',
                    'language': 'en',
                    'source': 'resources.json',
                    'section': res.get('title', ''),
                    'type': 'curated_resource',
                    'course': 'agentic',
                    'pages': 'all'
                }
            })

        print(f"  Resources: {len(resources_list)} chunks added")
    else:
        print("  Warning: resources.json not found, skipping resources")

    # Re-number chunk IDs sequentially per module+lang
    counters = {}
    for chunk in all_chunks:
        # Skip resource chunks — they already have proper IDs
        if chunk["metadata"].get("type") == "curated_resource":
            continue
        key = f"{chunk['metadata']['source']}_{chunk['metadata']['language']}"
        idx = counters.get(key, 0)
        # Reconstruct: module_id + lang + sequential index
        lang = chunk["metadata"]["language"]
        matching = [k for k, v in AGENTIC_TOPIC_MAP.items() if v["topic"] == chunk["metadata"]["topic"]]
        if matching:
            source_module_id = matching[0]
            chunk["id"] = f"{source_module_id}_{lang}_{idx:02d}"
        counters[key] = idx + 1

    print(f"\nTotal chunks: {len(all_chunks)}")

    if not all_chunks:
        print("ERROR: No chunks generated. Check your module files.")
        sys.exit(1)

    # Load embedding model and encode
    model = load_embedding_model()

    texts = [chunk["content"] for chunk in all_chunks]
    print(f"Encoding {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)

    print(f"Embedding shape: {embeddings.shape}")

    # Save chunks as JSON
    chunks_path = os.path.join(index_dir, 'chunks.json')
    with open(chunks_path, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    # Save embeddings as numpy
    embeddings_path = os.path.join(index_dir, 'embeddings.npy')
    np.save(embeddings_path, embeddings.astype(np.float32))

    # Build TF-IDF index
    print("Building TF-IDF index...")
    tfidf = TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    tfidf_matrix = tfidf.fit_transform(texts)

    tfidf_path = os.path.join(index_dir, 'tfidf.pkl')
    with open(tfidf_path, 'wb') as f:
        pickle.dump({'vectorizer': tfidf, 'matrix': tfidf_matrix}, f)

    print(f"  TF-IDF: {tfidf_matrix.shape[0]} docs, {tfidf_matrix.shape[1]} features")

    # Print summary
    print(f"\nIndex saved to {os.path.abspath(index_dir)}:")
    print(f"  chunks.json:    {len(all_chunks)} chunks")
    print(f"  embeddings.npy: shape {embeddings.shape}")
    print(f"  tfidf.pkl:      {tfidf_matrix.shape[1]} features")

    # Print per-module breakdown
    print("\nPer-module breakdown:")
    module_counts = {}
    for chunk in all_chunks:
        key = f"{chunk['metadata']['source']} ({chunk['metadata']['language']})"
        module_counts[key] = module_counts.get(key, 0) + 1
    for key, count in sorted(module_counts.items()):
        print(f"  {key}: {count} chunks")

    print("\nDone!")


if __name__ == '__main__':
    main()
