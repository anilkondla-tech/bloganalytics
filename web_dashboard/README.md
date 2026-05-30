# WordPress Blog Analytics Dashboard

A small Flask dashboard that connects to a WordPress MySQL database and visualizes blog metrics using Chart.js.

## Setup

1. Open a terminal and change into the dashboard folder:

```bash
cd /home/veena/Documents/Github/bloganalytics/web_dashboard
```

2. Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

The app loads database credentials from environment variables first, then from the `bloganalytics/blog_db.sql` or `bloganalytics/localdb_creds.sql` file if available.

Supported environment variables:

- `WP_DB_HOST`
- `WP_DB_PORT`
- `WP_DB_USER`
- `WP_DB_PASSWORD`
- `WP_DB_NAME`
- `WP_TABLE_PREFIX`

If you want to connect to your WordPress database with the current stored credentials, no extra config is required. To override, export environment variables before running.

Example:

```bash
export WP_DB_HOST=127.0.0.1
export WP_DB_PORT=3306
export WP_DB_USER=root
export WP_DB_PASSWORD='yourpassword'
export WP_DB_NAME=wordpress
export WP_TABLE_PREFIX=wp_
```

## Run the dashboard

```bash
python app.py
```

Then open `http://127.0.0.1:5000` in your browser.

## Features

- Posts by status
- Posts created in the last 30 days
- Top categories
- Recent posts table
- Comment status summary
- Author post counts
