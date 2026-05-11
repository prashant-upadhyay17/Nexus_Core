<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(false, 'Method not allowed.', null, 405);
}

$user = require_user();
$data = input();
$oldPassword = trim((string)($data['old_password'] ?? ''));
$newPassword = trim((string)($data['new_password'] ?? ''));
$confirmPassword = trim((string)($data['confirm_password'] ?? ''));

if ($oldPassword === '' || $newPassword === '' || $confirmPassword === '') {
    send(false, 'All password fields are required.', null, 422);
}

if ($newPassword !== $confirmPassword) {
    send(false, 'New password and confirmation do not match.', null, 422);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$user['id']]);
$current = $stmt->fetch();

if (!$current || !password_verify($oldPassword, $current['password_hash'])) {
    send(false, 'Current password is incorrect.', null, 401);
}

$hash = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$update->execute([$hash, $user['id']]);

send(true, 'Password updated successfully.');
