# NLP Module — Claim Extraction & Verification

## Overview
This folder contains the scripts to:
1. Extract structured claims from `data/cleaned/snippets.jsonl` → `claims/`
2. Verify claims using embeddings and label evidence → `verification/`
3. Export lightweight graphs for visualization → `graph/`

## Setup
Create and activate virtualenv, install requirements:
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
