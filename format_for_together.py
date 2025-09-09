#!/usr/bin/env python3

import json
import pandas as pd

def format_conversations_for_together():
    """Convert the sales conversations to Together AI chat format"""
    
    # Read the original data
    with open('sales-conversations-data/train.jsonl', 'r') as f:
        data = [json.loads(line) for line in f]
    
    formatted_conversations = []
    
    for record in data:
        # Extract non-null conversation turns
        conversation_turns = []
        for i in range(20):  # 0-19 columns
            if record[str(i)] is not None:
                conversation_turns.append(record[str(i)])
        
        if len(conversation_turns) < 2:  # Skip if not enough turns
            continue
            
        # Format as chat messages
        messages = []
        for i, turn in enumerate(conversation_turns):
            if i % 2 == 0:  # Even indices are customers
                if turn.startswith("Customer: "):
                    content = turn.replace("Customer: ", "", 1)
                else:
                    content = turn
                messages.append({
                    "role": "user",
                    "content": content
                })
            else:  # Odd indices are salesmen
                if turn.startswith("Salesman: "):
                    content = turn.replace("Salesman: ", "", 1)
                else:
                    content = turn
                messages.append({
                    "role": "assistant", 
                    "content": content
                })
        
        if messages:  # Only add if we have messages
            formatted_conversations.append({
                "messages": messages
            })
    
    # Save formatted data
    with open('sales-conversations-data/train_together_format.jsonl', 'w') as f:
        for conversation in formatted_conversations:
            json.dump(conversation, f, ensure_ascii=False)
            f.write('\n')
    
    print(f"Formatted {len(formatted_conversations)} conversations for Together AI")
    print("Saved to: sales-conversations-data/train_together_format.jsonl")
    
    # Show a sample
    if formatted_conversations:
        print("\nSample conversation:")
        print(json.dumps(formatted_conversations[0], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    format_conversations_for_together()