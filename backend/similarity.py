import base64
import json
import os
import sys
import pymongo
from bson import ObjectId
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer, util
from docx import Document  

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "studentPortal")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "submissions")

# Connect to MongoDB
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    plagiarism_collection = db["plagiarismresults"]
except Exception as e:
    print(json.dumps({"error": f"❌ MongoDB Connection Failed: {str(e)}"}, ensure_ascii=False))
    sys.exit(1)

# Load SBERT Model
model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_base64(doc):
    """Extract Base64 content from MongoDB document field."""
    try:
        if isinstance(doc["document"], dict) and "$binary" in doc["document"]:
            return doc["document"]["$binary"]["base64"]
        elif isinstance(doc["document"], bytes):
            return base64.b64encode(doc["document"]).decode("utf-8")
        elif isinstance(doc["document"], str):
            return doc["document"]
        else:
            return None
    except Exception:
        return None

def save_and_extract_text(student_id, base64_content):
    """Save Base64 docx as a file and extract text."""
    try:
        docx_filename = f"temp_{student_id}.docx"
        
        with open(docx_filename, "wb") as file:
            file.write(base64.b64decode(base64_content))
        
        try:
            document = Document(docx_filename)
            extracted_text = "\n".join([para.text for para in document.paragraphs])
        except Exception:
            extracted_text = "Extracted Text Not Available"
        finally:
            os.remove(docx_filename)  # Clean up temp file
        
        return extracted_text
    except Exception:
        return "Extracted Text Not Available"

def generate_highlighted_text(text1, text2):
    """Highlight plagiarized content between two texts."""
    common_words = set(text1.split()) & set(text2.split())  # Find common words
    highlighted_text = " ".join(
        [f"**{word}**" if word in common_words else word for word in text1.split()]
    )
    return highlighted_text

def check_similarity(threshold=30):
    try:
        output_data = {"message": "🔍 Running similarity check", "results": []}

        # Fetch already processed submission IDs
        existing_results = plagiarism_collection.find({}, {"submissionID": 1})
        processed_submissions = {res["submissionID"] for res in existing_results}

        # Fetch submissions from MongoDB
        documents = list(collection.find({}, {"_id": 1, "studentID": 1, "document": 1}))
        if not documents:
            return json.dumps({"error": "⚠️ No documents found"}, ensure_ascii=False)

        decoded_texts = {}
        for doc in documents:
            student_id = str(doc["_id"])  # ✅ Convert ObjectId to string
            base64_content = extract_base64(doc)
            extracted_text = save_and_extract_text(student_id, base64_content)
            decoded_texts[student_id] = extracted_text

        student_ids = list(decoded_texts.keys())
        texts = [decoded_texts[student] for student in student_ids]
        embeddings = model.encode(texts, convert_to_tensor=True)

        similarity_matrix = util.pytorch_cos_sim(embeddings, embeddings).numpy()

        results = []
        for i in range(len(student_ids)):
            for j in range(i + 1, len(student_ids)):
                similarity_score = float(round(similarity_matrix[i][j] * 100, 2))
                if similarity_score >= threshold:
                    student1, student2 = sorted([student_ids[i], student_ids[j]])
                    submission_id = f"{student1}_{student2}"

                    # ✅ Skip if already processed
                    if submission_id in processed_submissions:
                        continue

                    # ✅ Generate highlighted text
                    highlighted_text = generate_highlighted_text(decoded_texts[student1], decoded_texts[student2])

                    results.append({
                        "submissionID": submission_id,
                        "Student 1": student1,
                        "Student 2": student2,
                        "Similarity": similarity_score,
                        "Highlighted Text": highlighted_text
                    })

        if results:
            plagiarism_collection.insert_many(
                [{**res, "_id": str(ObjectId())} for res in results]  # ✅ Convert ObjectId to string
            )

        return json.dumps({"message": "✅ Results saved to database.", "results": results}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": f"❌ Error in similarity check: {str(e)}"}, ensure_ascii=False)

if __name__ == '__main__':
    try:
        threshold = 30  
        results = check_similarity()
        print(results)
    except Exception as e:
        print(json.dumps({"error": f"❌ Fatal Error: {str(e)}"}, ensure_ascii=False))
        sys.exit(1)