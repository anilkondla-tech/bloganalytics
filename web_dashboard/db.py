"""Database connection and query utilities."""
import pymysql
from config import get_site_config


def get_connection(site_key: str | None = None):
    """Create a new database connection."""
    site = get_site_config(site_key)
    return pymysql.connect(
        host=str(site["host"]),
        port=int(site["port"]),
        user=str(site["user"]),
        password=str(site["password"]),
        database=str(site["database"]),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def query_db(query: str, params: tuple = (), site_key: str | None = None) -> list[dict]:
    """Execute a query and return all results."""
    with get_connection(site_key) as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


def get_prefix(site_key: str | None = None) -> str:
    """Get WordPress table prefix."""
    return str(get_site_config(site_key)["prefix"])
