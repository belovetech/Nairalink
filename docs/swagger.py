template = {
    "swagger": "2.0",
    "info": {
        "title": "Virtual Card service",
        "description": "API for Nairalink virtual debit card",
        "contact": {
            "responsibleOrganization": "",
            "responsibleDeveloper": "",
            "email": "nairalink@support.com",
            "url": "dev.nairalink.com"
        },
        "termOfService": "www.twitter.com/belovetech",
        "version": "1.0"
    },
    "basePath": "/api/v1",
    "schemes": ["http", "https"],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        }
    }
}

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "router": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/"
}
