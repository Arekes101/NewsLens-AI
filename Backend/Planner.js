class Planner {
    analyze(query) {
        const lowerQuery = query.toLowerCase();
        
        // Step 1: Detect Action
        let action = 'summarize'; // Default
        if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('top')) {
            action = 'recommend';
        } else if
