<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(false, 'Method not allowed.', null, 405);
}

require_admin();

$data = input();
$action = (string)($data['action'] ?? '');
$pdo = db();

if ($action === 'update_leave') {
    $id = (int)($data['id'] ?? 0);
    $status = normalize_status((string)($data['status'] ?? ''), ['Pending', 'Approved', 'Rejected']);

    if ($id <= 0) {
        send(false, 'Leave request ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('UPDATE leave_requests SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);

    send(true, 'Leave request updated.');
}

if ($action === 'update_tool') {
    $id = (int)($data['id'] ?? 0);
    $status = normalize_status((string)($data['status'] ?? ''), ['Available', 'In Use', 'Maintenance']);

    if ($id <= 0) {
        send(false, 'Tool ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('UPDATE tools SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);

    send(true, 'Tool status updated.');
}

if ($action === 'add_tool') {
    $name = trim((string)($data['name'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));

    if ($name === '' || $description === '') {
        send(false, 'Tool name and description are required.', null, 422);
    }

    $stmt = $pdo->prepare('INSERT INTO tools (name, description, status) VALUES (?, ?, "Available")');
    $stmt->execute([$name, $description]);

    send(true, 'Tool added.');
}

if ($action === 'edit_tool') {
    $id = (int)($data['id'] ?? 0);
    $name = trim((string)($data['name'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));

    if ($id <= 0 || $name === '' || $description === '') {
        send(false, 'Tool ID, name, and description are required.', null, 422);
    }

    $stmt = $pdo->prepare('UPDATE tools SET name = ?, description = ? WHERE id = ?');
    $stmt->execute([$name, $description, $id]);

    send(true, 'Tool updated.');
}

if ($action === 'delete_tool') {
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        send(false, 'Tool ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('DELETE FROM tools WHERE id = ?');
    $stmt->execute([$id]);

    send(true, 'Tool deleted.');
}

if ($action === 'add_employee') {
    $fullName = trim((string)($data['full_name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $departmentId = (int)($data['department_id'] ?? 0);
    $position = trim((string)($data['position'] ?? ''));
    $salary = (float)($data['salary'] ?? 0);

    if ($fullName === '' || $email === '' || $departmentId <= 0 || $position === '') {
        send(false, 'Name, email, department, and position are required.', null, 422);
    }

    // Check if user already exists
    $userCheckStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $userCheckStmt->execute([$email]);
    $existingUser = $userCheckStmt->fetch();

    $userId = null;
    if (!$existingUser) {
        // Create user account with default password
        $defaultPassword = 'emp123'; // Default password for new employees
        $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);

        $userStmt = $pdo->prepare(
            'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, "user", "Active")'
        );
        $userStmt->execute([$fullName, $email, $passwordHash]);
        $userId = $pdo->lastInsertId();
    } else {
        $userId = $existingUser['id'];
    }

    $stmt = $pdo->prepare(
        'INSERT INTO employees (user_id, department_id, full_name, email, position, salary, hire_date, status)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE(), "Active")'
    );
    $stmt->execute([$userId, $departmentId, $fullName, $email, $position, $salary]);

    send(true, 'Employee added successfully. ' . (!$existingUser ? 'Login credentials: ' . $email . ' / emp123' : 'User account already exists.'));
}

if ($action === 'edit_employee') {
    $id = (int)($data['id'] ?? 0);
    $fullName = trim((string)($data['full_name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $departmentId = (int)($data['department_id'] ?? 0);
    $position = trim((string)($data['position'] ?? ''));
    $salary = (float)($data['salary'] ?? 0);
    $status = normalize_status((string)($data['status'] ?? ''), ['Active', 'Inactive']);

    if ($id <= 0 || $fullName === '' || $email === '' || $departmentId <= 0 || $position === '' || $salary <= 0) {
        send(false, 'All fields including salary are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'UPDATE employees SET department_id = ?, full_name = ?, email = ?, position = ?, salary = ?, status = ? WHERE id = ?'
    );
    $stmt->execute([$departmentId, $fullName, $email, $position, $salary, $status, $id]);

    send(true, 'Employee updated.');
}

if ($action === 'delete_employee') {
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        send(false, 'Employee ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('DELETE FROM employees WHERE id = ?');
    $stmt->execute([$id]);

    send(true, 'Employee deleted.');
}

if ($action === 'add_department') {
    $name = trim((string)($data['name'] ?? ''));

    if ($name === '') {
        send(false, 'Department name is required.', null, 422);
    }

    $stmt = $pdo->prepare('INSERT INTO departments (name) VALUES (?)');
    $stmt->execute([$name]);

    send(true, 'Department added.');
}

if ($action === 'edit_department') {
    $id = (int)($data['id'] ?? 0);
    $name = trim((string)($data['name'] ?? ''));

    if ($id <= 0 || $name === '') {
        send(false, 'Department ID and name are required.', null, 422);
    }

    $stmt = $pdo->prepare('UPDATE departments SET name = ? WHERE id = ?');
    $stmt->execute([$name, $id]);

    send(true, 'Department updated.');
}

if ($action === 'delete_department') {
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        send(false, 'Department ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('DELETE FROM departments WHERE id = ?');
    $stmt->execute([$id]);

    send(true, 'Department deleted.');
}

if ($action === 'assign_tool') {
    $toolId = (int)($data['tool_id'] ?? 0);
    $employeeId = (int)($data['employee_id'] ?? 0);

    if ($toolId <= 0 || $employeeId <= 0) {
        send(false, 'Tool and employee IDs are required.', null, 422);
    }

    $stmt = $pdo->prepare('UPDATE tools SET status = "In Use" WHERE id = ?');
    $stmt->execute([$toolId]);

    send(true, 'Tool assigned.');
}

if ($action === 'add_project') {
    $clientName = trim((string)($data['client_name'] ?? ''));
    $route = trim((string)($data['route'] ?? ''));
    $workload = trim((string)($data['workload'] ?? 'Standard'));
    $assignedTeam = trim((string)($data['assigned_team'] ?? ''));
    $status = normalize_status((string)($data['status'] ?? 'Pending'), ['Pending', 'In Progress', 'Completed']);
    $assignedEmployeeId = $data['assigned_employee_id'] ? (int)$data['assigned_employee_id'] : null;

    if ($clientName === '' || $route === '' || $assignedTeam === '') {
        send(false, 'Project name, route, and team are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO projects (client_name, route, assignment_date, workload, assigned_employee_id, assigned_team, status)
         VALUES (?, ?, CURDATE(), ?, ?, ?, ?)'
    );
    $stmt->execute([$clientName, $route, $workload, $assignedEmployeeId, $assignedTeam, $status]);

    send(true, 'Project assignment added.');
}

if ($action === 'edit_project') {
    $id = (int)($data['id'] ?? 0);
    $clientName = trim((string)($data['client_name'] ?? ''));
    $route = trim((string)($data['route'] ?? ''));
    $workload = trim((string)($data['workload'] ?? 'Standard'));
    $assignedTeam = trim((string)($data['assigned_team'] ?? ''));
    $status = normalize_status((string)($data['status'] ?? 'Pending'), ['Pending', 'In Progress', 'Completed']);
    $assignedEmployeeId = $data['assigned_employee_id'] ? (int)$data['assigned_employee_id'] : null;

    if ($id <= 0 || $clientName === '' || $route === '' || $assignedTeam === '') {
        send(false, 'Project ID, name, route, and team are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'UPDATE projects SET client_name = ?, route = ?, workload = ?, assigned_employee_id = ?, assigned_team = ?, status = ? WHERE id = ?'
    );
    $stmt->execute([$clientName, $route, $workload, $assignedEmployeeId, $assignedTeam, $status, $id]);

    send(true, 'Project assignment updated.');
}

if ($action === 'delete_project') {
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        send(false, 'Project assignment ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('DELETE FROM projects WHERE id = ?');
    $stmt->execute([$id]);

    send(true, 'Project assignment deleted.');
}

send(false, 'Unknown admin action.', null, 422);
