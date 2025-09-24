const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const port = 3002

app.use(bodyParser.json())

mongoose.connect('mongodb://mongo:27017/tasks').then(() => {
    console.log('Connected to MongoDB')
}).catch(err => {
    console.error('Could not connect to MongoDB', err)
});

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    const { title, description, email, userId } = req.body;

    try {
        const task = new Task({ title, description, email, userId });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.log("Error creating task:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World2!')
})

app.listen(port, () => {
    console.log(`Task Service is listening on port ${port}`)
})