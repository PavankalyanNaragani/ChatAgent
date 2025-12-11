import os
from typing import TypedDict, List
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from django.conf import settings




# 1. LLM Setup
groq_api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    temperature=0.2,
    model="llama-3.3-70b-versatile",
    groq_api_key=groq_api_key
)


# 2. State Definition
class AgentState(TypedDict):
    messages: List[BaseMessage]
    context: str   # Holds PDF context


# 3. System Prompt
system_prompt = """
You are a helpful AI assistant called IntelliChat.

{context_instruction}

Answer the user's question based on the conversation history and the context provided above.
If the answer is not in the context, answer using your general knowledge.
"""


# 4. Node Function
def call_model(state: AgentState):
    messages = state["messages"]
    context = state.get("context", "")

    if context:
        context_instruction = (
            "Here is the context from the user's uploaded documents:\n\n" + context + "\n"
        )
    else:
        context_instruction = "No documents uploaded. Answer normally."

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
    ])

    chain = prompt | llm

    response = chain.invoke({
        "context_instruction": context_instruction,
        "messages": messages
    })

    return {
        "messages": messages + [response],
        "context": context
    }


# 5. Build Graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.set_entry_point("agent")
workflow.add_edge("agent", END)

ai_graph = workflow.compile()
