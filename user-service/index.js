const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const port = 3001

app.use(bodyParser.json())

mongoose.connect('mongodb://localhost:27017/users').then(() => {
    console.log('Connected to MongoDB')
}).catch(err => {
    console.error('Could not connect to MongoDB', err)
});

const UserSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', UserSchema);

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/users', async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = new User({ name, email });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.log("Error creating user:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
