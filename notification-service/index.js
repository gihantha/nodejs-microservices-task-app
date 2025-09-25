const amqp = require('amqplib');

async function start(){
        try {
            connection = await amqp.connect("amqp://rabbitmq")
            channel = await connection.createChannel();

            await channel.assertQueue("task_created");
            console.log("Notification service is listening for messages in task_created queue");
            
            channel.consume("task_created", msg => {
                const taskData = JSON.parse(msg.content.toString());
                console.log("Notification: NEW TASK: ", taskData.title);
                console.log("Notification: NEW TASK: ", taskData);
                channel.ack(msg);
            }); 

        } catch (error) {
            console.log("RabbitMQ connection failed, retrying...", error.message);
            retries--;
            console.log("Retrying again:", retries, "more times");
            await new Promise(res => setTimeout(res, delay)); // wait before retrying
        }
    
}

start();