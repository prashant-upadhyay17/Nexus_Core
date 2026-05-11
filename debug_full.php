<?php
function test_dashboard($email, $password) {
    echo "Testing full flow for $email / $password...\n";
    $cookie_file = tempnam(sys_get_temp_dir(), 'CURLCOOKIE');
    
    // Login
    $ch = curl_init('http://localhost/nexus_core/api/login.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $password]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
    $login_body = curl_exec($ch);
    curl_close($ch);
    
    echo "Login Response: $login_body\n";
    
    // Dashboard
    $ch = curl_init('http://localhost/nexus_core/api/dashboard.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
    $dash_body = curl_exec($ch);
    curl_close($ch);
    
    echo "Dashboard Response: $dash_body\n\n";
    
    unlink($cookie_file);
}
