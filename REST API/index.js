import express from 'express';

const app = express();

app.use(express.json());

let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

//GET: fetch all users data
app.get('/users', (req, res) => {
    res.json(users);
});

//POST: create a new user
app.post('/users', (req, res) => {
    let newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
