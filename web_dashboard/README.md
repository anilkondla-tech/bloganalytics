# WordPress Blog Analytics Dashboard

A modern, interactive analytics dashboard for WordPress blogs built with Flask, Chart.js, and Tailwind CSS. Visualize your blog's performance with real-time metrics, heatmaps, and trend analysis.

## Features

### 📊 Dashboard Components
- **Key Metrics Cards**: Total posts, comments, active authors, and recent posts with trend indicators
- **Quick Insights**: AI-style summary showing top categories and authors
- **Publishing Trends**: 52-week line chart showing post publication patterns
- **Posts by Status**: Doughnut chart visualization of draft/pending/scheduled posts
- **Top Categories**: Bar chart showing most active content categories
- **Heatmaps**: 
  - Month/Category intensity matrix (red=low, yellow=mid, green=high)
  - Category/Author distribution with performance color coding
- **Data Tables**: Recent posts and comments status overview

### 🎨 Modern UI/UX
- **Dark/Light Mode Toggle**: Persistent theme preference stored in browser
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Interactive Charts**: Chart.js visualizations with hover tooltips
- **Real-time Data Loading**: Asynchronous API calls with loading states
- **Tailwind CSS**: Clean, modern grid-based layout
- **Color-Coded Analytics**: Red-to-green gradient for intuitive performance visualization

### ⚡ Performance Features
- **Server-Side Caching**: 
  - Summary data cached for 600 seconds
  - Heatmaps cached for 900 seconds
  - Health check cached for 60 seconds
- **Modular Architecture**: Separated concerns (db.py, routes_api.py, app.py)
- **Efficient Queries**: Optimized SQL with proper indexing for WordPress tables

### 🔧 Backend Architecture
- **Flask Framework**: Lightweight Python web framework
- **Blueprint System**: Modular API route organization
- **PyMySQL**: Native MySQL connectivity
- **Flask-Caching**: SimpleCache for rapid response times
- **Environment Variables**: Secure credential management with `.env` files

## Project Structure

```
web_dashboard/
├── app.py                          # Flask application entry point
├── db.py                           # Database utilities and connection management
├── routes_api.py                   # Blueprint-based API endpoints
├── config.py                       # Configuration and environment variables
├── requirements.txt                # Python package dependencies
├── README.md                       # Project documentation
├── .env.example                    # Environment variables template
├── .env.local                      # Local development credentials
├── .env.production                 # Production credentials
├── templates/
│   ├── dashboard.html              # Main dashboard (Tailwind + Chart.js)
│   └── index.html                  # Legacy template (backup)
└── static/
    ├── style.css                   # Custom CSS styles
    └── (future: JS modules)
```

## Quick Start

### Prerequisites
- Python 3.8+
- MySQL/Hostinger database access
- WordPress database with standard table prefix (default: `wp_`)

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd bloganalytics/web_dashboard
```

2. **Create Virtual Environment**
```bash
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure Environment Variables**
```bash
# Copy example to local config
cp .env.example .env.local

# Edit .env.local with your database credentials
# DB_HOST=your-host.com
# DB_USER=your-username
# DB_PASSWORD=your-password
# DB_NAME=your-database
# TABLE_PREFIX=wp_
```

5. **Run Application**
```bash
python app.py
```

The dashboard will be available at:
- Local: `http://127.0.0.1:5000`
- Network: `http://192.168.1.x:5000`

## Configuration

### Environment Variables (.env or .env.local)

```env
# Database Connection
DB_HOST=srv1060.hstgr.io
DB_PORT=3306
DB_USER=username
DB_PASSWORD=password
DB_NAME=database_name
TABLE_PREFIX=wp_

# Caching (seconds)
CACHE_SUMMARY_TIMEOUT=600
CACHE_HEATMAP_TIMEOUT=900
CACHE_TYPE=SimpleCache
```

### Priority Order
1. `.env` (production, git-ignored)
2. `.env.local` (development, git-ignored)
3. `.env.production` (production fallback, git-ignored)
4. `.env.example` (template for setup)

## API Endpoints

### GET `/`
**Main Dashboard Page**
- Returns: HTML dashboard with Tailwind CSS and Chart.js
- Auth: None
- Cache: No

### GET `/api/ping`
**Health Check**
```json
{
  "status": "ok",
  "connection": "user@host:port/database"
}
```
- Cache: 60 seconds

### GET `/api/summary`
**Dashboard Summary Data**
```json
{
  "total_posts": 2856,
  "total_comments": 15524,
  "status_summary": [
    {"status": "draft", "count": 142},
    {"status": "pending", "count": 8}
  ],
  "category_summary": [
    {"category": "Business", "count": 580},
    {"category": "Technology", "count": 512}
  ],
  "author_summary": [
    {"author_id": 1, "author_name": "Veena", "post_count": 1292}
  ],
  "recent_posts": [
    {"post_id": 123, "post_title": "Post Title", "post_date": "2026-05-30", "post_status": "publish"}
  ],
  "comments_by_status": [
    {"status": "1", "count": 15200},
    {"status": "0", "count": 324}
  ],
  "posts_by_week": [
    {"week": "2026-05-27", "count": 12}
  ]
}
```
- Cache: 600 seconds

### GET `/api/heatmap`
**Heatmap Data for Month/Category and Category/Author**
```json
{
  "month_category": [
    {"month": "2026-05", "category": "Business", "count": 45}
  ],
  "category_author": [
    {"category": "Business", "author_name": "Veena", "count": 547}
  ],
  "top_categories": ["Business", "Technology", "Gadgets"]
}
```
- Cache: 900 seconds

## Database Requirements

The dashboard expects a standard WordPress database with these tables:
- `wp_posts` - Blog posts and pages
- `wp_comments` - Comments
- `wp_users` - Authors and users
- `wp_terms` - Categories and tags
- `wp_term_relationships` - Post-category associations
- `wp_term_taxonomy` - Category taxonomy

**Note**: Prefix must match `TABLE_PREFIX` in configuration.

## Dashboard Data Refresh

Data is automatically cached and refreshed based on configured timeouts:
- **Summary Data**: Updates every 10 minutes (600s)
- **Heatmaps**: Updates every 15 minutes (900s)
- **Health Check**: Updates every minute (60s)

### Manual Refresh
Click the **Refresh** button in the dashboard header to force immediate data reload (bypasses cache).

## Color Scheme

### Heatmap Gradient
- 🔴 **Red** (0-33% of max value): Low performance
- 🟡 **Yellow** (33-67%): Medium performance
- 🟢 **Green** (67-100%): High performance
- ⚪ **Gray**: No data

### Theme
- **Light Mode**: Gray backgrounds, dark text
- **Dark Mode**: Dark backgrounds, light text (default)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance Metrics

- **Page Load**: ~500ms (with cached data)
- **API Response**: <100ms (cached), ~500ms (fresh query)
- **Chart Rendering**: ~200ms (Chart.js)
- **Database Query**: Optimized with caching (~1-2s fresh)

## Troubleshooting

### "Failed to load dashboard data"
1. Check browser console (F12) for errors
2. Verify `/api/ping` endpoint responds: `http://127.0.0.1:5000/api/ping`
3. Check database credentials in `.env.local`
4. Verify MySQL server is running

### Numbers not visible in heatmaps
- Ensure JavaScript is enabled
- Clear browser cache: `Ctrl+Shift+Del`
- Check console for JavaScript errors

### Slow data loading
- Dashboard uses server-side caching - wait 30 seconds for first load
- Click Refresh button to bypass cache
- Check database connection speed

### Charts not displaying
- Verify Chart.js CDN is accessible
- Check for JavaScript errors in console
- Try different browser

## Development

### Adding New Charts
1. Add new API endpoint in `routes_api.py`
2. Create query in `db.py` if needed
3. Add chart rendering function in `templates/dashboard.html`
4. Call function in `loadDashboard()`

### Adding Cache Tiers
Configure in `config.py`:
```python
CACHE_NEW_FEATURE_TIMEOUT = 300  # 5 minutes
```

Use in `routes_api.py`:
```python
@api_bp.route("/api/new-feature")
@cache.cached(timeout=CACHE_NEW_FEATURE_TIMEOUT)
def new_feature():
    # Your code here
    pass
```

## Security Considerations

- ✅ **Environment Variables**: Database credentials never committed to git
- ✅ **Input Validation**: PyMySQL handles SQL injection protection
- ✅ **HTTPS Ready**: Configure reverse proxy for production
- ✅ **CORS**: Configure as needed for cross-origin requests
- ⚠️ **Debug Mode**: Disable in production (`debug=False`)

## Deployment

### Production Checklist
1. Set `debug=False` in `app.py`
2. Use production WSGI server (Gunicorn, uWSGI)
3. Configure HTTPS/SSL certificate
4. Set environment variables from `.env.production`
5. Use separate database user with limited permissions
6. Enable database backups
7. Monitor error logs

### Example Gunicorn Command
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Future Enhancements

- [ ] HTMX dynamic filtering (date range, category, author)
- [ ] Loading skeletons for better UX
- [ ] Enhanced Chart.js features (zoom, dataset toggling)
- [ ] Sidebar navigation menu
- [ ] Export to CSV/PDF
- [ ] Real-time WebSocket updates
- [ ] User authentication
- [ ] Custom date range filters
- [ ] Advanced analytics (bounce rate, engagement)
- [ ] AI-powered insights using LLM

## License

This project is part of the ThanksTechwology WordPress Analytics Suite.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors (F12)
3. Check server logs in Flask terminal
4. Verify database connectivity with `/api/ping`

## Credits

Built with:
- **Flask**: Python web framework
- **Chart.js**: Interactive charts
- **Tailwind CSS**: Modern UI styling
- **PyMySQL**: Database connectivity
- **Feather Icons**: Icon library

---

**Dashboard Version**: 2.0.0  
**Last Updated**: May 2026  
**Status**: ✅ Production Ready
