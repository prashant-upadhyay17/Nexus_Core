# Nexus Core Operations Dashboard

React + PHP + MySQL role-based operations dashboard for a technical management team.

## Run With XAMPP

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open phpMyAdmin and import `database/nexuscore.sql`.
3. Visit `http://localhost/nexus-core/`.

## Demo Login

- Admin: `admin@nexuscore.local` / `admin123`
- User: `user@nexuscore.local` / `user123`

## Project Structure

- `index.html` - React entry page.
- `assets/app.js` - Dynamic React login and dashboard screens.
- `assets/styles.css` - Professional responsive UI styling.
- `api/` - PHP backend for sessions, login, role dashboards, and admin controls.
- `database/nexuscore.sql` - XAMPP MySQL database schema and seed data.

## Notes

The app is designed for local XAMPP defaults: MySQL host `127.0.0.1`, database
`nexuscore`, user `root`, and an empty password. Change these values in
`api/config.php` if your local MySQL setup is different.
