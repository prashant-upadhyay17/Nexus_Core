<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

$user = require_user();
$pdo = db();

if ($user['role'] === 'admin' || $user['role'] === 'hr') {
    $metrics = [
        ['label' => 'Employees', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM employees')->fetchColumn()],
        ['label' => 'Pending Leave', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM leave_requests WHERE status = "Pending"')->fetchColumn()],
        ['label' => 'Active Projects', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM projects WHERE status != "Completed"')->fetchColumn()],
        ['label' => 'Active Tools', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM tools WHERE status != "Maintenance"')->fetchColumn()],
    ];

    $employees = $pdo->query(
        'SELECT employees.id, employees.full_name, employees.position, employees.status, departments.name AS department_name
         FROM employees
         LEFT JOIN departments ON departments.id = employees.department_id
         ORDER BY employees.id DESC
         LIMIT 12'
    )->fetchAll();

    $leaves = $pdo->query(
        'SELECT leave_requests.id, employees.full_name, leave_requests.start_date, leave_requests.end_date,
                leave_requests.reason, leave_requests.status
         FROM leave_requests
         INNER JOIN employees ON employees.id = leave_requests.employee_id
         ORDER BY leave_requests.id DESC
         LIMIT 10'
    )->fetchAll();

    $departments = $pdo->query('SELECT id, name FROM departments ORDER BY name')->fetchAll();
    $tools = $pdo->query('SELECT id, name, description, status FROM tools ORDER BY name')->fetchAll();
    $assignments = $pdo->query('SELECT id, client_name, route, workload, assigned_team, status FROM projects ORDER BY assignment_date DESC LIMIT 10')->fetchAll();

    send(true, 'Admin dashboard loaded.', [
        'metrics' => $metrics,
        'employees' => $employees,
        'leaves' => $leaves,
        'departments' => $departments,
        'tools' => $tools,
        'assignments' => $assignments,
        'timeline' => [
            ['time' => '08:30', 'title' => 'Morning attendance closed', 'detail' => '96% team check-in across operations.'],
            ['time' => '10:15', 'title' => 'Assignment planning completed', 'detail' => 'North sector project assigned to Team A.'],
            ['time' => '14:00', 'title' => 'Inventory audit pending', 'detail' => 'Equipment and resources require status review.'],
        ],
        'reports' => [
            ['title' => 'Monthly Payroll Readiness', 'detail' => 'Attendance and leave exceptions are ready for review.', 'value' => '94%'],
            ['title' => 'Operational Efficiency', 'detail' => 'Average task completion rate for field teams.', 'value' => '88%'],
            ['title' => 'Team Growth', 'detail' => 'New user activations and training progress.', 'value' => '+12'],
        ],
        'salary_details' => [
            ['team' => 'Operations', 'average' => '$62,000', 'pending' => '2'],
            ['team' => 'Human Resources', 'average' => '$76,000', 'pending' => '1'],
            ['team' => 'Logistics', 'average' => '$58,000', 'pending' => '0'],
        ],
        'leave_report' => [
            ['metric' => 'Pending leave', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM leave_requests WHERE status = "Pending"')->fetchColumn()],
            ['metric' => 'Approved leave', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM leave_requests WHERE status = "Approved"')->fetchColumn()],
            ['metric' => 'Rejected leave', 'value' => (string)$pdo->query('SELECT COUNT(*) FROM leave_requests WHERE status = "Rejected"')->fetchColumn()],
        ],
        'pending_work' => [
            ['title' => 'Open assignments', 'detail' => (string)$pdo->query('SELECT COUNT(*) FROM projects WHERE status = "Pending"')->fetchColumn() . ' pending'],
            ['title' => 'In progress', 'detail' => (string)$pdo->query('SELECT COUNT(*) FROM projects WHERE status = "In Progress"')->fetchColumn() . ' active'],
            ['title' => 'Completed this week', 'detail' => (string)$pdo->query('SELECT COUNT(*) FROM projects WHERE status = "Completed"')->fetchColumn() . ' finished'],
        ],
        'teams' => [
            ['name' => 'Field Team A', 'members' => '5'],
            ['name' => 'Field Team B', 'members' => '4'],
            ['name' => 'HR Operations', 'members' => '3'],
        ],
    ]);
}

$profileStmt = $pdo->prepare(
    'SELECT employees.*, departments.name AS department_name
     FROM employees
     LEFT JOIN departments ON departments.id = employees.department_id
     WHERE employees.user_id = ?
     LIMIT 1'
);
$profileStmt->execute([$user['id']]);
$profile = $profileStmt->fetch();

if (!$profile) {
    send(false, 'No employee profile is linked to this user.', null, 404);
}

$attendanceStmt = $pdo->prepare('SELECT id, work_date, check_in, check_out, status FROM attendance WHERE employee_id = ? ORDER BY work_date DESC LIMIT 8');
$attendanceStmt->execute([$profile['id']]);

$leaveStmt = $pdo->prepare('SELECT id, start_date, end_date, reason, status FROM leave_requests WHERE employee_id = ? ORDER BY id DESC LIMIT 6');
$leaveStmt->execute([$profile['id']]);

$assignmentStmt = $pdo->prepare('SELECT id, client_name, route, workload, assigned_team, status FROM projects WHERE assigned_employee_id = ? ORDER BY assignment_date DESC LIMIT 8');
$assignmentStmt->execute([$profile['id']]);
$assignments = $assignmentStmt->fetchAll();

$pendingLeaveStmt = $pdo->prepare('SELECT COUNT(*) FROM leave_requests WHERE employee_id = ? AND status = "Pending"');
$pendingLeaveStmt->execute([$profile['id']]);
$pendingLeaves = (string)$pendingLeaveStmt->fetchColumn();

$approvedLeaveStmt = $pdo->prepare('SELECT COUNT(*) FROM leave_requests WHERE employee_id = ? AND status = "Approved"');
$approvedLeaveStmt->execute([$profile['id']]);
$approvedLeaves = (string)$approvedLeaveStmt->fetchColumn();

$rejectedLeaveStmt = $pdo->prepare('SELECT COUNT(*) FROM leave_requests WHERE employee_id = ? AND status = "Rejected"');
$rejectedLeaveStmt->execute([$profile['id']]);
$rejectedLeaves = (string)$rejectedLeaveStmt->fetchColumn();

send(true, 'User dashboard loaded.', [
    'profile' => $profile,
    'metrics' => [
        ['label' => 'Attendance', 'value' => '96%'],
        ['label' => 'Leave Balance', 'value' => '14'],
        ['label' => 'Assigned Tasks', 'value' => (string)count($assignments)],
    ],
    'attendance' => $attendanceStmt->fetchAll(),
    'leaves' => $leaveStmt->fetchAll(),
    'assignments' => $assignments,
    'schedule' => [
        ['time' => '09:00', 'title' => 'Daily team standup', 'detail' => 'Route planning and safety check.'],
        ['time' => '12:30', 'title' => 'Operations review', 'detail' => 'Confirm assignment progress and resource readiness.'],
        ['time' => '16:45', 'title' => 'Status update', 'detail' => 'Submit progress notes and close completed tasks.'],
    ],
    'reports' => [
        ['title' => 'Compliance Briefing', 'detail' => 'Short refresher for field process checks.', 'value' => 'Complete'],
        ['title' => 'Route Excellence', 'detail' => 'Improve delivery documentation quality.', 'value' => 'Active'],
        ['title' => 'Partner Relations', 'detail' => 'Maintain high-quality communications with stakeholders.', 'value' => 'New'],
    ],
    'salary_details' => [
        ['team' => $profile['department_name'] ?? 'My Team', 'average' => '$' . number_format((float)$profile['salary'], 2), 'pending' => '0'],
    ],
    'leave_report' => [
        ['metric' => 'Pending requests', 'value' => $pendingLeaves],
        ['metric' => 'Approved requests', 'value' => $approvedLeaves],
        ['metric' => 'Rejected requests', 'value' => $rejectedLeaves],
    ],
    'pending_work' => [
        ['title' => 'Current assignments', 'detail' => (string)count($assignments) . ' active'],
    ],
    'teams' => [
        ['name' => $profile['department_name'] ?? 'Core Team', 'members' => '1'],
    ],
]);
