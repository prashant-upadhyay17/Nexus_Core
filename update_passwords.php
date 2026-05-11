<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost';
require __DIR__ . '/api/config.php';
$pdo = db();

$adminHash = password_hash('admin123', PASSWORD_BCRYPT);
$empHash = password_hash('emp123', PASSWORD_BCRYPT);

echo "Admin Hash: $adminHash\n";
echo "Emp Hash: $empHash\n";

$pdo->prepare("UPDATE users SET password_hash = ? WHERE role IN ('admin', 'hr')")->execute([$adminHash]);
$pdo->prepare("UPDATE users SET password_hash = ? WHERE role = 'user'")->execute([$empHash]);

echo "Database updated successfully.\n";
