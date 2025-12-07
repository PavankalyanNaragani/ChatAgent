import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List


groq_api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    temperature=0, 
    model="llama-3.3-70b-versatile",
    groq_api_key=groq_api_key
)

# The "State" is the memory that gets passed between nodes (e.g., from RAG node to Generation node)
class State(TypedDict):
    messages: List[HumanMessage]
    answer: str

# 3. Define the Node (The Logic)
def generate_response(state: State):
    # Get the user's latest message
    user_message = state["messages"][-1]
    
    # Call Gemini
    response = llm.invoke([user_message])
    
    # Return the updated state
    return {"answer": response.content}

# 4. Build the Graph
workflow = StateGraph(State)

# Add nodes (steps in the workflow)
workflow.add_node("chatbot", generate_response)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)

ai_graph = workflow.compile()