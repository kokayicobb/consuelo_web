# src/components/on-call-coaching/script.py
from flask import Flask, request, Response, jsonify
import json
import PyPDF2
import chromadb
from sentence_transformers import SentenceTransformer
from chromadb.utils import embedding_functions
from groq import Groq
from twilio.rest import Client
import instructor
from pydantic import BaseModel
from typing import List
from datetime import datetime
from flask_cors import CORS
from dotenv import load_dotenv
import os
from urllib.parse import quote

load_dotenv() 

app = Flask(__name__)
# This should handle everything
CORS(app, 
     origins="*", 
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# === Twilio Configuration ===
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_NUMBER")

# It's also good practice to check if the variables were loaded successfully
if not all([TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER]):
    raise ValueError("Twilio credentials are not set in the .env file")

twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

# === Product Catalogue Embedding and Retrieval Logic ===
# Load SBERT for embedding
sbert = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize ChromaDB
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="product_catalogue")

# Initialize Groq client with instructor
groq_client = Groq()
groq_client = instructor.from_groq(groq_client)

# Pydantic model for structured talking points
class TalkingPoints(BaseModel):
    points: List[str]
    reasoning: str
    timestamp: datetime = None

# Path to the product catalogue (static for now)
PRODUCT_CATALOGUE_PATH = "UCS Product Guide 2025.pdf"  # Change as needed

# Conversation history (global, for demo; in production, use per-session)
conversation = []

# Global variable to store latest talking points
latest_talking_points = None

# --- Utility Functions from main.py ---
def read_file(filepath):
    if filepath.endswith('.pdf'):
        return read_pdf(filepath)
    else:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

def read_pdf(path):
    text = ""
    with open(path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text()
    return text

def chunk_text(text, chunk_size=500):
    words = text.split()
    return [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

def embed_and_store(chunks):
    for i, chunk in enumerate(chunks):
        embedding = sbert.encode(chunk).tolist()
        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            ids=[f"chunk_{i}"]
        )

def retrieve_context(conversation, top_k=3):
    all_messages = " ".join([msg['content'] for msg in conversation])
    if not conversation:
        return []
    latest_message = conversation[-1]['content']
    weighted_query = all_messages + " " + (latest_message + " ") * 3
    query_embedding = sbert.encode(weighted_query.strip()).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results['documents'][0]

def generate_talking_points(context_chunks, conversation):
    prompt = (
        "You are a sales agent for this business. "
        "Given the following real-time sales conversation and relevant product or service catalogue context, "
        "suggest the next talking points for the sales rep. "
        "Prioritize addressing the latest customer message and use the context to inform your suggestions.\n\n"
        "Product/Service Catalogue Context:\n"
        + "\n\n".join(context_chunks) +
        "\n\nConversation so far:\n"
        + "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation]) +
        "\n\nWhat should the sales rep say next? Provide 3 simple, up to 5-6 word talking points in response to the customer's latest message. Make sure to keep it short and concise."
    )
    
    try:
        # Get structured response using instructor
        talking_points = groq_client.chat.completions.create(
            model="gemma2-9b-it",
            messages=[{"role": "user", "content": prompt}],
            response_model=TalkingPoints,
            temperature=0,
            max_tokens=512,
            top_p=1,
        )
        
        print(f"\n--- Suggested Talking Points for Sales Rep ---")
        print(f"Points: {', '.join(talking_points.points)}")
        print(f"Reasoning: {talking_points.reasoning}")
        
        # Store the result in the global variable and add a timestamp
        global latest_talking_points
        talking_points.timestamp = datetime.now()
        latest_talking_points = talking_points
        
        return talking_points
        
    except Exception as e:
        print(f"Error generating talking points: {e}")
        # Fallback to simple response
        return TalkingPoints(
            points=["Focus on customer needs", "Highlight key benefits", "Ask qualifying questions"],
            reasoning="Fallback response due to error in structured generation",
            timestamp=datetime.now()
        )

# --- On Startup: Load and Embed Product Catalogue ---
print("[Startup] Reading product catalogue...")
full_text = read_file(PRODUCT_CATALOGUE_PATH)
chunks = chunk_text(full_text)
print("[Startup] Embedding and storing product catalogue in vector DB...")
embed_and_store(chunks)

@app.route("/end_call", methods=["POST"])
def end_call():
    """Endpoint to end/hangup a call."""
    try:
        data = request.get_json()
        call_sid = data.get('call_sid')
        
        if not call_sid:
            return {"error": "Missing call_sid"}, 400
            
        # End the call using Twilio
        call = twilio_client.calls(call_sid).update(status='completed')
        
        return {
            "success": True,
            "message": f"Call {call_sid} ended successfully"
        }, 200
        
    except Exception as e:
        return {"error": f"Failed to end call: {str(e)}"}, 500
@app.route("/", methods=["GET"])
def home():
    """Home endpoint to verify the server is running."""
    return {
        "message": "Sales Coaching API is running!",
        "endpoints": {
            "GET /": "This home page",
            "GET /talking_points": "Get latest talking points",
            "POST /make_call": "Initiate a sales call",
            "POST /stream": "Twilio stream endpoint",
            "POST /transcription": "Twilio transcription webhook",
            "POST /call_status": "Twilio call status webhook"
        }
    }, 200
@app.route("/stream", methods=["POST"])
def stream_twiml():
    """Twilio will hit this endpoint with POST to start the call."""
    
    # Get customer_number from query parameters (not POST values)
    customer_number = request.args.get("customer_number")
    
    # Debug print
    print(f"🔍 Stream endpoint called with customer_number: {customer_number}")
    print(f"📋 Request args: {dict(request.args)}")
    print(f"📋 Request values: {dict(request.values)}")
    
    # Use your public Codespace URL
    callback_url = "https://shiny-journey-4px597q46ph5794-5001.app.github.dev/transcription"
    base_url = "https://shiny-journey-4px597q46ph5794-5001.app.github.dev"

    if customer_number:
        # This is the leg where we connect to the customer
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Start>
        <Transcription statusCallbackUrl="{callback_url}" partialResults="true" track="both_tracks"/>
    </Start>
    <Say>Connecting you to the customer now. Please wait.</Say>
    <Dial callerId="{TWILIO_NUMBER}" timeout="30" action="{base_url}/dial_status" method="POST">
        <Number>{customer_number}</Number>
    </Dial>
</Response>"""
    else:
        # No customer number provided
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Error: No customer number provided. Please check the configuration.</Say>
    <Hangup/>
</Response>"""

    print(f"📞 Generated TwiML: {twiml}")
    return Response(twiml, mimetype="text/xml")

@app.route("/dial_status", methods=["POST"])
def dial_status():
    """
    Handle the result of the dial attempt.
    This is the UPDATED and CORRECTED function.
    """
    dial_call_status = request.form.get("DialCallStatus")
    
    # Enhanced logging to see all data from Twilio
    print(f"📞 Dial Status Callback Received. Status: {dial_call_status}")
    print(f"📋 Full Form Data from Twilio: {dict(request.form)}")

    # The 'failed' status is the one we need to diagnose
    if dial_call_status == "failed":
        error_code = request.form.get("ErrorCode")
        print(f"❌ Dial failed with ErrorCode: {error_code}")

        # Create a user-friendly message based on common Twilio error codes
        error_message = "The call to the customer failed. "
        if error_code == '21211':
            error_message += "The phone number appears to be invalid. Please check the number and try again."
        elif error_code == '21217':
            error_message += "This account does not have permission to call this region. Please enable the correct geographic permissions in your Twilio console."
        elif error_code == '21614':
            error_message += "The customer's number is not a verified number for your trial account. You must verify the number in your Twilio console before calling."
        else:
            error_message += f"Twilio reported error code {error_code}. Please check the call logs in your Twilio console for more details."

        # Generate TwiML that speaks the detailed error message to the sales agent
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>{error_message}</Say>
    <Hangup/>
</Response>"""
    
    elif dial_call_status == "completed":
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>The customer has disconnected. Goodbye.</Say>
    <Hangup/>
</Response>"""
    elif dial_call_status == "busy":
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>The customer's line is busy. Please try again later.</Say>
    <Hangup/>
</Response>"""
    elif dial_call_status == "no-answer":
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>The customer did not answer.</Say>
    <Hangup/>
</Response>"""
    else:  # Handles other statuses like 'canceled'
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Call status was {dial_call_status}. Ending the call now.</Say>
    <Hangup/>
</Response>"""
    
    return Response(twiml, mimetype="text/xml")
@app.route("/make_call", methods=["POST", "OPTIONS"])
def make_call():
    """
    Endpoint to initiate a call to a specified phone number.
    This is the UPDATED and CORRECTED function.
    """
    if request.method == "OPTIONS":
        # Handle preflight request
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    try:
        data = request.get_json()
        if not data or 'sales_agent_number' not in data or 'customer_number' not in data:
            return {"error": "Missing 'sales_agent_number' or 'customer_number' in request body"}, 400

        sales_agent_number = data['sales_agent_number']
        customer_number = data['customer_number']

        # Use your public Codespace URL
        base_url = "https://shiny-journey-4px597q46ph5794-5001.app.github.dev"
        
        # === THE FIX IS HERE ===
        # We must URL-encode the customer number to ensure the '+' is preserved.
        encoded_customer_number = quote(customer_number)
        stream_url = f"{base_url}/stream?customer_number={encoded_customer_number}"
        # =======================

        print(f"DEBUG: Initiating call with stream URL: {stream_url}")

        call = twilio_client.calls.create(
            to=sales_agent_number,
            from_=TWILIO_NUMBER,
            url=stream_url,
            status_callback=f"{base_url}/call_status",
            status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
            status_callback_method='POST'
        )

        return jsonify({
            "success": True,
            "call_sid": call.sid,
            "message": f"Call initiated to sales agent {sales_agent_number}, will connect to customer {customer_number}"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to initiate call: {str(e)}"}), 500
    
@app.route("/call_status", methods=["POST"])
def call_status():
    """Handle Twilio call status callbacks."""
    call_sid = request.form.get("CallSid")
    call_status = request.form.get("CallStatus")
    call_duration = request.form.get("CallDuration")
    
    print(f"📞 Call Status Update - SID: {call_sid}, Status: {call_status}, Duration: {call_duration}")
    
    if call_status == "completed":
        print(f"✅ Call completed - Duration: {call_duration} seconds")
    elif call_status == "answered":
        print(f"📱 Call answered - Starting transcription")
    
    return Response(status=200)

@app.route("/talking_points", methods=["GET"])
def get_talking_points():
    """Retrieve the latest talking points for the sales rep."""
    global latest_talking_points
    
    if latest_talking_points is None:
        return {
            "error": "No talking points available yet. Start a conversation to generate talking points."
        }, 404
    
    return {
        "success": True,
        "talking_points": {
            "points": latest_talking_points.points,
            "reasoning": latest_talking_points.reasoning,
            "timestamp": getattr(latest_talking_points, 'timestamp', None)
        }
    }, 200

@app.route("/transcription", methods=["POST"])
def transcription():
    """Twilio will send transcription updates here."""
    event = request.form.get("TranscriptionEvent")

    if event == "transcription-content":
        track = request.form.get("Track")
        transcription_data_str = request.form.get("TranscriptionData")
        if transcription_data_str:
            transcription_data = json.loads(transcription_data_str)
            transcript = transcription_data.get("transcript")
            if transcript:
                final = request.form.get("Final") == 'true'
                stability = request.form.get("Stability")
                prefix = "✅" if final else f"⏳({stability})"
                print(f"{prefix} [{track}]: {transcript}")
                if final:
                    # Append to conversation as customer (for demo; you may want to distinguish roles)
                    # Determine role based on track
                    if track and track.lower() == "inbound":
                        role = "customer"
                    elif track and track.lower() == "outbound":
                        role = "sales_rep"
                    else:
                        role = "unknown"
                    conversation.append({"role": role, "content": transcript})
                    # Retrieve relevant context
                    context = retrieve_context(conversation, top_k=3)
                    print("\n--- Suggested Talking Points for Sales Rep ---")
                    # Generate and store talking points
                    talking_points = generate_talking_points(context, conversation)
                    print(f"Talking points generated and stored. Access via GET /talking_points")
    elif event in ["transcription-started", "transcription-stopped", "transcription-error"]:
        print(f"--- {event} ---")
        for key, value in request.form.items():
            print(f"  {key}: {value}")

    return Response(status=200)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)