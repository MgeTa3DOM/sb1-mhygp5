from flask import Flask, request, jsonify, render_template
from google.cloud import secretmanager, storage, bigquery, texttospeech, speech
import requests
import json
import os
import base64
from cryptography.fernet import Fernet

app = Flask(__name__)

# Google Cloud Setup
credentials, project_id = google.auth.default()
secret_manager_client = secretmanager.SecretManagerServiceClient()
storage_client = storage.Client()
bigquery_client = bigquery.Client()
text_to_speech_client = texttospeech.TextToSpeechClient()
speech_client = speech.SpeechClient()

bucket_name = "your-bucket-name" # Replace with your bucket name

def get_secret(secret_id):
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    response = secret_manager_client.access_secret_version(name=name)
    return response.payload.data.decode("UTF-8")

# API Keys (replace with your actual keys)
SUMUP_API_KEY = get_secret("sumup-api-key")
WHATSAPP_API_KEY = get_secret("whatsapp-api-key")
BREVO_API_KEY = get_secret("brevo-api-key")
CANVA_API_KEY = get_secret("canva-api-key")

# Encryption
key = Fernet.generate_key()
f = Fernet(key)

# Data Storage (in-memory for simplicity, replace with database for production)
orders = {}
drivers = {}
inventory = {}

def load_data():
    global orders, drivers, inventory
    try:
        with open("data/orders.json", "r") as f:
            orders = json.load(f)
        with open("data/drivers.json", "r") as f:
            drivers = json.load(f)
        with open("data/inventory.json", "r") as f:
            inventory = json.load(f)
    except FileNotFoundError:
        pass

def save_data():
    with open("data/orders.json", "w") as f:
        json.dump(orders, f)
    with open("data/drivers.json", "w") as f:
        json.dump(drivers, f)
    with open("data/inventory.json", "w") as f:
        json.dump(inventory, f)

load_data()

# --- API Endpoints ---

# Add Order
@app.route('/api/add_order', methods=['POST'])
def add_order():
    data = request.get_json()
    order_id = len(orders) + 1
    orders[order_id] = {**data, "id": order_id, "status": "received"}
    save_data()
    return jsonify({"message": "Order added", "orderId": order_id})

# Get Orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify(orders)

# Update Order Status
@app.route('/api/update_order/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json()
    if order_id in orders:
        orders[order_id]["status"] = data.get("status", orders[order_id]["status"])
        save_data()
        return jsonify({"message": "Order status updated"})
    return jsonify({"error": "Order not found"}), 404

# Manage Drivers
@app.route('/api/drivers', methods=['GET', 'POST'])
def manage_drivers():
    if request.method == 'GET':
        return jsonify(drivers)
    data = request.get_json()
    driver_id = len(drivers) + 1
    drivers[driver_id] = {**data, "id": driver_id}
    save_data()
    return jsonify({"message": "Driver added", "driverId": driver_id})

# Update Driver Location
@app.route('/api/drivers/<int:driver_id>/location', methods=['PUT'])
def update_driver_location(driver_id):
    data = request.get_json()
    if driver_id in drivers:
        drivers[driver_id]["location"] = data.get("location", drivers[driver_id]["location"])
        save_data()
        return jsonify({"message": "Driver location updated"})
    return jsonify({"error": "Driver not found"}), 404

# Manage Inventory
@app.route('/api/inventory', methods=['GET', 'POST', 'PUT'])
def manage_inventory():
    if request.method == 'GET':
        return jsonify(inventory)
    elif request.method == 'POST':
        data = request.get_json()
        item_id = len(inventory) + 1
        inventory[item_id] = {**data, "id": item_id}
        save_data()
        return jsonify({"message": "Inventory item added", "itemId": item_id})
    elif request.method == 'PUT':
        data = request.get_json()
        item_id = data.get("id")
        if item_id in inventory:
            inventory[item_id].update(data)
            save_data()
            return jsonify({"message": "Inventory item updated"})
        return jsonify({"error": "Inventory item not found"}), 404
    return jsonify({"error": "Invalid request method"}), 405

# --- Helper Functions ---

def encrypt_data(data):
    return f.encrypt(json.dumps(data).encode())

def decrypt_data(encrypted_data):
    return json.loads(f.decrypt(encrypted_data).decode())

# --- HTML Templates ---

@app.route('/admin')
def admin_template():
    return render_template('admin.html')

@app.route('/kds')
def kds_template():
    return render_template('kds.html')

@app.route('/driver')
def driver_template():
    return render_template('driver.html')

@app.route('/client')
def client_template():
    return render_template('client.html')

# --- Run App ---

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
