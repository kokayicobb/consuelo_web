#!/usr/bin/env python3

from datasets import Dataset, DatasetDict
from huggingface_hub import HfApi
import json
import os

def upload_dataset():
    print("Loading the formatted dataset...")
    
    # Load the Together AI formatted data
    conversations = []
    with open('sales-conversations-data/train_together_format.jsonl', 'r') as f:
        for line in f:
            conversations.append(json.loads(line))
    
    print(f"Loaded {len(conversations)} conversations")
    
    # Create a Hugging Face dataset
    dataset = Dataset.from_list(conversations)
    
    # Create a DatasetDict with train split
    dataset_dict = DatasetDict({
        'train': dataset
    })
    
    print("Dataset prepared for upload:")
    print(dataset_dict)
    
    # Upload to Hugging Face Hub
    repo_id = "consuelo-sales-conversations"
    
    try:
        print(f"Uploading to Hugging Face Hub as {repo_id}...")
        dataset_dict.push_to_hub(repo_id, private=False)
        print(f"✅ Successfully uploaded to: https://huggingface.co/datasets/{repo_id}")
        
    except Exception as e:
        print(f"❌ Error uploading: {e}")
        print("\n🔑 You need to authenticate with Hugging Face first:")
        print("Run: huggingface-cli login")
        print("Or set HF_TOKEN environment variable")
        return False
    
    return True

if __name__ == "__main__":
    upload_dataset()