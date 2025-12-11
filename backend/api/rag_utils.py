import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

# 1. Setup Pinecone & Embeddings
# Ensure PINECONE_API_KEY is in your .env
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Use a lightweight model to save memory/time
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
INDEX_NAME = "chatbot" # Make sure this matches your Pinecone Dashboard

def index_document_to_pinecone(file_path, session_id):
    """
    Reads a PDF, chunks it, and UPLOADS vectors to Pinecone Cloud.
    Uses 'session_id' as a namespace to keep chats separate.
    """
    try:
        # 1. Load PDF
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        # 2. Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        # 3. Upload to Pinecone (Cloud)
        # We use 'namespace' to segregate data. Chat 1 data stays in Chat 1.
        PineconeVectorStore.from_documents(
            documents=splits,
            embedding=embeddings,
            index_name=INDEX_NAME,
            namespace=str(session_id) 
        )

        return True

    except Exception as e:
        print(f"Pinecone Index Error: {e}")
        return False

def get_retriever_for_session(session_id):
    """
    Connects to Pinecone and gets a retriever SPECIFIC to this session ID.
    """
    try:
        # 1. Connect to the Index
        vector_store = PineconeVectorStore(
            index_name=INDEX_NAME,
            embedding=embeddings,
            namespace=str(session_id) # ❗ Crucial: Only search this session's data
        )

        # 2. Create Retriever
        # We check if the index actually has data for this session is handled by Pinecone logic
        return vector_store.as_retriever(search_kwargs={"k": 3})
        
    except Exception as e:
        print(f"Retriever Error: {e}")
        return None