import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from django.conf import settings

# Embedding Model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


def index_document_to_chroma(file_path, session_id):
    """
    Reads a PDF, chunks it, and saves vectors to a session-based ChromaDB folder.
    """
    try:
        # Load PDF
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        # Persist directory for this session
        persist_directory = os.path.join(settings.BASE_DIR, "chroma_db", str(session_id))

        # Create vector store (embedding required here)
        Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=persist_directory
        )

        return True

    except Exception as e:
        print(f"Index Error: {e}")
        raise e



def get_retriever_for_session(session_id):
    """
    Loads the Chroma vector store for the session & returns a retriever.
    """
    persist_directory = os.path.join(settings.BASE_DIR, "chroma_db", str(session_id))

    if not os.path.exists(persist_directory):
        return None

    # ❗ MUST include embedding_function when loading Chroma
    vector_store = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )

    return vector_store.as_retriever(search_kwargs={"k": 3})
