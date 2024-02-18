const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const pool = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { secretKey } = require('./config/config');
const config = require('./config/config');

//authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.redirect('/login'); // Redirect to login if token is not provided
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.redirect('/login'); // Redirect to login if token is invalid or expired
        }

        req.user = user;
        next();
    });
};
app.use(express.json());
app.use(cors());


// login
app.post('/login', async (req, res) => {
    const { user_email, password } = req.body;
    try {
        console.log('Received request:', req.body);
        const result = await pool.query('SELECT * FROM users WHERE user_email = $1', [user_email]);
        if (result.rows.length === 0) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
        if (isPasswordValid) {
            const token = jwt.sign({ user_id: result.rows[0].id }, config.secretKey, { expiresIn: '1h' });
            console.log('Generated Token:', token);
            res.status(200).json({ message: 'Login successful', token, user_id: result.rows[0].id });
        } else {
            console.log('Invalid password');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
});

// create user
app.post('/users', async (req, res) => {
    const { first_name, last_name, user_email, password, confirmPassword, gender, birthDate } = req.body;

    // Additional validation
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, user_email, password, gender, birthDate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, user_email, hashedPassword, gender, birthDate]
        );

        console.log(result);
        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});
// Endpoint to create a new task
app.post('/tasks', authenticateToken, async (req, res) => {
    const { task_name, notes, deadline, priority, label, progress } = req.body;
    const user_id = req.user.user_id; // Extract user_id from the authenticated user

    try {
        // Check if task name is provided
        if (!task_name && !deadline) {
            return res.status(400).json({ message: 'Field is required' });
        }
        // Insert new task into database with user_id
        const result = await pool.query(
            'INSERT INTO todos (task_name, subtask, deadline, priority_id, label_id, progress_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [task_name, notes, deadline, priority, label, progress, user_id]
        );

        res.status(201).json({ message: 'Task created successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});
// ...

app.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('Token not provided');
            return res.status(401).json({ message: 'Token not provided' });
        }
        const token = authHeader.split(' ')[1];
        console.log('Received token:', token);
        const decodedToken = jwt.verify(token, secretKey);
        // Extract user_id from the decoded token
        const user_id = decodedToken.user_id;
        if (!user_id) {
            console.error('Invalid user_id');
            return res.status(401).json({ message: 'Invalid user_id' });
        }
        // Assuming you have a query to fetch tasks from your database
        const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [user_id]);
        res.status(200).json({ tasks: result.rows });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
});

// Endpoint to delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        // Assuming you have a query to delete the task from the database
        await pool.query('DELETE FROM todos WHERE id = $1', [taskId]);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

// Endpoint to update a task by ID
app.put('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    const { task_name, notes, deadline, priority, label, progress } = req.body;

    try {
        const result = await pool.query(
            'UPDATE todos SET task_name = $1, subtask = $2, deadline = $3, priority_id = $4, label_id = $5, progress_id = $6 WHERE id = $7 RETURNING *',
            [task_name, notes, deadline, priority, label, progress, taskId]
        );

        res.status(200).json({ message: 'Task updated successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});
// Port to listen
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
