from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
import os

print("🚀 Starting Online Exam System...")

app = Flask(__name__)

# Configure CORS for production
from flask_cors import CORS

# Configure CORS properly for all deployed URLs
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://online-exam-system.web.app",
            "https://online-exam-system.firebaseapp.com",
            "https://online-exam-system-38b03.web.app",
            "https://online-exam-system-38b03.firebaseapp.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Firebase
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization failed: {e}")

# Import and register routes - FIXED IMPORT
try:
    # Explicit import to ensure routes are loaded
    from app.routes import routes
    app.register_blueprint(routes, url_prefix='/api')
    print("✅ Routes imported and registered successfully")
    print(f"✅ Registered routes: {[rule for rule in app.url_map.iter_rules()]}")
except Exception as e:
    print(f"❌ Routes error: {e}")
    import traceback
    traceback.print_exc()

# Test route at root
@app.route('/')
def home():
    return jsonify({"message": "Online Exam System API is running!"})

# Health check at root level too
@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "Online Exam System"})

# Add explicit API health check
@app.route('/api/health')
def api_health():
    return jsonify({"status": "healthy", "service": "Online Exam System API"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"✅ Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)