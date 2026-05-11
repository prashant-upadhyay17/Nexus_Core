<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
require __DIR__ . '/api/config.php';
$pdo = db();

$adminPass = 'admin123';
$empPass = 'emp123';

$adminHash = password_hash($adminPass, PASSWORD_BCRYPT);
$empHash = password_hash($empPass, PASSWORD_BCRYPT);

$pdo->prepare("UPDATE users SET password_hash = ? WHERE role IN ('admin', 'hr')")->execute([$adminHash]);
$pdo->prepare("UPDATE users SET password_hash = ? WHERE role = 'user'")->execute([$empHash]);

echo "Admin Hash updated: $adminHash\n";
echo "Emp Hash updated: $empHash\n";
echo "Verification Admin: " . (password_verify($adminPass, $adminHash) ? 'OK' : 'FAIL') . "\n";
echo "Verification Emp: " . (password_verify($empPass, $empHash) ? 'OK' : 'FAIL') . "\n";
