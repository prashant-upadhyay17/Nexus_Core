<?php
declare(strict_types=1);

// Suppress PHP errors in output while still logging them.
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

session_start();

set_exception_handler(function (Throwable $error): void {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    error_log((string)$error);
    echo json_encode([
        'ok' => false,
        'message' => 'Server error. Please check the backend configuration.',
        'data' => null,
    ], JSON_UNESCAPED_SLASHES);
    exit;
});

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

const DB_HOST = 'host';
const DB_NAME = 'db_name';
const DB_USER = 'user';
const DB_PASS = 'db_pass';

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        send(false, 'Database connection failed. Please import the nexuscore database and verify settings.', null, 500);
    }

    return $pdo;
}

function input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        send(false, 'Invalid JSON request.', null, 400);
    }

    return $data;
}

function send(bool $ok, string $message = '', mixed $data = null, int $status = 200): never
{
    http_response_code($status);
    echo json_encode([
        'ok' => $ok,
        'message' => $message,
        'data' => $data,
    ], JSON_UNESCAPED_SLASHES);
    exit;
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $stmt = db()->prepare('SELECT id, name, email, role FROM users WHERE id = ? AND status = "Active" LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function require_user(): array
{
    $user = current_user();
    if (!$user) {
        send(false, 'Please sign in again.', null, 401);
    }

    return $user;
}

function require_admin(): array
{
    $user = require_user();
    if ($user['role'] !== 'admin' && $user['role'] !== 'hr') {
        send(false, 'Admin or HR access is required.', null, 403);
    }

    return $user;
}

function normalize_status(string $status, array $allowed): string
{
    foreach ($allowed as $allowedStatus) {
        if (strcasecmp($status, $allowedStatus) === 0) {
            return $allowedStatus;
        }
    }

    send(false, 'Invalid status value.', null, 422);
}
