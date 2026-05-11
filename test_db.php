<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost';
require __DIR__ . '/api/config.php';
try {
    $db = db();
    echo "DB Connected\n";
    $stmt = $db->query("SELECT COUNT(*) FROM users");
    echo "Users count: " . $stmt->fetchColumn() . "\n";
    
    $_SESSION['test'] = 'hello';
    echo "Session ID: " . session_id() . "\n";
    echo "Session test value: " . $_SESSION['test'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
