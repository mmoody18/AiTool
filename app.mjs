import { OpenAIAssistantRunnable } from 'langchain/experimental/openai_assistant'; // only way is to import this to access the assistant
import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config(); // Load environment variables from .env file 
// .env file not included in github due to sensitive key information
// file should be formatted like so: 
// OPENAI_API_KEY=<key>
// OPENAI_ASSISTANT_ID=<ID>

const app = express();
const PORT = 3000;

app.use(cors());
app.use(json());

// openai assistant setups
const assistantId = process.env.OPENAI_ASSISTANT_ID;
const assistant = new OpenAIAssistantRunnable({ assistantId });
console.log("assistant: " + assistantId + " Id: " + process.env.OPENAI_ASSISTANT_ID);

// Function to send a message to the assistant
const sendMessageToAssistant = async (message) => {
    try {
        const response = await assistant.invoke({ content: message });
        
        // Assuming response format is an array
        const assistantMessage = response[0].content[0].text.value;

        // Remove the unwanted characters
        const cleanedMessage = assistantMessage.replace(/【\d+:\d+†source】|[*#]/g, '');

        console.log(cleanedMessage); // helps set up testing in console before output to website
        return cleanedMessage;
    } catch (error) { // error handling
        console.error('Error sending message to assistant:', error.response ? error.response.data : error.message);
        throw new Error('Error generating response');
    }
};

app.post('/api/generate', async (req, res) => { //generates api
    const userMessage = req.body.prompt;

    try {
        let assistantMessage = await sendMessageToAssistant(userMessage);
        res.json({ message: assistantMessage });
    } catch (error) {
        console.error('Error generating response:', error.message);
        res.status(500).send('Error generating response');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`); // shows up successful in the node console if 
});