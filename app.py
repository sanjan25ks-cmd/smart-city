from flask import Flask, jsonify, render_template, request
from datetime import datetime
import random

app = Flask(__name__)

CITIES = ["Chennai", "Mumbai", "Delhi", "Bengaluru", "Kolkata"]

# Complaints are stored in memory (a list). Restarting the server clears them.
complaints = []


def aqi_category(aqi):
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    return "Very Poor"


def generate_city_data(city):
    """Pretend to be IoT sensors by generating random values."""
    traffic = random.randint(10, 100)        # % congestion
    aqi = random.randint(30, 400)            # air quality index
    bin_fill = random.randint(10, 100)       # % full
    water_level = random.randint(10, 100)    # % reservoir level
    faulty_lights = random.randint(0, 15)    # number of faulty streetlights

    alerts = []
    if traffic > 80:
        alerts.append("Heavy traffic congestion. Use alternate routes.")
    if aqi > 200:
        alerts.append("Air quality is poor. Avoid outdoor activities.")
    if bin_fill > 85:
        alerts.append("Garbage bins almost full. Send a collection truck.")
    if water_level < 25:
        alerts.append("Water reservoir level is low.")
    if faulty_lights > 10:
        alerts.append("Many streetlights are faulty. Send a repair team.")

    return {
        "city": city,
        "time": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
        "traffic": traffic,
        "aqi": aqi,
        "aqi_category": aqi_category(aqi),
        "bin_fill": bin_fill,
        "water_level": water_level,
        "faulty_lights": faulty_lights,
        "alerts": alerts,
    }


@app.route("/")
def home():
    return render_template("index.html", cities=CITIES)


@app.route("/api/data/<city>")
def city_data(city):
    if city not in CITIES:
        return jsonify({"error": "City not found"}), 404
    return jsonify(generate_city_data(city))


@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    return jsonify(complaints)


@app.route("/api/complaints", methods=["POST"])
def add_complaint():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    category = str(data.get("category", "")).strip()
    message = str(data.get("message", "")).strip()

    if not name or not message:
        return jsonify({"error": "Name and message are required"}), 400

    complaint = {
        "id": len(complaints) + 1,
        "name": name[:50],
        "category": category[:30],
        "message": message[:300],
        "status": "Open",
        "time": datetime.now().strftime("%d-%m-%Y %H:%M"),
    }
    complaints.insert(0, complaint)
    return jsonify(complaint), 201


if __name__ == "__main__":
    app.run(debug=True)