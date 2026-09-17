const planner = require('./planner');
const executor = require('./executor');
const memory = require('./memory');

class Agent {
    constructor() {
        this.memory = memory;
    }

    async processQuery(query, sessionId = 'default') {
        try {
            // Step 1: Plan the intent
            const plan = planner.analyze(query);
            
            // Step 2: Execute the plan
            const result = await executor.execute(plan, sessionId);
            
            // Step 3: Store in memory
            this.memory.store(sessionId, {
                query,
                response: result,
                timestamp: new Date().toISOString()
            });

            // Step 4: Add follow-up suggestions
            const suggestions = this.generateSuggestions(plan);
            
            return {
                answer: result,
                suggestions,
                plan: plan
            };
        } catch (error) {
            console.error('Agent error:', error);
            throw error;
        }
    }

    generateSuggestions(plan) {
        const suggestions = [];
        const { action, category } = plan;
        
        switch(action) {
            case 'summarize':
                suggestions.push(`Tell me more about ${category}`);
                suggestions.push(`What are the top headlines in ${category}?`);
                break;
            case 'recommend':
                suggestions.push(`Why these recommendations?`);
                suggestions.push(`Show me more ${category} news`);
                break;
            default:
                suggestions.push('Summarize today\'s news');
                suggestions.push('Recommend top headlines');
        }
        
        return suggestions.slice(0, 3);
    }
}

module.exports = new Agent();
