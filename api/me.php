<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

$user = current_user();
if (!$user) {
    send(false, 'Not signed in.', null, 401);
}

send(true, 'Authenticated.', [
    'id' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
]);
