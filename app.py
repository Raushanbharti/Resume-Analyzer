import os, json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from docx import Document
from openai import OpenAI

load_dotenv()
app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

def extract_text(file):
    name = file.filename.lower()
    if name.endswith(".pdf"):
        reader = PdfReader(file)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if name.endswith(".docx"):
        doc = Document(file)
        chunks = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                chunks.append(" | ".join(cell.text for cell in row.cells))
        return "\n".join(chunks)
    raise ValueError("Please upload a PDF or DOCX file.")

@app.get("/api/health")
def health():
    return jsonify({"status":"ok"})

@app.post("/api/analyze")
def analyze():
    uploaded = request.files.get("resume")
    job_description = request.form.get("job_description", "").strip()
    if not uploaded:
        return jsonify({"error":"Upload a resume first."}), 400
    try:
        resume_text = extract_text(uploaded)
        if not resume_text.strip():
            return jsonify({"error":"Could not extract text. This may be a scanned PDF; try an OCR-readable file."}), 400
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return jsonify({"error":"OPENAI_API_KEY is missing in backend/.env. Add your key and restart Flask."}), 503
        client = OpenAI(api_key=api_key)
        prompt = f"""
Analyze this resume as a career coach. Be constructive, evidence-based, and never invent experience.
Return ONLY valid JSON using this schema:
{{
 "score": integer 0-100,
 "score_breakdown": {{"ats": integer, "grammar": integer, "formatting": integer, "keywords": integer, "experience": integer}},
 "strengths": [string],
 "weaknesses": [string],
 "suggestions": [string],
 "missing_skills": [string],
 "grammar_issues": [{{"issue": string, "suggestion": string}}],
 "formatting_issues": [string],
 "hr_questions": [string],
 "technical_questions": [string],
 "behavioral_questions": [string],
 "project_questions": [string],
 "coach": [{{"question": string, "sample_answer": string}}],
 "confidence_tips": [string],
 "communication_tips": [string]
}}
Use the job description to assess keyword relevance if supplied. If none, evaluate for a general software/technology role and clearly avoid claiming job-specific matching.
RESUME:
{resume_text[:24000]}
JOB DESCRIPTION:
{job_description[:12000] or "Not supplied"}
"""
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL","gpt-4o-mini"),
            messages=[{"role":"system","content":"You are a careful ATS resume reviewer and interview coach. Return JSON only."},
                      {"role":"user","content":prompt}],
            response_format={"type":"json_object"},
            temperature=0.35
        )
        data=json.loads(response.choices[0].message.content)
        data["extracted_text"]=resume_text[:24000]
        return jsonify(data)
    except ValueError as e:
        return jsonify({"error":str(e)}), 400
    except Exception as e:
        return jsonify({"error":f"Analysis failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
