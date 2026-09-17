const express = require('express');
const cors = require('cors');
const agent = require('./agent/agent');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// News Fetch Endpoint
app.get('/news/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const news = await agent.processQuery(`Show ${category} news`);
        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// AI Chat Endpoint
app.post('/chat', async (req, res) => {
    try {
        const { query, sessionId } = req.body;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query cannot be empty'
            });
        }

        const response = await agent.processQuery(query, sessionId);
        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process your request. Please try again.'
        });
    }
});

// Summarize Endpoint
app.post('/summarize', async (req, res) => {
    try {
        const { category, language = 'en' } = req.body;
        const query = `Summarize ${category} news in ${language}`;
        const response = await agent.processQuery(query);
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 NewsLens AI Server running on http://localhost:${PORT}`);
});
