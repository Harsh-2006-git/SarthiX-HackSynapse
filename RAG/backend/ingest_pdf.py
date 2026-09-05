import os
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.rag.loader import PDFLoader
from app.rag.splitter import TextChunker
from app.rag.embedding import EmbeddingModel
from app.rag.vectorstore import VectorStore

def main():
    root_pdf = os.path.abspath("../../ujjain_simhastha_2028_rag_knowledge_base.pdf")
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    chroma_dir = os.getenv("CHROMA_DB_PATH", "./vectorstore")
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    print(f"Checking for root PDF at: {root_pdf}")
    if not os.path.exists(root_pdf):
        print(f"Error: {root_pdf} not found!")
        return

    # Ensure uploads directory exists for both default owner and root
    default_owner_dir = os.path.join(upload_dir, "default")
    os.makedirs(default_owner_dir, exist_ok=True)
    os.makedirs(upload_dir, exist_ok=True)

    filename = "ujjain_simhastha_2028_rag_knowledge_base.pdf"
    dest_path = os.path.join(default_owner_dir, filename)
    shutil.copy2(root_pdf, dest_path)
    print(f"Copied PDF to: {dest_path}")

    # Copy to root uploads as well
    root_upload_path = os.path.join(upload_dir, filename)
    shutil.copy2(root_pdf, root_upload_path)

    # Initialize RAG components
    print("Initializing Embedding model & Vector store...")
    loader = PDFLoader(upload_dir=upload_dir)
    chunker = TextChunker(chunk_size=800, chunk_overlap=100)
    embedding_model = EmbeddingModel(api_key=gemini_key)
    vector_store = VectorStore(persist_directory=chroma_dir, embedding_model=embedding_model)

    document_id = f"default/{filename}"
    print(f"Loading document: {document_id}")
    
    # Load and process
    documents = loader.load_documents([document_id])
    print(f"Extracted {len(documents)} pages from PDF.")

    for doc in documents:
        doc.metadata["owner_id"] = "default"

    chunks = chunker.split_documents(documents)
    print(f"Created {len(chunks)} text chunks.")

    print("Generating embeddings and upserting into ChromaDB...")
    num_chunks = vector_store.add_documents(chunks)
    print(f"Successfully embedded and indexed {num_chunks} chunks into VectorStore!")

    # Verify query
    test_query = "What is Ujjain Simhastha 2028 and Mahakal darshan?"
    print(f"\nTesting similarity search for query: '{test_query}'...")
    results = vector_store.similarity_search(test_query, top_k=2)
    for i, r in enumerate(results, 1):
        print(f"\nResult {i} (Score: {r.get('score', 0):.4f}):")
        print(f"Source: {r.get('metadata', {}).get('filename')} - Page {r.get('metadata', {}).get('page')}")
        print(f"Content: {r.get('content', '')[:200]}...")

    print("\n✅ PDF Knowledge Base ingestion and embedding completed successfully!")

if __name__ == "__main__":
    main()
