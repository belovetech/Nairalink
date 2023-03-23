#!/usr/bin/env python3
"""Flask Application for card service
"""
from os import getenv
from flask import Flask, jsonify, Blueprint
from api.virtual_cards.views import app_views

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

app.register_blueprint(app_views)


@app.route('/status', strict_slashes=False)
def getStatus():
    """Get connection status
    """
    return jsonify({"message": "Everything is cool!"})


if __name__ =="__main__":
    app.run(host="0.0.0.0", port=8000)
