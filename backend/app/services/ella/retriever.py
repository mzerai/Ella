"""
retriever.py
------------
Two-stage retrieval for RAG: topic filtering (stage 1) + cosine similarity (stage 2).
Loads the pre-built index from data/<course_id>/index/ at first call (lazy loading).
"""

import os
import json
import logging
import pickle
import numpy as np
from typing import List, Optional
from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine

from app.services.ella.models import RetrievedChunk

logger = logging.getLogger(__name__)

# Module-level cache for the loaded indices
_index_cache = {}


def _get_index_dir(course_id: str = "rl") -> str:
    """Resolve the path to data/rl_index/ relative to project root."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.abspath(os.path.join(current_dir, '..', '..', '..'))
    return os.path.join(backend_root, 'data', course_id, 'index')


def _load_index(course_id: str = "rl") -> Optional[dict]:
    """Load chunks.json and embeddings.npy into memory. Returns None if not available."""
    global _index_cache
    if _index_cache.get(course_id) is not None:
        return _index_cache[course_id]
    
    index_dir = _get_index_dir(course_id)
    chunks_path = os.path.join(index_dir, 'chunks.json')
    embeddings_path = os.path.join(index_dir, 'embeddings.npy')
    
    if not os.path.exists(chunks_path) or not os.path.exists(embeddings_path):
        logger.info("RAG index not found at %s — retriever will return empty results.", index_dir)
        return None
    
    try:
        with open(chunks_path, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        embeddings = np.load(embeddings_path)
        
        logger.info("RAG index loaded: %d chunks, embedding shape %s", len(chunks), embeddings.shape)
        
        # Load TF-IDF index (optional — graceful fallback if not present)
        tfidf_path = os.path.join(index_dir, 'tfidf.pkl')
        tfidf_data = None
        if os.path.exists(tfidf_path):
            try:
                with open(tfidf_path, 'rb') as f:
                    tfidf_data = pickle.load(f)
                logger.info("TF-IDF index loaded: %d features", tfidf_data['matrix'].shape[1])
            except Exception as e:
                logger.warning("Failed to load TF-IDF index: %s", e)
        
        _index_cache[course_id] = {
            "chunks": chunks,
            "embeddings": embeddings,
            "tfidf": tfidf_data,
        }
        return _index_cache[course_id]
    except Exception as e:
        logger.error("Failed to load RAG index: %s", e)
        return None


def _get_embedding_model():
    """Lazy-load the sentence-transformers model for query encoding."""
    global _embedding_model
    try:
        return _embedding_model
    except NameError:
        pass
    
    try:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Embedding model loaded: all-MiniLM-L6-v2")
        return _embedding_model
    except ImportError:
        logger.warning("sentence-transformers not installed — retriever disabled.")
        _embedding_model = None
        return None


# Topic filter mapping: which topics are relevant for each lab/module page
_PAGE_TOPICS = {
    # Legacy lab page IDs (from LearnLab migration)
    "policy_evaluation_lab": {"policy_evaluation", "dynamic_programming", "mdp_basics", "general_rl"},
    "value_iteration_lab": {"value_iteration", "dynamic_programming", "policy_evaluation", "mdp_basics", "general_rl"},
    "policy_iteration_lab": {"policy_iteration", "dynamic_programming", "policy_evaluation", "mdp_basics", "general_rl"},
    "q_learning_lab": {"q_learning", "td_learning", "general_rl", "mdp_basics"},
    # New RL module IDs (notebook checkpoints use these)
    "rl_00_culture": {"general_rl", "mdp_basics"},
    "rl_01_bellman": {"policy_evaluation", "mdp_basics", "general_rl"},
    "rl_02_planning": {"policy_evaluation", "value_iteration", "policy_iteration", "dynamic_programming", "mdp_basics", "general_rl"},
    "rl_03_td_mc": {"td_learning", "monte_carlo", "policy_evaluation", "general_rl", "mdp_basics"},
    "rl_04_control": {"sarsa", "q_learning", "double_q_learning", "td_learning", "general_rl", "mdp_basics"},
    "rl_05_deep_rl": {"dqn", "double_q_learning", "q_learning", "general_rl"},
}

# PE topic filter mapping
_PE_PAGE_TOPICS = {
    "01_zero_shot": {"zero_shot", "general_pe"},
    "02_few_shot": {"few_shot", "zero_shot", "general_pe"},
    "03_chain_of_thought": {"chain_of_thought", "zero_shot", "general_pe"},
    "04_system_prompts": {"system_prompts", "zero_shot", "general_pe"},
    "05_structured_output": {"structured_output", "system_prompts", "few_shot", "general_pe"},
}

# AILE (Executive AI Leadership) topic filter mapping
# Topics match the build_aile_index.py AILE_TOPIC_MAP values
_AILE_PAGE_TOPICS = {
    # Modules — each module can access its own topic + prerequisite content + resources
    "aile_00_wakeup": {"wakeup", "resources"},
    "aile_01_demystify": {"demystify", "wakeup", "resources"},
    "aile_02_strategy": {"strategy", "wakeup", "demystify", "resources"},
    "aile_03_governance": {"governance", "strategy", "resources"},
    "aile_04_roi": {"roi", "strategy", "governance", "resources"},
    "aile_05_roadmap": {"roadmap", "roi", "strategy", "governance", "resources"},
    # Labs — each lab can access its related module topics + resources
    "01_self_assessment": {"wakeup", "demystify", "resources"},
    "02_genai_demo": {"demystify", "wakeup", "resources"},
    "03_competitive_analysis": {"strategy", "wakeup", "demystify", "resources"},
    "04_risk_audit": {"governance", "strategy", "resources"},
    "05_business_case": {"roi", "strategy", "governance", "resources"},
    "06_maturity_diagnostic": {"roadmap", "roi", "strategy", "governance", "demystify", "wakeup", "resources"},
}


def retrieve_context(
    query: str,
    page_id: str = "",
    course_id: str = "rl",
    top_k: int = 3,
    min_score: float = 0.3
) -> List[RetrievedChunk]:
    """Retrieve relevant course material chunks for a student query.
    
    Uses two-stage retrieval:
      Stage 1: Filter chunks by topic relevance to the current page.
      Stage 2: Rank remaining chunks by cosine similarity to the query.
    
    Args:
        query: The student's question.
        page_id: Current lab page ID (for topic filtering).
        course_id: Course identifier (default "rl").
        top_k: Maximum number of chunks to return.
        min_score: Minimum cosine similarity threshold.
    
    Returns:
        List of RetrievedChunk objects, sorted by relevance.
    """
    index = _load_index(course_id)
    if index is None:
        return []
    
    model = _get_embedding_model()
    if model is None:
        return []
    
    chunks = index["chunks"]
    embeddings = index["embeddings"]
    
    # Stage 1: Topic filtering
    if course_id == "pe":
        relevant_topics = _PE_PAGE_TOPICS.get(page_id, set())
    elif course_id == "aile":
        relevant_topics = _AILE_PAGE_TOPICS.get(page_id, set())
    else:
        relevant_topics = _PAGE_TOPICS.get(page_id, set())
    
    if relevant_topics:
        # Filter to chunks whose topic matches the current page
        # Also include chunks with pages="all"
        filtered_indices = [
            i for i, chunk in enumerate(chunks)
            if chunk["metadata"].get("topic", "") in relevant_topics
            or chunk["metadata"].get("pages", "") == "all"
        ]
    else:
        # No page filter — use all chunks
        filtered_indices = list(range(len(chunks)))
    
    if not filtered_indices:
        return []
    
    filtered_embeddings = embeddings[filtered_indices]
    
    # Stage 2: Cosine similarity
    query_embedding = model.encode([query], normalize_embeddings=True)
    similarities = np.dot(filtered_embeddings, query_embedding.T).flatten()
    
    # Keyword scoring (TF-IDF) if available
    tfidf_data = index.get("tfidf")
    if tfidf_data is not None:
        try:
            query_tfidf = tfidf_data['vectorizer'].transform([query])
            all_tfidf_scores = sklearn_cosine(query_tfidf, tfidf_data['matrix']).flatten()
            # Get keyword scores for filtered indices only
            keyword_scores = all_tfidf_scores[filtered_indices]
            # Hybrid: α * semantic + (1-α) * keyword
            alpha = 0.7
            similarities = alpha * similarities + (1 - alpha) * keyword_scores
        except Exception as e:
            logger.warning("TF-IDF scoring failed, using semantic only: %s", e)
    
    # Get top-k above threshold
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score < min_score:
            break
        
        chunk = chunks[filtered_indices[idx]]
        results.append(RetrievedChunk(
            source=chunk["metadata"].get("source", "unknown"),
            content=chunk["content"],
            relevance_score=score
        ))
    
    if results:
        logger.info(
            "Retrieved %d chunks for query '%s' (page=%s, best_score=%.3f)",
            len(results), query[:50], page_id, results[0].relevance_score
        )
    
    return results
