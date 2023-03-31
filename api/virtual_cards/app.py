#!/usr/bin/env python3
"""Flask Application for card service
"""
from os import getenv
from flask import Flask, jsonify, request, Blueprint
from api.virtual_cards.views import app_views

from flasgger import Swagger, LazyString, LazyJSONEncoder, swag_from

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

app.register_blueprint(app_views)

# SWAGGER CONFIG
app.json_encoder = LazyJSONEncoder
swagger_template = dict(
    info = {
        'title': LazyString(lambda: 'Nairalink card service'),
        'version': LazyString(lambda: '1.0.0'),
        'description': LazyString(lambda: 'Nairalink virtual debit card service and card transaction documentation')
    },
    host = LazyString(lambda: request.host)
)
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'cards',
            "route": '/cards.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/v1/cards/docs"
}

swagger = Swagger(app, template=swagger_template, config=swagger_config)


@swag_from('status.yml', methods=['GET'])
@app.route('/status', strict_slashes=False)
def getStatus():
    """Get connection status
    """
    return jsonify({"message": "Everything is cool!"})


if __name__ =="__main__":
    app.run(host="0.0.0.0", port=8000)
