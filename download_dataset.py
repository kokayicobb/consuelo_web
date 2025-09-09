#!/usr/bin/env python3

from datasets import load_dataset
import pandas as pd
import json
import os

def main():
    print("Loading dataset from Hugging Face...")
    ds = load_dataset("goendalf666/sales-conversations")
    
    print("Dataset loaded successfully!")
    print(f"Dataset structure: {ds}")
    
    # Create output directory
    os.makedirs("sales-conversations-data", exist_ok=True)
    
    # Process each split (train, validation, test if they exist)
    for split_name in ds.keys():
        split_data = ds[split_name]
        print(f"Processing {split_name} split with {len(split_data)} examples...")
        
        # Convert to pandas DataFrame for easier manipulation
        df = split_data.to_pandas()
        
        # Save as JSONL for Together AI
        jsonl_path = f"sales-conversations-data/{split_name}.jsonl"
        with open(jsonl_path, 'w', encoding='utf-8') as f:
            for _, row in df.iterrows():
                json.dump(row.to_dict(), f, ensure_ascii=False)
                f.write('\n')
        
        print(f"Saved {split_name} split to {jsonl_path}")
        
        # Also save as CSV for convenience
        csv_path = f"sales-conversations-data/{split_name}.csv"
        df.to_csv(csv_path, index=False)
        print(f"Saved {split_name} split to {csv_path}")
    
    print("\nDataset download and conversion completed!")
    print("Files saved in ./sales-conversations-data/")

if __name__ == "__main__":
    main()