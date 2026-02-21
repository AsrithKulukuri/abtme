"""
RAG System - Retrieval-Augmented Generation
Reads website content and retrieves relevant context for AI responses
"""

import json
import os
import numpy as np
from typing import List, Dict, Tuple
import google.generativeai as genai
from config import (
    GEMINI_API_KEY,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    TOP_K_RESULTS,
    EMBEDDING_MODEL,
)


class RAGSystem:
    def __init__(self, knowledge_path: str = "../ai/knowledge.json"):
        """Initialize RAG system with knowledge base"""
        genai.configure(api_key=GEMINI_API_KEY)
        self.knowledge_path = knowledge_path
        self.chunks = []
        self.embeddings = []
        self.index_path = "../ai/rag_index.json"

        # Load or build index
        if os.path.exists(self.index_path):
            self._load_index()
        else:
            self._build_index()

    def _load_knowledge(self) -> dict:
        """Load knowledge base from JSON"""
        with open(self.knowledge_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0

        while start < len(text):
            end = start + CHUNK_SIZE
            chunk = text[start:end]
            chunks.append(chunk)
            start += CHUNK_SIZE - CHUNK_OVERLAP

        return chunks

    def _flatten_knowledge(self, knowledge: dict, prefix: str = "") -> List[Dict]:
        """Convert nested JSON to flat text chunks with metadata"""
        chunks = []

        def process_value(key, value, path):
            if isinstance(value, dict):
                for k, v in value.items():
                    process_value(k, v, f"{path}/{key}" if path else key)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        # Convert dict items to readable text
                        text = " ".join(f"{k}: {v}" for k, v in item.items())
                        chunks.append({
                            "text": text,
                            "category": path or key,
                            "key": key
                        })
                    else:
                        chunks.append({
                            "text": str(item),
                            "category": path or key,
                            "key": key
                        })
            else:
                chunks.append({
                    "text": f"{key}: {value}",
                    "category": path,
                    "key": key
                })

        for key, value in knowledge.items():
            process_value(key, value, "")

        return chunks

    def _build_index(self):
        """Build embeddings index from knowledge base"""
        print("🔨 Building RAG index...")

        knowledge = self._load_knowledge()
        flat_chunks = self._flatten_knowledge(knowledge)

        # Generate embeddings for each chunk
        for chunk in flat_chunks:
            text = chunk["text"]

            # Get embedding from Gemini
            embedding_result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text,
                task_type="retrieval_document"
            )

            embedding = embedding_result["embedding"]

            self.chunks.append(chunk)
            self.embeddings.append(embedding)

        # Save index
        self._save_index()
        print(f"✅ Built index with {len(self.chunks)} chunks")

    def _save_index(self):
        """Save embeddings and chunks to disk"""
        index_data = {
            "chunks": self.chunks,
            # Convert numpy if needed
            "embeddings": [emb for emb in self.embeddings]
        }

        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(index_data, f, indent=2)

    def _load_index(self):
        """Load pre-built index from disk"""
        with open(self.index_path, "r", encoding="utf-8") as f:
            index_data = json.load(f)

        self.chunks = index_data["chunks"]
        self.embeddings = [np.array(emb) for emb in index_data["embeddings"]]
        print(f"✅ Loaded RAG index with {len(self.chunks)} chunks")

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        a = np.array(a)
        b = np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def retrieve(self, query: str, top_k: int = TOP_K_RESULTS) -> List[Dict]:
        """
        Retrieve top-K most relevant chunks for a query
        Returns: List of {text, category, score}
        """
        # Generate query embedding with Gemini
        embedding_result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query"
        )
        query_embedding = embedding_result["embedding"]

        # Calculate similarities
        similarities = []
        for i, chunk_embedding in enumerate(self.embeddings):
            score = self._cosine_similarity(query_embedding, chunk_embedding)
            similarities.append((i, score))

        # Sort by similarity (highest first)
        similarities.sort(key=lambda x: x[1], reverse=True)

        # Get top-K results
        results = []
        for i, score in similarities[:top_k]:
            chunk = self.chunks[i].copy()
            chunk["score"] = float(score)
            results.append(chunk)

        return results

    def format_context(self, results: List[Dict]) -> str:
        """Format retrieved chunks into context string for prompt"""
        if not results:
            return "[No relevant context found in knowledge base]"

        context_parts = ["[CONTEXT FROM WEBSITE]"]

        for i, result in enumerate(results, 1):
            category = result.get("category", "general")
            text = result["text"]
            score = result.get("score", 0)

            context_parts.append(
                f"\n{i}. [{category}] {text} (relevance: {score:.2f})")

        context_parts.append("\n[END CONTEXT]\n")

        return "\n".join(context_parts)

    def get_context_for_query(self, query: str) -> str:
        """Main method: retrieve and format context for a query"""
        results = self.retrieve(query)
        return self.format_context(results)


# Global instance (lazy loading)
_rag_system = None


def get_rag_system() -> RAGSystem:
    """Get or create RAG system instance"""
    global _rag_system
    if _rag_system is None:
        _rag_system = RAGSystem()
    return _rag_system
