<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(false, 'Method not allowed.', null, 405);
}

$user = require_user();
$data = input();
$action = (string)($data['action'] ?? '');
$pdo = db();

$profileStmt = $pdo->prepare(
    'SELECT id FROM employees WHERE user_id = ? LIMIT 1'
);
$profileStmt->execute([$user['id']]);
$profile = $profileStmt->fetch();

if (!$profile) {
    send(false, 'No employee profile is linked to this user.', null, 404);
}

$employeeId = (int)$profile['id'];

if ($action === 'submit_leave') {
    $startDate = trim((string)($data['start_date'] ?? ''));
    $endDate = trim((string)($data['end_date'] ?? ''));
    $reason = trim((string)($data['reason'] ?? ''));

    if ($startDate === '' || $endDate === '' || $reason === '') {
        send(false, 'Start date, end date, and reason are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO leave_requests (employee_id, start_date, end_date, reason)
         VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$employeeId, $startDate, $endDate, $reason]);

    send(true, 'Leave request submitted.');
}

if ($action === 'update_profile') {
    $fullName = trim((string)($data['full_name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $position = trim((string)($data['position'] ?? ''));

    if ($fullName === '' || $email === '' || $position === '') {
        send(false, 'Name, email, and position are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'UPDATE employees SET full_name = ?, email = ?, position = ? WHERE user_id = ?'
    );
    $stmt->execute([$fullName, $email, $position, $user['id']]);

    send(true, 'Profile updated.');
}

if ($action === 'clock_in') {
    $stmt = $pdo->prepare(
        'INSERT INTO attendance (employee_id, work_date, check_in, status)
         VALUES (?, CURDATE(), CURTIME(), "Present")
         ON DUPLICATE KEY UPDATE check_in = CURTIME()'
    );
    $stmt->execute([$employeeId]);

    send(true, 'Clocked in.');
}

if ($action === 'clock_out') {
    $stmt = $pdo->prepare(
        'UPDATE attendance SET check_out = CURTIME() WHERE employee_id = ? AND work_date = CURDATE()'
    );
    $stmt->execute([$employeeId]);

    send(true, 'Clocked out.');
}

if ($action === 'mark_attendance') {
    $workDate = trim((string)($data['work_date'] ?? ''));
    $attendanceStatus = trim((string)($data['status'] ?? 'Present'));

    if ($workDate === '') {
        send(false, 'Work date is required.', null, 422);
    }

    $attendanceStatus = normalize_status($attendanceStatus, ['Present', 'Absent', 'Pending']);

    $stmt = $pdo->prepare(
        'INSERT INTO attendance (employee_id, work_date, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?'
    );
    $stmt->execute([$employeeId, $workDate, $attendanceStatus, $attendanceStatus]);

    send(true, "Attendance marked as {$attendanceStatus} for {$workDate}.");
}


if ($action === 'add_project') {
    $clientName = trim((string)($data['client_name'] ?? ''));
    $route = trim((string)($data['route'] ?? ''));
    $workload = trim((string)($data['workload'] ?? 'Standard'));
    $assignedTeam = trim((string)($data['assigned_team'] ?? ''));
    $status = normalize_status((string)($data['status'] ?? 'Pending'), ['Pending', 'In Progress', 'Completed']);

    if ($clientName === '' || $route === '' || $assignedTeam === '') {
        send(false, 'Project name, route, and team are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO projects (client_name, route, assignment_date, workload, assigned_employee_id, assigned_team, status)
         VALUES (?, ?, CURDATE(), ?, ?, ?, ?)'
    );
    $stmt->execute([$clientName, $route, $workload, $employeeId, $assignedTeam, $status]);

    send(true, 'Project assignment added.');
}

if ($action === 'edit_project') {
    $id = (int)($data['id'] ?? 0);
    $clientName = trim((string)($data['client_name'] ?? ''));
    $route = trim((string)($data['route'] ?? ''));
    $workload = trim((string)($data['workload'] ?? 'Standard'));
    $assignedTeam = trim((string)($data['assigned_team'] ?? ''));
    $status = normalize_status((string)($data['status'] ?? 'Pending'), ['Pending', 'In Progress', 'Completed']);

    if ($id <= 0 || $clientName === '' || $route === '' || $assignedTeam === '') {
        send(false, 'Project ID, name, route, and team are required.', null, 422);
    }

    $stmt = $pdo->prepare(
        'UPDATE projects SET client_name = ?, route = ?, workload = ?, assigned_team = ?, status = ? WHERE id = ? AND assigned_employee_id = ?'
    );
    $stmt->execute([$clientName, $route, $workload, $assignedTeam, $status, $id, $employeeId]);

    if ($stmt->rowCount() === 0) {
        send(false, 'Unable to update this project assignment.', null, 403);
    }

    send(true, 'Project assignment updated.');
}

if ($action === 'delete_project') {
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        send(false, 'Project assignment ID is required.', null, 422);
    }

    $stmt = $pdo->prepare('DELETE FROM projects WHERE id = ? AND assigned_employee_id = ?');
    $stmt->execute([$id, $employeeId]);

    if ($stmt->rowCount() === 0) {
        send(false, 'Unable to delete this project assignment.', null, 403);
    }

    send(true, 'Project assignment deleted.');
}

send(false, 'Unknown employee action.', null, 422);