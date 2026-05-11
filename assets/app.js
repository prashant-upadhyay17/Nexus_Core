const { useEffect, useMemo, useState } = React;

const api = async (path, options = {}) => {
  const response = await fetch(`api/${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const rawBody = await response.text();
  if (!rawBody) {
    throw new Error(`Server returned an empty response (${response.status})`);
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch (error) {
    throw new Error(`Invalid JSON response from server (${response.status}): ${rawBody}`);
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const navByRole = {
  admin: ["Overview", "Employees", "Projects", "Tools", "Reports", "Leave", "Account"],
  hr: ["Overview", "Employees", "Projects", "Tools", "Reports", "Leave", "Account"],
  user: ["Overview", "HR Analytics", "Assignments", "Requests", "Account"],
};

const accentColors = ["#17a673", "#0891b2", "#f59e0b", "#7c3aed", "#e11d48", "#2563eb"];

function LogoLockup({ compact = false }) {
  return (
    <div className="brand-top">
      <img className="logo" src="assets/logo.svg" alt="Nexus Core logo" />
      {!compact && (
        <div>
          <p className="brand-name">Nexus Core</p>
          <span>Operations Management Platform</span>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    if (event) event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await api("login.php", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin(data.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="brand-panel">
        <div>
          <LogoLockup />
          <h1>Enterprise client operations in one secure workspace.</h1>
          <p>
            Access role-based project command centers for admin, HR, and employees.
            Sign in with your corporate credentials to continue.
          </p>
          <div className="impact-strip">
            <div className="impact-pill">
              <strong>172</strong>
              <span>active client engagements</span>
            </div>
            <div className="impact-pill">
              <strong>42</strong>
              <span>technical initiatives live</span>
            </div>
            <div className="impact-pill">
              <strong>96%</strong>
              <span>on-time delivery performance</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow">Secure access gateway</span>
          <h2>Sign in to your workspace</h2>
          <p className="subcopy">Use your company email and password to open the correct dashboard.</p>

          <form className="form-stack" onSubmit={submit}>
            <div className="field">
              <label>Email address</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="username"
                placeholder="employee@nexuscore.local"
                required
              />
            </div>
            <div className="field password-field">
              <label>Password</label>
              <div className="password-row">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <div className="message">{message}</div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Status({ value }) {
  return <span className={`status ${String(value).toLowerCase().replace(/\s+/g, "-")}`}>{value}</span>;
}

function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric, index) => (
        <div className="metric-card" style={{ "--accent": accentColors[index % accentColors.length] }} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}

function AdminOverview({ data, refresh, onEdit, onDelete }) {
  const [timelineItems, setTimelineItems] = useState(data.timeline || []);
  const [timelineForm, setTimelineForm] = useState({ time: '', title: '', detail: '' });
  const [timelineMessage, setTimelineMessage] = useState('');

  const addTimelineItem = (event) => {
    event.preventDefault();
    if (!timelineForm.time || !timelineForm.title || !timelineForm.detail) {
      setTimelineMessage('Time, title and detail are required.');
      return;
    }
    setTimelineItems((prev) => [{ ...timelineForm }, ...prev]);
    setTimelineForm({ time: '', title: '', detail: '' });
    setTimelineMessage('Timeline event added.');
  };

  const removeTimelineItem = (index) => {
    setTimelineItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <MetricGrid metrics={data.metrics || []} />
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>Employees</h3>
            <button className="ghost-btn" onClick={refresh}>Refresh</button>
          </div>
          {(data.employees || []).length === 0 ? (
          <div className="empty">No employees have been added to the system yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Position</th>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.employees || []).map((employee) => (
                  <tr key={employee.id}>
                    <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.full_name}</td>
                    <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.department_name}</td>
                    <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.position}</td>
                    <td><Status value={employee.status} /></td>
                    <td>
                      <div className="actions" style={{ gap: '4px' }}>
                        <button className="mini-btn" onClick={() => onEdit(employee)}>Edit</button>
                        <button className="mini-btn reject" onClick={() => onDelete(employee.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Operations Timeline</h3>
          </div>
          <form className="add-form" onSubmit={addTimelineItem}>
            <div className="field">
              <label>Time</label>
              <input value={timelineForm.time} onChange={(event) => setTimelineForm({ ...timelineForm, time: event.target.value })} placeholder="08:30" required />
            </div>
            <div className="field">
              <label>Title</label>
              <input value={timelineForm.title} onChange={(event) => setTimelineForm({ ...timelineForm, title: event.target.value })} required />
            </div>
            <div className="field">
              <label>Detail</label>
              <input value={timelineForm.detail} onChange={(event) => setTimelineForm({ ...timelineForm, detail: event.target.value })} required />
            </div>
            <button className="primary-btn">Add Event</button>
            <div className="message">{timelineMessage}</div>
          </form>
          {timelineItems.length === 0 ? (
            <div className="empty">No recent operational events are available.</div>
          ) : (
            <div className="timeline">
              {timelineItems.map((item, index) => (
                <div className="timeline-item" style={{ "--accent": accentColors[index % accentColors.length] }} key={`${item.time}-${index}`}>
                  <time>{item.time}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                    <button type="button" className="mini-btn reject" onClick={() => removeTimelineItem(index)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function EmployeesPanel({ data, refresh, editForm, setEditForm }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department_id: "1",
    position: "",
    salary: "",
  });
  const [message, setMessage] = useState("");

  const addEmployee = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api("admin_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "add_employee", ...form }),
      });
      setForm({ full_name: "", email: "", department_id: "1", position: "", salary: "" });
      setMessage("Employee added successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editEmployee = (employee) => {
    setEditForm(employee);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api("admin_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "edit_employee", ...editForm }),
      });
      setEditForm(null);
      setMessage("Employee updated successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api("admin_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "delete_employee", id }),
      });
      setMessage("Employee deleted successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const decideLeave = async (id, status) => {
    await api("admin_actions.php", {
      method: "POST",
      body: JSON.stringify({ action: "update_leave", id, status }),
    });
    refresh();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Employees</h3>
        <span className="role-badge">People and project resources</span>
      </div>

      <form className="add-form" onSubmit={addEmployee}>
        <div className="field">
          <label>Full name</label>
          <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required />
        </div>
        <div className="field">
          <label>Department</label>
          <select value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })}>
            {(data.departments || []).map((department) => (
              <option value={department.id} key={department.id}>{department.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Position</label>
          <input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} required />
        </div>
        <div className="field">
          <label>Salary (Annual)</label>
          <input value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} type="number" step="0.01" min="0" required />
        </div>
        <button className="primary-btn">Add Employee</button>
      </form>

      {editForm && (
        <form className="add-form" onSubmit={saveEdit}>
          <h4>Edit Employee</h4>
          <div className="field">
            <label>Full name</label>
            <input value={editForm.full_name} onChange={(event) => setEditForm({ ...editForm, full_name: event.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} type="email" required />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={editForm.department_id} onChange={(event) => setEditForm({ ...editForm, department_id: event.target.value })}>
              {(data.departments || []).map((department) => (
                <option value={department.id} key={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Position</label>
            <input value={editForm.position} onChange={(event) => setEditForm({ ...editForm, position: event.target.value })} required />
          </div>
          <div className="field">
            <label>Salary (Annual)</label>
            <input value={editForm.salary} onChange={(event) => setEditForm({ ...editForm, salary: event.target.value })} type="number" step="0.01" min="0" required />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button className="primary-btn">Save Changes</button>
          <button type="button" className="ghost-btn" onClick={() => setEditForm(null)}>Cancel</button>
        </form>
      )}

      <div className="message">{message}</div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Leave Request</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {(data.leaves || []).map((leave) => (
              <tr key={leave.id}>
                <td>{leave.full_name}</td>
                <td>{leave.start_date} to {leave.end_date}</td>
                <td>{leave.reason}</td>
                <td><Status value={leave.status} /></td>
                <td>
                  <div className="actions">
                    <button className="mini-btn approve" onClick={() => decideLeave(leave.id, "Approved")}>Approve</button>
                    <button className="mini-btn reject" onClick={() => decideLeave(leave.id, "Rejected")}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ToolsPanel({ data, refresh }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [editTool, setEditTool] = useState(null);
  const [message, setMessage] = useState('');

  const updateTool = async (id, status) => {
    await api("admin_actions.php", {
      method: "POST",
      body: JSON.stringify({ action: "update_tool", id, status }),
    });
    refresh();
  };

  const saveTool = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api("admin_actions.php", {
        method: "POST",
        body: JSON.stringify({
          action: editTool ? "edit_tool" : "add_tool",
          id: editTool?.id,
          ...form
        }),
      });
      setForm({ name: '', description: '' });
      setEditTool(null);
      setMessage(editTool ? 'Tool updated.' : 'Tool added.');
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteTool = async (id) => {
    if (!confirm("Delete this tool?")) return;
    try {
      await api("admin_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "delete_tool", id }),
      });
      setMessage('Tool deleted.');
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editToolRow = (tool) => {
    setEditTool(tool);
    setForm({ name: tool.name, description: tool.description });
  };

  const tools = data.tools || [];

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Tools & Assets</h3>
      </div>
      <form className="add-form" onSubmit={saveTool}>
        <div className="field">
          <label>Tool Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label>Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <button className="primary-btn">{editTool ? 'Update Tool' : 'Add Tool'}</button>
        {editTool && <button type="button" className="ghost-btn" onClick={() => { setEditTool(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
      </form>
      <div className="message">{message}</div>
      {tools.length === 0 ? (
        <div className="empty">No tools or asset records are available right now.</div>
      ) : (
        <div className="tool-grid">
          {tools.map((tool) => (
            <article className="tool-card" key={tool.id}>
              <strong>{tool.name}</strong>
              <p>{tool.description}</p>
              <p><Status value={tool.status} /></p>
              <div className="actions">
                <button className="mini-btn approve" onClick={() => updateTool(tool.id, "Available")}>Available</button>
                <button className="mini-btn" onClick={() => updateTool(tool.id, "In Use")}>In use</button>
                <button className="mini-btn reject" onClick={() => updateTool(tool.id, "Maintenance")}>Maintenance</button>
                <button className="mini-btn" onClick={() => editToolRow(tool)}>Edit</button>
                <button className="mini-btn reject" onClick={() => deleteTool(tool.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectAssignments({ data, refresh, user }) {
  const assignments = data.assignments || [];
  const isAdmin = user.role === "admin" || user.role === "hr";
  const [form, setForm] = useState({
    client_name: "",
    route: "",
    workload: "Standard",
    assigned_team: "",
    status: "Pending",
    assigned_employee_id: isAdmin ? "" : undefined,
  });
  const [editTask, setEditTask] = useState(null);
  const [message, setMessage] = useState("");

  const assignOptions = data.employees || [];

  const saveTask = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const payload = {
        client_name: form.client_name,
        route: form.route,
        workload: form.workload,
        assigned_team: form.assigned_team,
        status: form.status,
      };
      if (isAdmin) {
        payload.assigned_employee_id = form.assigned_employee_id;
      }

      await api(isAdmin ? "admin_actions.php" : "employee_actions.php", {
        method: "POST",
        body: JSON.stringify({
          action: editTask ? "edit_project" : "add_project",
          id: editTask?.id,
          ...payload,
        }),
      });
      setForm({ client_name: "", route: "", workload: "Standard", assigned_team: "", status: "Pending", assigned_employee_id: isAdmin ? "" : undefined });
      setEditTask(null);
      setMessage(editTask ? "Project updated successfully." : "Project added successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editTaskRow = (task) => {
    setEditTask(task);
    setForm({
      client_name: task.client_name,
      route: task.route,
      workload: task.workload,
      assigned_team: task.assigned_team,
      status: task.status,
      assigned_employee_id: String(task.assigned_employee_id || ""),
    });
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete this project assignment?")) return;
    try {
      await api(isAdmin ? "admin_actions.php" : "employee_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "delete_project", id }),
      });
      setMessage("Project assignment removed.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Project Assignments</h3>
        <span className="role-badge">Projects: {assignments.length}</span>
      </div>
      <form className="add-form" onSubmit={saveTask}>
        <div className="field">
          <label>Client or Project</label>
          <input value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} required />
        </div>
        <div className="field">
          <label>Project Type</label>
          <input value={form.route} onChange={(event) => setForm({ ...form, route: event.target.value })} required />
        </div>
        <div className="field">
          <label>Priority</label>
          <select value={form.workload} onChange={(event) => setForm({ ...form, workload: event.target.value })}>
            <option value="Standard">Standard</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div className="field">
          <label>Team</label>
          <input value={form.assigned_team} onChange={(event) => setForm({ ...form, assigned_team: event.target.value })} required />
        </div>
        {isAdmin && (
          <div className="field">
            <label>Assigned employee</label>
            <select value={form.assigned_employee_id} onChange={(event) => setForm({ ...form, assigned_employee_id: event.target.value })} required>
              <option value="">Choose employee</option>
              {assignOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.full_name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label>Status</label>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button className="primary-btn">{editTask ? "Save Project" : "Add Project"}</button>
        {editTask && <button type="button" className="ghost-btn" onClick={() => { setEditTask(null); setForm({ client_name: "", route: "", workload: "Standard", assigned_team: "", status: "Pending", assigned_employee_id: isAdmin ? "" : undefined }); }}>Cancel</button>}
      </form>
      <div className="message">{message}</div>
      {assignments.length === 0 ? (
        <div className="empty">No project assignments are available at this time.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Project Type</th>
                <th>Priority</th>
                <th>Team</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.client_name}</td>
                  <td>{assignment.route}</td>
                  <td>{assignment.workload}</td>
                  <td>{assignment.assigned_team}</td>
                  <td><Status value={assignment.status} /></td>
                  <td>
                    <div className="actions">
                      <button className="mini-btn" onClick={() => editTaskRow(assignment)}>Edit</button>
                      <button className="mini-btn reject" onClick={() => deleteTask(assignment.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function UserOverview({ data, refresh }) {
  const [message, setMessage] = useState("");

  const clockIn = async () => {
    try {
      await api("employee_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "clock_in" }),
      });
      setMessage("Clocked in successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const clockOut = async () => {
    try {
      await api("employee_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "clock_out" }),
      });
      setMessage("Clocked out successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const pendingLeaveCount = (data.leaves || []).filter((leave) => leave.status === "Pending").length;

  return (
    <>
      <MetricGrid metrics={data.metrics || []} />
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>My Profile</h3>
          </div>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th>Name</th><td>{data.profile?.full_name}</td></tr>
                <tr><th>Department</th><td>{data.profile?.department_name}</td></tr>
                <tr><th>Position</th><td>{data.profile?.position}</td></tr>
                <tr><th>Join Date</th><td>{data.profile?.hire_date}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="actions">
            <button className="primary-btn" onClick={clockIn}>Clock In</button>
            <button className="primary-btn" onClick={clockOut}>Clock Out</button>
          </div>
          <div className="message">{message}</div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Work Summary</h3>
          </div>
          <div className="summary-list">
            <div>
              <strong>{data.assignments?.length || 0}</strong>
              <span>Assigned tasks</span>
            </div>
            <div>
              <strong>{pendingLeaveCount}</strong>
              <span>Pending leave requests</span>
            </div>
            <div>
              <strong>{data.attendance?.length || 0}</strong>
              <span>Recent attendance entries</span>
            </div>
          </div>
        </section>
      </div>

      <AttendancePanel data={data} />
    </>
  );
}

function AttendancePanel({ data }) {
  const attendance = data.attendance || [];

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Attendance Log</h3>
        <span className="role-badge">Recent entries: {attendance.length}</span>
      </div>
      {attendance.length === 0 ? (
        <div className="empty">No attendance records are available yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((row) => (
                <tr key={row.id}>
                  <td>{row.work_date}</td>
                  <td>{row.check_in || "—"}</td>
                  <td>{row.check_out || "—"}</td>
                  <td><Status value={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LeaveRequestsPanel({ data, refresh }) {
  const [leaveForm, setLeaveForm] = useState({ start_date: "", end_date: "", reason: "" });
  const [message, setMessage] = useState("");

  const submitLeave = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api("employee_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "submit_leave", ...leaveForm }),
      });
      setLeaveForm({ start_date: "", end_date: "", reason: "" });
      setMessage("Leave request submitted successfully.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Leave Request Center</h3>
      </div>
      <form onSubmit={submitLeave} className="add-form">
        <div className="field">
          <label>Start Date</label>
          <input value={leaveForm.start_date} onChange={(event) => setLeaveForm({ ...leaveForm, start_date: event.target.value })} type="date" required />
        </div>
        <div className="field">
          <label>End Date</label>
          <input value={leaveForm.end_date} onChange={(event) => setLeaveForm({ ...leaveForm, end_date: event.target.value })} type="date" required />
        </div>
        <div className="field">
          <label>Reason</label>
          <textarea value={leaveForm.reason} onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })} required />
        </div>
        <button className="primary-btn">Submit Leave Request</button>
        <div className="message">{message}</div>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.leaves || []).map((leave) => (
              <tr key={leave.id}>
                <td>{leave.start_date} to {leave.end_date}</td>
                <td>{leave.reason}</td>
                <td><Status value={leave.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LeavePanel({ data, refresh }) {
  const decideLeave = async (id, status) => {
    await api("admin_actions.php", {
      method: "POST",
      body: JSON.stringify({ action: "update_leave", id, status }),
    });
    refresh();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Leave Approval</h3>
      </div>
      {(data.leaves || []).length === 0 ? (
        <div className="empty">No leave requests are awaiting approval.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data.leaves || []).map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.full_name}</td>
                  <td>{leave.start_date} to {leave.end_date}</td>
                  <td>{leave.reason}</td>
                  <td><Status value={leave.status} /></td>
                  <td>
                    <div className="actions">
                      <button className="mini-btn approve" onClick={() => decideLeave(leave.id, "Approved")}>Approve</button>
                      <button className="mini-btn reject" onClick={() => decideLeave(leave.id, "Rejected")}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AccountPanel({ user }) {
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [message, setMessage] = useState("");

  const savePassword = async (event) => {
    event.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setMessage("New password and confirmation must match.");
      return;
    }

    try {
      await api("change_password.php", {
        method: "POST",
        body: JSON.stringify({ ...form }),
      });
      setForm({ old_password: "", new_password: "", confirm_password: "" });
      setMessage("Password updated successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Account Settings</h3>
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><th>Name</th><td>{user.name}</td></tr>
            <tr><th>Email</th><td>{user.email}</td></tr>
            <tr><th>Role</th><td>{user.role}</td></tr>
          </tbody>
        </table>
      </div>
      <form className="add-form" onSubmit={savePassword}>
        <div className="field">
          <label>Current Password</label>
          <input type="password" value={form.old_password} onChange={(event) => setForm({ ...form, old_password: event.target.value })} required />
        </div>
        <div className="field">
          <label>New Password</label>
          <input type="password" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} required />
        </div>
        <div className="field">
          <label>Confirm Password</label>
          <input type="password" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} required />
        </div>
        <button className="primary-btn">Update Password</button>
        <div className="message">{message}</div>
      </form>
    </section>
  );
}

function HRAnalytics({ data }) {
  const salaryDetails = data.salary_details || [];
  const leaveReport = data.leave_report || [];
  const pendingWork = data.pending_work || [];
  const teams = data.teams || [];

  return (
    <>
      <MetricGrid metrics={data.metrics || []} />
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>Salary Overview</h3>
          </div>
          {salaryDetails.length === 0 ? (
            <div className="empty">Salary breakdown is not available.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Average</th>
                    <th>Pending Raises</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryDetails.map((item) => (
                    <tr key={item.team}>
                      <td>{item.team}</td>
                      <td>{item.average}</td>
                      <td>{item.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Leave & Work Report</h3>
          </div>
          {leaveReport.length === 0 ? (
            <div className="empty">No leave and workload analytics are available.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveReport.map((item) => (
                    <tr key={item.metric}>
                      <td>{item.metric}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <section className="panel">
        <div className="panel-head">
          <h3>Team Workload</h3>
        </div>
        {pendingWork.length === 0 ? (
          <div className="empty">No pending work items are visible.</div>
        ) : (
          <ul className="list-group">
            {pendingWork.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="panel">
        <div className="panel-head">
          <h3>Teams & Members</h3>
        </div>
        {teams.length === 0 ? (
          <div className="empty">Team assignments are not available.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.name}>
                    <td>{team.name}</td>
                    <td>{team.members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Reports({ data, refresh }) {
  const [reportForm, setReportForm] = useState({ title: '', detail: '', value: '' });
  const [editReport, setEditReport] = useState(null);
  const [message, setMessage] = useState('');
  const [reportType, setReportType] = useState('overview');

  const saveReport = async (event) => {
    event.preventDefault();
    if (!reportForm.title || !reportForm.detail) {
      setMessage('Title and detail are required.');
      return;
    }
    setMessage(editReport ? 'Report updated (local).' : 'Report added (local).');
    setReportForm({ title: '', detail: '', value: '' });
    setEditReport(null);
  };

  const deleteReport = (index) => {
    setMessage('Report deleted (local).');
  };

  const reports = data.reports || [];

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h3>Reports Dashboard</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="primary-btn">
              <option value="overview">Overview</option>
              <option value="monthly">Monthly</option>
              <option value="leaves">Leaves</option>
              <option value="projects">Projects</option>
            </select>
          </div>
        </div>

        {reportType === 'overview' && (
          <>
            <form className="add-form" onSubmit={saveReport}>
              <div className="field">
                <label>Report Title</label>
                <input value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} placeholder="e.g. Monthly Payroll Readiness" required />
              </div>
              <div className="field">
                <label>Detail</label>
                <textarea value={reportForm.detail} onChange={(e) => setReportForm({ ...reportForm, detail: e.target.value })} placeholder="Report description" required />
              </div>
              <div className="field">
                <label>Value/Status</label>
                <input value={reportForm.value} onChange={(e) => setReportForm({ ...reportForm, value: e.target.value })} placeholder="e.g. 94%" />
              </div>
              <button className="primary-btn">{editReport ? 'Update' : 'Add'} Report</button>
              {editReport && <button type="button" className="ghost-btn" onClick={() => { setEditReport(null); setReportForm({ title: '', detail: '', value: '' }); }}>Cancel</button>}
            </form>
            <div className="message">{message}</div>
            {reports.length === 0 ? (
              <div className="empty">No reports available.</div>
            ) : (
              <div className="tool-grid">
                {reports.map((report, index) => (
                  <article className="tool-card" key={report.title}>
                    <strong>{report.title}</strong>
                    <p>{report.detail}</p>
                    <span className="role-badge">{report.value}</span>
                    <div className="actions">
                      <button className="mini-btn" onClick={() => { setEditReport(index); setReportForm(report); }}>Edit</button>
                      <button className="mini-btn reject" onClick={() => deleteReport(index)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {reportType === 'monthly' && (
          <div className="table-wrap">
            <h4>Monthly Employee Report</h4>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.employees || []).map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.full_name}</td>
                    <td>{emp.department_name}</td>
                    <td>{emp.position}</td>
                    <td>${emp.salary?.toFixed(2) || 'N/A'}</td>
                    <td><Status value={emp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'leaves' && (
          <div className="table-wrap">
            <h4>Leave Report</h4>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.leaves || []).map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.full_name}</td>
                    <td>{leave.start_date} to {leave.end_date}</td>
                    <td>{leave.reason}</td>
                    <td><Status value={leave.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'projects' && (
          <div className="table-wrap">
            <h4>Project Status Report</h4>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Project Type</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {(data.assignments || []).map((proj) => (
                  <tr key={proj.id}>
                    <td>{proj.client_name}</td>
                    <td>{proj.route}</td>
                    <td>{proj.assigned_team}</td>
                    <td><Status value={proj.status} /></td>
                    <td>{proj.workload}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Dashboard({ user, onLogout }) {
  const [active, setActive] = useState("Overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const nav = navByRole[user.role] || navByRole.user;

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await api("dashboard.php");
      console.log('Dashboard data:', payload);
      setData(payload.data);
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
      setData({});
    } finally {
      setLoading(false);
    }
  };

  const editEmployee = (employee) => {
    setEditForm(employee);
  };

  const deleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api("admin_actions.php", {
        method: "POST",
        body: JSON.stringify({ action: "delete_employee", id }),
      });
      addNotification("Employee deleted successfully.", "success");
      refresh();
    } catch (error) {
      addNotification(error.message, "error");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const title = useMemo(() => {
    if (user.role === "admin") return "Admin Command Center";
    return "My Nexus Workspace";
  }, [user.role]);

  const renderActive = () => {
    if (!data) return <div className="empty">Loading dashboard data...</div>;
    if (user.role === "admin" || user.role === "hr") {
      if (active === "Employees") return <EmployeesPanel data={data} refresh={refresh} editForm={editForm} setEditForm={setEditForm} />;
      if (active === "Projects") return <ProjectAssignments data={data} refresh={refresh} user={user} />;
      if (active === "Tools") return <ToolsPanel data={data} refresh={refresh} />;
      if (active === "Reports") return <Reports data={data} />;
      if (active === "Leave") return <LeavePanel data={data} refresh={refresh} />;
      if (active === "Account") return <AccountPanel user={user} />;
      return <AdminOverview data={data} refresh={refresh} onEdit={editEmployee} onDelete={deleteEmployee} />;
    }
    if (active === "HR Analytics") return <HRAnalytics data={data} />;
    if (active === "Assignments") return <ProjectAssignments data={data} refresh={refresh} user={user} />;
    if (active === "Requests") return <LeaveRequestsPanel data={data} refresh={refresh} />;
    if (active === "Account") return <AccountPanel user={user} />;
    return <UserOverview data={data} refresh={refresh} />;
  };

  return (
    <main className="dashboard">
      <div className="notifications">
        {notifications.map((note) => (
          <div className={`notification ${note.type}`} key={note.id}>
            {note.message}
          </div>
        ))}
      </div>
      <aside className="sidebar">
        <LogoLockup />
        <nav className="nav-stack">
          {nav.map((item) => (
            <button className={`nav-item ${active === item ? "active" : ""}`} onClick={() => setActive(item)} key={item}>
              <span>{item.slice(0, 1)}</span>
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="danger-btn" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>{active} for {user.name}</p>
          </div>
          <div className="profile-chip">
            <div className="avatar">{user.name.slice(0, 1)}</div>
            <div>
              <strong>{user.name}</strong>
              <br />
              <span className="role-badge">{user.role}</span>
            </div>
          </div>
        </header>
        {loading ? (
          <div className="empty">Loading live database data...</div>
        ) : error ? (
          <div className="empty">{error}</div>
        ) : (
          renderActive()
        )}
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api("me.php")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await api("logout.php", { method: "POST", body: "{}" });
    setUser(null);
  };

  if (checking) return <div className="loading">Opening Nexus Core...</div>;

  return (
    <div className="app-shell">
      {user ? <Dashboard user={user} onLogout={logout} /> : <LoginScreen onLogin={setUser} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
