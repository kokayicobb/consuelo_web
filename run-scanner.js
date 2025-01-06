const ShopifyStoreFinder = require('./store-scanner');

async function run() {
    const finder = new ShopifyStoreFinder();
    
    try {
        const results = await finder.findAndAnalyzeStores([
            'apparel',
            'clothing',
            'fashion',
            'hats',
            'helmets'
        ]);
        
        if (results) {
            console.log(`Successfully analyzed ${results.length} stores`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

run();