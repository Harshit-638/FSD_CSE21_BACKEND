const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');

// Middleware for parsing JSON requests and serving static front-end files
app.use(express.json());
app.use(express.static(__dirname));

// Helper: Read requests from requests.json
function getRequests() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(fileData || '[]');
}

// Helper: Save requests to requests.json
function saveRequests(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 1. GET /api/requests - Fetch all requests
app.get('/api/requests', (req, res) => {
  try {
    const requests = getRequests();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error loading requests from file' });
  }
});

// 2. GET /api/requests/:id - Fetch single request by ID
app.get('/api/requests/:id', (req, res) => {
  try {
    const requests = getRequests();
    const item = requests.find((r) => r.id === req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Help desk request not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving request' });
  }
});

// 3. POST /api/requests - Create a new request
app.post('/api/requests', (req, res) => {
  try {
    const { studentName, email, category, priority, description } = req.body;

    // Simple validation
    if (!studentName || !email || !category || !priority || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const requests = getRequests();

    // Auto-increment ticket number or fallback to 101
    const nextId = requests.length > 0 
      ? Math.max(...requests.map(r => parseInt(r.id, 10) || 100)) + 1 
      : 101;

    const newRequest = {
      id: String(nextId),
      studentName: studentName.trim(),
      email: email.trim(),
      category: category.trim(),
      priority: priority.trim(),
      description: description.trim(),
      date: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    requests.push(newRequest);
    saveRequests(requests);

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create help desk request' });
  }
});

// 4. PUT /api/requests/:id - Update an existing request
app.put('/api/requests/:id', (req, res) => {
  try {
    const { studentName, email, category, priority, description } = req.body;

    if (!studentName || !email || !category || !priority || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const requests = getRequests();
    const index = requests.findIndex((r) => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Help desk request not found' });
    }

    requests[index] = {
      ...requests[index],
      studentName: studentName.trim(),
      email: email.trim(),
      category: category.trim(),
      priority: priority.trim(),
      description: description.trim()
    };

    saveRequests(requests);

    res.status(200).json(requests[index]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request' });
  }
});

// 5. DELETE /api/requests/:id - Remove a request
app.delete('/api/requests/:id', (req, res) => {
  try {
    const requests = getRequests();
    const filtered = requests.filter((r) => r.id !== req.params.id);

    if (filtered.length === requests.length) {
      return res.status(404).json({ message: 'Help desk request not found' });
    }

    saveRequests(filtered);
    res.status(200).json({ message: 'Request resolved and removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete request' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Campus Help Desk server running at http://localhost:${PORT}`);
});
