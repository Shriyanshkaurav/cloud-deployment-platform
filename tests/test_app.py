import os
import sys
from pathlib import Path

# Allow tests to import the application from the app directory.
APP_DIR = Path(__file__).resolve().parents[1] / "app"
sys.path.insert(0, str(APP_DIR))

# Ensure predictable values for these tests.
os.environ["APP_NAME"] = "deployment-platform-demo"
os.environ["APP_VERSION"] = "1.0.0"
os.environ["ENVIRONMENT"] = "test"

from app import app


def setup_module():
    app.config["TESTING"] = True


def test_home_endpoint():
    client = app.test_client()
    response = client.get("/")

    assert response.status_code == 200

    data = response.get_json()
    assert data["application"] == "deployment-platform-demo"
    assert data["version"] == "1.0.0"
    assert data["environment"] == "test"


def test_health_endpoint():
    client = app.test_client()
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}


def test_readiness_endpoint():
    client = app.test_client()
    response = client.get("/ready")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ready"}
