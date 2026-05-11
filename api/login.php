<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(false, 'Method not allowed.', null, 405);
}

$data = input();
$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    send(false, 'Email and password are required.', null, 422);
}

$stmt = db()->prepare('SELECT id, name, email, role, password_hash, status FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || $user['status'] !== 'Active' || !password_verify($password, $user['password_hash'])) {
    send(false, 'Invalid login details.', null, 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int)$user['id'];

send(true, 'Signed in successfully.', [
    'id' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
]);
