from flask import Flask, render_template
from flask_caching import Cache
from config import get_connection_string_for_site, get_available_sites, get_default_site_key
from routes_api import api_bp, cache

app = Flask(__name__, static_folder="static", template_folder="templates")

# Initialize cache
cache.init_app(app, config={"CACHE_TYPE": "SimpleCache"})

# Register blueprints
app.register_blueprint(api_bp)


@app.route("/")
def index():
    """Main dashboard page."""
    default_site = get_default_site_key()
    return render_template(
        "dashboard.html",
        db_connection=get_connection_string_for_site(default_site),
        sites=get_available_sites(),
        selected_site=default_site,
    )


@app.route("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
