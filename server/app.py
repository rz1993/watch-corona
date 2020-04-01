from flask import Flask, g, jsonify, render_template
from flask_cors import CORS
from src.api import country_api, state_api, city_api
from src.commands import db_cli
from src.db import get_connection
from werkzeug.exceptions import HTTPException
import os


app = Flask(__name__,
            template_folder="frontend",
            static_folder="frontend/static")
CORS(app)
app.config['DATABASE_URI'] = os.getenv("DATABASE_URI")
app.register_blueprint(country_api, url_prefix="/api/v1/country")
app.register_blueprint(state_api, url_prefix="/api/v1/state")
app.register_blueprint(city_api, url_prefix="/api/v1/city")

@app.route('/healthcheck')
def healthcheck():
    return 'OK'

@app.before_request
def conn():
    g.dbconn = get_connection()

@app.errorhandler(HTTPException)
def handle_error(exc):
    response = jsonify(dict(message=exc.description))
    response.status_code = exc.code
    return response

app.cli.add_command(db_cli)

if __name__ == "__main__":
    app.run(port=5001)
