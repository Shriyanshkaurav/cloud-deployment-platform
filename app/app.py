import os
from flask import Flask, jsonify

app = Flask(__name__)

APP_NAME = os.getenv("APP_NAME", "deployment-platform-demo")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "local")


@app.get("/")
def home():
    return jsonify({
        "application": APP_NAME,
        "version": APP_VERSION,
        "environment": ENVIRONMENT,
        "message": "Cloud deployment platform is running!"
    })


@app.get("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.get("/ready")
def ready():
    return jsonify({"status": "ready"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
