import os
import sys

# Make sure the backend directory is on the path when running via python app.py
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.upload import upload_bp
from routes.assets import assets_bp
from routes.reports import reports_bp

app = Flask(__name__, static_folder=None)
CORS(app)

# Register blueprints under /api prefix
app.register_blueprint(upload_bp, url_prefix="/api")
app.register_blueprint(assets_bp, url_prefix="/api")
app.register_blueprint(reports_bp, url_prefix="/api")


@app.route("/api/health", methods=["GET"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
