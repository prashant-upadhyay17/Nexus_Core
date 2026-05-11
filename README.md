# Nexus Core Operations Dashboard

React + PHP + MySQL role-based operations dashboard for a technical management team.

## Run With XAMPP

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open phpMyAdmin and import `database/db_name.sql`.
3. Visit `http://localhost/nexus_core/`.


## Project Structure

- `index.html` - React entry page.
- `assets/app.js` - Dynamic React login and dashboard screens.
- `assets/styles.css` - Professional responsive UI styling.
- `api/` - PHP backend for sessions, login, role dashboards, and admin controls.
- `database/nexuscore.sql` - XAMPP MySQL database schema and seed data.

## Notes

The app is designed for local XAMPP defaults: MySQL host `host`, database
`db_name`, user `root`, and password 'your_password'. Change these values in
`config.php` if your local MySQL setup is different.
