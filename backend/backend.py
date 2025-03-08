# api.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import random
import time


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins='*') 

data = defaultData = [
    {
        'fridge_id': 1,
        'instrument_name': "instrument_one",
        'parameter_name': "flux_bias",
        'applied_value': 0.37,
        'timestamp': 1739596596
    },
    {
        'fridge_id': 2,
        'instrument_name': "instrument_two",
        'parameter_name': "temperature",
        'applied_value': -0.12,
        'timestamp': 1739597890
    },
    {
        'fridge_id': 3,
        'instrument_name': "instrument_three",
        'parameter_name': "power_level",
        'applied_value': 1.25,
        'timestamp': 1739601234
    },
    {
        'fridge_id': 1,
        'instrument_name': "instrument_four",
        'parameter_name': "current_bias",
        'applied_value': 0.89,
        'timestamp': 1739612345
    },
    {
        'fridge_id': 2,
        'instrument_name': "instrument_five",
        'parameter_name': "voltage",
        'applied_value': 0.02,
        'timestamp': 1739623456
    }
] 

historical_data = data.copy()

def generate_random_data():
    rand_instr = random.randint(1, 5)
    if rand_instr == 1:
        random_instr_name = 'instrument_one'
    elif rand_instr == 2:
        random_instr_name = 'instrument_two'
    elif rand_instr == 3:
        random_instr_name = 'instrument_three'
    elif rand_instr == 4:
        random_instr_name = 'instrument_four'
    elif rand_instr == 5:
        random_instr_name = 'instrument_five'

    return {
        'fridge_id': random.randint(1, 3),
        'instrument_name': random_instr_name,
        'parameter_name': random.choice(["flux_bias", "temperature", "power_level", "current_bias", "voltage"]),
        'applied_value': round(random.uniform(-1.0, 1.5), 2),
        'timestamp': int(time.time())
    }

@app.route('/api/settings', methods=['GET'])
def get_settings():
    live_mode = request.args.get('live_mode', 'false').lower() == 'true'
    if live_mode:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        start = (page - 1) * per_page
        end = start + per_page
        
        paginated_data = historical_data[start:end]
        return jsonify({
            "data": paginated_data,
            "total": len(historical_data)//per_page + 1,
            "page": page,
            "per_page": per_page
        })
    else:
        return jsonify({"data": historical_data})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    live_mode = request.args.get('live_mode', 'false').lower() == 'true'
    analytics = []

    if live_mode:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        start = (page - 1) * per_page
        end = start + per_page
        analytics = historical_data[start:end]
    else:
        analytics = historical_data
        
    if not analytics:
        return jsonify({"error": "No data available"}), 404
    
    fridge_cat = {}
    for entry in analytics:
        fid = entry['fridge_id']
        if fid not in fridge_cat:
            fridge_cat[fid] = []
        fridge_cat[fid].append(entry)

    result = []

    for fid, entries in fridge_cat.items():
        instrument_cat = {}
        for entry in entries:
            instr = entry['instrument_name']
            if instr not in instrument_cat:
                instrument_cat[instr] = {}
            param = entry['parameter_name']
            if param not in instrument_cat[instr]:
                instrument_cat[instr][param] = []
            instrument_cat[instr][param].append(entry['applied_value'])
        
        
        for instr, params in instrument_cat.items():
            for param, values in params.items():
                result.append({
                    "fridge_id": fid,
                    "instrument_name": instr,
                    "parameter_name": param,
                    "average": round(sum(values) / len(values), 2),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }) 
    
    return jsonify(result)

def background_task():
    while True:
        socketio.sleep(1)
        generated_data = generate_random_data()
        historical_data.append(generated_data)
        generated_data['total'] = len(historical_data)//10 + 1
        #print(generated_data)
        socketio.emit('live_data', generated_data)

if __name__ == "__main__":
    socketio.start_background_task(background_task)
    socketio.run(app, debug=True, port=5000)