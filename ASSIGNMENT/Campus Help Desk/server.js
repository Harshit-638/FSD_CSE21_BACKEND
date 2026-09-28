const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');

// Middleware for parsing JSON request bodies
app.use(express.json());

// Serve static frontend assets (HTML, CSS, JS, Images)
app.use(express.static(__dirname));

// Helper function to read all requests from JSON file
const readRequests = async () => {
  try {
    const data = await fs.promises.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper function to write requests to JSON file
const writeRequests = async (requests) => {
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(requests, null, 2), 'utf8');
};

// Helper function to generate a readable unique ticket ID
const generateId = () => {
  return `CHD-${Math.floor(100 + Math.random() * 900)}`;
};

// 1. GET /api/requests - Retrieve all requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await readRequests();
    res.json(requests);
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ error: 'Failed to retrieve requests.' });
  }
});

// 2. GET /api/requests/:id - Retrieve a single request by ID
app.get('/api/requests/:id', async (req, res) => {
  try {
    const requests = await readRequests();
    const request = requests.find((r) => r.id === req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Campus request not found.' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch the request.' });
  }
});

// 3. POST /api/requests - Submit a new request
app.post('/api/requests', async (req, res) => {
  try {
    const { studentName, email, category, priority, problemDescription } = req.body;

    // Validate required fields
    if (!studentName || !email || !category || !priority || !problemDescription) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const requests = await readRequests();

    const newRequest = {
      id: generateId(),
      studentName: studentName.trim(),
      email: email.trim(),
      category: category.trim(),
      priority: priority.trim(),
      problemDescription: problemDescription.trim(),
      createdAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    // Prepend to show latest request first
    requests.unshift(newRequest);
    await writeRequests(requests);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create campus request.' });
  }
});

// 4. PUT /api/requests/:id - Update an existing request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const { studentName, email, category, priority, problemDescription } = req.body;

    if (!studentName || !email || !category || !priority || !problemDescription) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const requests = await readRequests();
    const index = requests.findIndex((r) => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Campus request not found.' });
    }

    // Update fields while preserving original ID and createdAt
    requests[index] = {
      ...requests[index],
      studentName: studentName.trim(),
      email: email.trim(),
      category: category.trim(),
      priority: priority.trim(),
      problemDescription: problemDescription.trim(),
      updatedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    await writeRequests(requests);
    res.json(requests[index]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update campus request.' });
  }
});

// 5. DELETE /api/requests/:id - Delete an existing request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const requests = await readRequests();
    const index = requests.findIndex((r) => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Campus request not found.' });
    }

    const deletedItem = requests.splice(index, 1)[0];
    await writeRequests(requests);

    res.json({ message: 'Campus request deleted successfully.', deleted: deletedItem });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete campus request.' });
  }
});

// Default route serving the portal frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`ABES Engineering College - Campus Help Desk Portal`);
  console.log(`Server actively running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
