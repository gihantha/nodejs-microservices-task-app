const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const amqp = require('amqplib')

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

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay =3000){
    while(retries) {
        try {
            connection = await amqp.connect("amqp://rabbitmq")
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            console.log("Connected to RabbitMQ");
            return;
        } catch (error) {
            console.log("RabbitMQ connection failed, retrying...", error.message);
            retries--;
            console.log("Retrying again:", retries, "more times");
            await new Promise(res => setTimeout(res, delay)); // wait before retrying
        }
    }
}

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    const { title, description, email, userId } = req.body;

    try {
        const task = new Task({ title, description, email, userId });
        await task.save();

        const message = { taskId: task._id, userId, title};

        if(!channel) {
            return res.status(503).json({ error: 'Service Unavailable' });
        }

        channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)));
        
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
    connectRabbitMQWithRetry();
})