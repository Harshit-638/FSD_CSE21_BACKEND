import http from 'http';
import fs from 'fs';

const fileName = 'students.json';
const staticFiles = {
  '/style.css': { file: 'style.css', type: 'text/css; charset=utf-8' },
  '/assets/abes-logo.webp': { file: 'assets/abes-logo.webp', type: 'image/webp' },
  '/assets/abes-campus.jpg': { file: 'assets/abes-campus.jpg', type: 'image/jpeg' }
};

try {
  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, '[]');
  }
} catch (error) {
  console.error('Could not initialize students.json:', error.message);
  process.exit(1);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

const server = http.createServer((request, response) => {
  const route = request.url.split('?')[0];

  if (request.method === 'GET' && staticFiles[route]) {
    try {
      const asset = staticFiles[route];
      response.writeHead(200, { 'Content-Type': asset.type });
      response.end(fs.readFileSync(asset.file));
    } catch (error) {
      console.error('Could not read static file:', error.message);
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('File not found.');
    }
    return;
  }

  if (request.method === 'GET' && route === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Add Student Record | ABES Engineering College</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body>
          <header class="site-header">
            <a class="brand" href="/">
              <img src="/assets/abes-logo.webp" alt="ABES Engineering College logo">
              <span class="brand-copy">
                <strong>ABES Engineering College</strong>
                <span>Student Record Management System</span>
              </span>
            </a>
            <nav class="site-nav" aria-label="Main navigation">
              <a class="active" href="/">Home</a>
              <a href="/students">Student Records</a>
            </nav>
          </header>

          <main class="home-main">
            <section class="campus-banner" aria-label="ABES campus">
              <div>
                <span class="eyebrow">STUDENT SERVICES</span>
                <h1>Student registration</h1>
                <p>Maintain accurate academic records with ease.</p>
                <p>Secure and simple student record management.</p>
              </div>
            </section>

            <section class="form-card" aria-labelledby="form-title">
              <div class="section-heading">
                <span class="section-mark" aria-hidden="true"></span>
                <div>
                  <h2 id="form-title">Add Student Record</h2>
                  <p>Enter the student's details below.</p>
                </div>
              </div>
              <form method="POST" action="/" class="student-form">
                <label>
                  <span>Student Name</span>
                  <input name="name" type="text" autocomplete="name" placeholder="Enter full name" required>
                </label>
                <label>
                  <span>Roll Number</span>
                  <input name="rollNumber" type="text" placeholder="Enter roll number" required>
                </label>
                <label>
                  <span>Admission Number</span>
                  <input name="admissionNumber" type="text" placeholder="Enter admission number" required>
                </label>
                <label>
                  <span>Course</span>
                  <input name="course" type="text" placeholder="e.g. B.Tech CSE" required>
                </label>
                <label>
                  <span>College Email</span>
                  <input name="email" type="email" autocomplete="email" placeholder="Enter college email" required>
                </label>
                <button type="submit">Add Student</button>
              </form>
            </section>
          </main>
          <footer class="site-footer">ABES Engineering College <span>·</span> Student Services</footer>
        </body>
      </html>
    `);
    return;
  }

  if (request.method === 'POST' && route === '/') {
    let formData = '';
    request.on('data', (chunk) => {
      formData += chunk;
    });
    request.on('end', () => {
      try {
        const form = new URLSearchParams(formData);
        const students = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        students.push({
          name: form.get('name') || '',
          rollNumber: form.get('rollNumber') || '',
          admissionNumber: form.get('admissionNumber') || '',
          course: form.get('course') || '',
          email: form.get('email') || ''
        });
        fs.writeFileSync(fileName, JSON.stringify(students, null, 2));
        response.writeHead(303, { Location: '/students' });
        response.end();
      } catch (error) {
        console.error('Could not save student:', error.message);
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Could not save student record.');
      }
    });
    return;
  }

  if (request.method === 'GET' && route === '/students') {
    try {
      const students = JSON.parse(fs.readFileSync(fileName, 'utf8'));
      const rows = students.length === 0
        ? '<tr><td class="empty-state" colspan="5">No student records available.</td></tr>'
        : students.map((student) => `
        <tr>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.rollNumber)}</td>
          <td>${escapeHtml(student.admissionNumber || '')}</td>
          <td>${escapeHtml(student.course)}</td>
          <td>${escapeHtml(student.email)}</td>
        </tr>
      `).join('');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Student Records | ABES Engineering College</title>
            <link rel="stylesheet" href="/style.css">
          </head>
          <body>
            <header class="site-header">
              <a class="brand" href="/">
                <img src="/assets/abes-logo.webp" alt="ABES Engineering College logo">
                <span class="brand-copy">
                  <strong>ABES Engineering College</strong>
                  <span>Student Records</span>
                </span>
              </a>
              <nav class="site-nav" aria-label="Main navigation">
                <a href="/">Home</a>
                <a class="active" href="/students">Student Records</a>
              </nav>
            </header>

            <main class="records-main">
              <div class="records-heading">
                <div>
                  <span class="eyebrow dark-eyebrow">ACADEMIC ADMINISTRATION</span>
                  <h1>Student Records</h1>
                  <p>Review and manage registered student information.</p>
                </div>
                <a class="add-link" href="/">+ Add New Student</a>
              </div>

              <section class="summary-card" aria-label="Student summary">
                <span class="summary-icon" aria-hidden="true">S</span>
                <span class="summary-label">Total Students</span>
                <strong>${students.length}</strong>
              </section>

              <section class="table-card" aria-label="Student records table">
                <div class="table-scroll">
                  <table>
                    <thead>
                      <tr><th>Student Name</th><th>Roll Number</th><th>Admission Number</th><th>Course</th><th>Gmail</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                  </table>
                </div>
              </section>
            </main>
            <footer class="site-footer">ABES Engineering College <span>·</span> Student Services</footer>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Could not read student records:', error.message);
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Could not read student records.');
    }
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Page not found.');
});

server.listen(3000, () => {
  console.log('Student Records app is running at http://localhost:3000');
});
