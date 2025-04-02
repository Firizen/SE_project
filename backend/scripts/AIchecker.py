import json
import sys
import torch
import re
import os
import glob
import PyPDF2
import docx
from transformers import GPT2LMHeadModel, GPT2TokenizerFast, GPT2Config
from collections import OrderedDict
import logging


class GPT2PPL:
    def __init__(self, device="cuda", model_id="gpt2"):
        self.device = device
        self.model_id = model_id

        config = GPT2Config.from_pretrained(model_id)
        config.loss_type = "ForCausalLMLoss"

        self.model = GPT2LMHeadModel.from_pretrained(model_id, config=config).to(device)
        self.tokenizer = GPT2TokenizerFast.from_pretrained(model_id)

        self.max_length = self.model.config.n_positions
        self.stride = 512

    def getResults(self, threshold):
        if threshold < 60:
            return {"message": "The Text is generated by AI.", "AI_Plagiarism_Score": 100 - threshold, "label": 0}
        elif threshold < 80:
            return {"message": "The Text most probably contains parts generated by AI. (Require more text for better judgment)", "AI_Plagiarism_Score": 100 - threshold, "label": 0}
        else:
            return {"message": "The Text is written by a Human.", "label": 1}

    def read_documents(self, directory):
        documents = []
        for file_path in glob.glob(os.path.join(directory, "*.docx")):
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            documents.append({"file": os.path.basename(file_path), "text": text})

        for file_path in glob.glob(os.path.join(directory, "*.pdf")):
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                documents.append({"file": os.path.basename(file_path), "text": text})

        return documents

    def check_documents(self, directory):
        documents = self.read_documents(directory)
        results_list = []

        for doc in documents:
            results, output = self.__call__(doc["text"])
            results_list.append({"File": doc["file"], "Results": results, "Output": output})

        return results_list

    def __call__(self, sentence):
        results = OrderedDict()
        total_valid_char = re.findall("[a-zA-Z0-9]+", sentence)
        total_valid_char = sum([len(x) for x in total_valid_char])

        if total_valid_char < 100:
            return {"status": "Error", "message": "Please input more text (min 100 characters)"}, "Error"

        lines = re.split(r'(?<=[.?!][ \[\(])|(?<=\n)\s*', sentence)
        lines = list(filter(lambda x: (x is not None) and (len(x) > 0), lines))

        ppl = self.getPPL(sentence)
        results["Perplexity"] = ppl

        Perplexity_per_line = [self.getPPL(line) for line in lines if re.search("[a-zA-Z0-9]+", line)]
        results["Perplexity per line"] = sum(Perplexity_per_line) / len(Perplexity_per_line) if Perplexity_per_line else 0
        results["Burstiness"] = max(Perplexity_per_line) if Perplexity_per_line else 0

        out = self.getResults(results["Perplexity per line"])
        results["label"] = out["label"]

        return results, out

    def getPPL(self, sentence):
        encodings = self.tokenizer(sentence, return_tensors="pt")
        seq_len = encodings.input_ids.size(1)

        nlls = []
        prev_end_loc = 0
        for begin_loc in range(0, seq_len, self.stride):
            end_loc = min(begin_loc + self.max_length, seq_len)
            trg_len = end_loc - prev_end_loc
            input_ids = encodings.input_ids[:, begin_loc:end_loc].to(self.device)
            target_ids = input_ids.clone()
            target_ids[:, :-trg_len] = -100

            with torch.no_grad():
                outputs = self.model(input_ids, labels=target_ids)
                neg_log_likelihood = outputs.loss * trg_len
                nlls.append(neg_log_likelihood)

            prev_end_loc = end_loc
            if end_loc == seq_len:
                break
        ppl = int(torch.exp(torch.stack(nlls).sum() / end_loc))
        return ppl


if __name__ == "__main__":
    logging.getLogger("transformers").setLevel(logging.ERROR)
    directory_path = "c:/Users/dvpry/Downloads/Content"
    detector = GPT2PPL(device="cpu")  # Change to "cuda" if GPU is available
    results = detector.check_documents(directory_path)

    # Output only valid JSON for Node.js
    sys.stdout.write(json.dumps({"status": "success", "documents": results}))
