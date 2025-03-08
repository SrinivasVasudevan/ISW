# Challenge Description

## Build a react app to view a table of data

- [x] User can view a table of settings applied to different instrument parameters for different fridges
- [x] User can filter this table by any column
- [x] Data is served via a python api

## Backend (Python)

- [x] Create a python backend that defines an api “/settings"
- [x] Return the data defined above
- [x] You may use any python framework

## Frontend (React)

- [x] Create a React app that defines a page route: “/settings”
- [x] That page should query the api endpoint you created
- [x] Display a table of the data
- [x] Provide filtering on one or more columns

## Bonus

- [x] Live mode. Create a websocket server to serve the data to the frontend live (randomly generate instrument values)
- [x] Server side paging/infinite scroll for historical data
  - [x] For historical data implement server side pagination (randomly generate instrument values).
  - [x] On the client side implement infinite scrolling if not in live mode
- [x] Provide aggregate analytics for instrument values on a /analytics route

Example data

```
{
"data": [
{
"fridge_id": 1,
"instrument_name": "instrument_one",
"parameter_name": "flux_bias",
"applied_value": 0.37,
"timestamp": 1739596596
},
{
"fridge_id": 2,
"instrument_name": "instrument_two",
"parameter_name": "temperature",
"applied_value": -0.12,
"timestamp": 1739597890
},
{
"fridge_id": 3,
"instrument_name": "instrument_three",
"parameter_name": "power_level","applied_value": 1.25,
"timestamp": 1739601234
},
{
"fridge_id": 1,
"instrument_name": "instrument_four",
"parameter_name": "current_bias",
"applied_value": 0.89,
"timestamp": 1739612345
},
{
"fridge_id": 2,
"instrument_name": "instrument_five",
"parameter_name": "voltage",
"applied_value": 0.02,
"timestamp": 1739623456
}
]
}
```

> **_NOTE:_** After successful setup hit /settings and /analytics path to see the challenge solution

## Setup information

> **_NOTE:_** Please checkout docker-setup branch for docker setup instructions and updated docker code.

To run this locally, perform the following tasks sequentially:

### Setting up backend

0. Ensure that your current working directory is /path/to/ISW, run `pwd` to verify that.
1. python3 -m venv <env_name>
2. source /path/to/env_name/activate
3. pip install -r requirements.txt
4. python3 backend/backend.py

### Setting up frontend

0. change working directory to /path/to/ISW/frontend
1. run `npm install`
2. run `npm start`

> **_NOTE:_** The backend would ideally be setup in port :5000 and the frontend would be setup in :3000 (although this is not strictly necessary for the application to work)
