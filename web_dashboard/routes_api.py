"""API routes for dashboard data endpoints."""
from flask import Blueprint, jsonify, request
from flask_caching import Cache
from db import query_db, get_prefix
from config import (
    CACHE_SUMMARY_TIMEOUT,
    CACHE_HEATMAP_TIMEOUT,
    get_connection_string_for_site,
    get_site_config,
)

api_bp = Blueprint("api", __name__, url_prefix="/api")
cache = Cache()


@api_bp.route("/ping")
@cache.cached(timeout=60, query_string=True)
def ping():
    """Health check endpoint."""
    site_key = request.args.get("site")
    try:
        query_db("SELECT 1 AS ok", site_key=site_key)
        return jsonify(status="ok", connection=get_connection_string_for_site(site_key))
    except Exception as exc:
        return (
            jsonify(
                status="error",
                message=str(exc),
                connection=get_connection_string_for_site(site_key),
            ),
            500,
        )


@api_bp.route("/summary")
@cache.cached(timeout=CACHE_SUMMARY_TIMEOUT, query_string=True)
def summary():
    """Get all dashboard summary data."""
    site_key = request.args.get("site")
    prefix = get_prefix(site_key)
    site_label = str(get_site_config(site_key)["label"])
    
    status_summary = query_db(
        f"SELECT post_status AS status, COUNT(*) AS count FROM {prefix}posts "
        f"WHERE post_type='post' AND post_status != 'publish' GROUP BY post_status",
        site_key=site_key,
    )
    
    total_posts = query_db(
        f"SELECT COUNT(*) AS count FROM {prefix}posts WHERE post_type='post'",
        site_key=site_key,
    )[0]["count"]
    
    total_comments = query_db(
        f"SELECT COUNT(*) AS count FROM {prefix}comments",
        site_key=site_key,
    )[0]["count"]
    
    comments_by_status = query_db(
        f"SELECT comment_approved AS status, COUNT(*) AS count FROM {prefix}comments GROUP BY comment_approved",
        site_key=site_key,
    )
    
    recent_posts = query_db(
        f"SELECT ID AS post_id, post_title, post_date, post_status FROM {prefix}posts "
        f"WHERE post_type='post' ORDER BY post_date DESC LIMIT 10",
        site_key=site_key,
    )
    
    author_summary = query_db(
        f"SELECT u.ID AS author_id, u.display_name AS author_name, COUNT(p.ID) AS post_count "
        f"FROM {prefix}users u LEFT JOIN {prefix}posts p ON p.post_author=u.ID AND p.post_type='post' "
        f"GROUP BY u.ID ORDER BY post_count DESC LIMIT 10",
        site_key=site_key,
    )
    
    category_summary = query_db(
        f"SELECT t.name AS category, COUNT(*) AS count "
        f"FROM {prefix}posts p JOIN {prefix}term_relationships tr ON p.ID = tr.object_id "
        f"JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id "
        f"JOIN {prefix}terms t ON tt.term_id = t.term_id "
        f"WHERE tt.taxonomy = 'category' AND p.post_type = 'post' "
        f"GROUP BY t.term_id ORDER BY count DESC LIMIT 10",
        site_key=site_key,
    )
    
    posts_by_week = query_db(
        f"SELECT DATE(DATE_SUB(post_date, INTERVAL WEEKDAY(post_date) DAY)) AS week, COUNT(*) AS count "
        f"FROM {prefix}posts WHERE post_type = 'post' AND post_status = 'publish' "
        f"AND post_date >= CURDATE() - INTERVAL 52 WEEK "
        f"GROUP BY DATE(DATE_SUB(post_date, INTERVAL WEEKDAY(post_date) DAY)) ORDER BY week",
        site_key=site_key,
    )

    return jsonify(
        db_connection=get_connection_string_for_site(site_key),
        selected_site=request.args.get("site") or "",
        site_label=site_label,
        total_posts=total_posts,
        total_comments=total_comments,
        status_summary=status_summary,
        comments_by_status=comments_by_status,
        recent_posts=recent_posts,
        author_summary=author_summary,
        category_summary=category_summary,
        posts_by_week=posts_by_week,
    )


@api_bp.route("/heatmap")
@cache.cached(timeout=CACHE_HEATMAP_TIMEOUT, query_string=True)
def heatmap():
    """Get heatmap data for month/category and category/author distributions."""
    site_key = request.args.get("site")
    prefix = get_prefix(site_key)
    
    month_category = query_db(
        f"SELECT CONCAT(YEAR(p.post_date), '-', LPAD(MONTH(p.post_date), 2, '0')) AS month, "
        f"t.name AS category, COUNT(*) AS count "
        f"FROM {prefix}posts p "
        f"JOIN {prefix}term_relationships tr ON p.ID = tr.object_id "
        f"JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id "
        f"JOIN {prefix}terms t ON tt.term_id = t.term_id "
        f"WHERE tt.taxonomy = 'category' AND p.post_type = 'post' "
        f"AND p.post_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) "
        f"GROUP BY month, t.term_id ORDER BY month, count DESC",
        site_key=site_key,
    )
    
    top_categories = query_db(
        f"SELECT t.name AS category, COUNT(*) AS total "
        f"FROM {prefix}posts p "
        f"JOIN {prefix}term_relationships tr ON p.ID = tr.object_id "
        f"JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id "
        f"JOIN {prefix}terms t ON tt.term_id = t.term_id "
        f"WHERE tt.taxonomy = 'category' AND p.post_type = 'post' "
        f"GROUP BY t.term_id ORDER BY total DESC LIMIT 10",
        site_key=site_key,
    )
    
    top_cat_names = [r["category"] for r in top_categories]
    
    category_author = []
    if top_cat_names:
        category_author = query_db(
            f"SELECT t.name AS category, u.display_name AS author_name, COUNT(*) AS count "
            f"FROM {prefix}posts p "
            f"JOIN {prefix}users u ON p.post_author = u.ID "
            f"JOIN {prefix}term_relationships tr ON p.ID = tr.object_id "
            f"JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id "
            f"JOIN {prefix}terms t ON tt.term_id = t.term_id "
            f"WHERE tt.taxonomy = 'category' AND p.post_type = 'post' "
            f"AND t.name IN ({','.join(['%s'] * len(top_cat_names))}) "
            f"GROUP BY t.term_id, u.ID ORDER BY count DESC",
            tuple(top_cat_names),
            site_key=site_key,
        )
    
    return jsonify(
        month_category=month_category,
        category_author=category_author,
        top_categories=top_cat_names,
    )
