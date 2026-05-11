<?php
function test_add_and_login() {
    $cookie_file = tempnam(sys_get_temp_dir(), 'CURLCOOKIE');
    
    // Login as Admin
    $ch = curl_init('http://localhost/nexus_core/api/login.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@nexuscore.local', 'password' => 'admin123']));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
    curl_exec($ch);
    curl_close($ch);
    
    // Add Employee
    $new_email = 'test.emp@nexuscore.local';
    $ch = curl_init('http://localhost/nexus_core/api/admin_actions.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'action' => 'add_employee',
        'full_name' => 'Test Employee',
        'email' => $new_email,
        'department_id' => 1,
        'position' => 'Tester',
        'salary' => 50000
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
    $add_res = curl_exec($ch);
    curl_close($ch);
    echo "Add Employee Response: $add_res\n";
    
    // Logout
    $ch = curl_init('http://localhost/nexus_core/api/logout.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
    curl_exec($ch);
    curl_close($ch);
    
    // Login as New Employee
    $ch = curl_init('http://localhost/nexus_core/api/login.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $new_email, 'password' => 'emp123']));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $login_res = curl_exec($ch);
    curl_close($ch);
    echo "New Employee Login Response: $login_res\n";
    
    unlink($cookie_file);
}

test_add_and_login();
