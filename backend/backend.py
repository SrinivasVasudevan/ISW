# api.py
from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


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

@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({"data": data})

if __name__ == "__main__":
    app.run(debug=True, port = 5000)