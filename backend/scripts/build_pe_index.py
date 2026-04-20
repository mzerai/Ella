"""
build_pe_index.py
-----------------
Build the RAG index from Markdown PE course notes.

Usage:
    cd ella/backend
    python scripts/build_pe_index.py

Reads:  data/pe/raw/*.md
Writes: data/pe/index/chunks.json
        data/pe/index/embeddings.npy
        data/pe/index/tfidf.pkl
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

from app.services.ella.md_chunker import process_markdown_file, RawChunk
from dataclasses import asdict


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


def main():
    raw_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'pe', 'raw')
    index_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'pe', 'index')

    # Ensure directories exist
    os.makedirs(index_dir, exist_ok=True)

    # Find all .md files
    md_files = sorted(glob.glob(os.path.join(raw_dir, '*.md')))

    if not md_files:
        print(f"ERROR: No .md files found in {os.path.abspath(raw_dir)}")
        print("Place your Markdown course notes in data/pe/raw/")
        sys.exit(1)

    print(f"Found {len(md_files)} Markdown files in {os.path.abspath(raw_dir)}")

    # Process all files into chunks
    all_chunks = []
    for md_path in md_files:
        file_stem = os.path.splitext(os.path.basename(md_path))[0]
        chunks = process_markdown_file(md_path, file_stem)
        print(f"  {file_stem}: {len(chunks)} chunks")
        all_chunks.extend(chunks)

    print(f"\nTotal chunks: {len(all_chunks)}")

    if not all_chunks:
        print("ERROR: No chunks generated. Check your Markdown files.")
        sys.exit(1)

    # Load embedding model and encode
    model = load_embedding_model()

    texts = [chunk.content for chunk in all_chunks]
    print(f"Encoding {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)

    print(f"Embedding shape: {embeddings.shape}")

    # Save chunks as JSON
    chunks_path = os.path.join(index_dir, 'chunks.json')
    chunks_data = [asdict(chunk) for chunk in all_chunks]
    with open(chunks_path, 'w', encoding='utf-8') as f:
        json.dump(chunks_data, f, ensure_ascii=False, indent=2)

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
        key = f"{chunk.metadata.get('source', 'unknown')} ({chunk.metadata.get('language', '?')})"
        module_counts[key] = module_counts.get(key, 0) + 1
    for key, count in sorted(module_counts.items()):
        print(f"  {key}: {count} chunks")

    print("\nDone!")


if __name__ == '__main__':
    main()
