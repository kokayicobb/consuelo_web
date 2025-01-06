const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const { parse } = require('json2csv');

class ShopifyStoreFinder {
    constructor() {
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        
        this.targetIndicators = {
            size_related: [
                'size-chart',
                'size-guide',
                'product-size-guide',
                'size-finder',
                'fit-predictor'
            ],
            returns_related: [
                'return-magic',
                'returns-center',
                'return-portal',
                'returnly'
            ],
            '3d_related': [
                'model-viewer',
                '3d-viewer',
                'product-3d',
                'virtual-try-on'
            ]
        };
    }

    async findShopifyStores(niche = 'clothing') {
        const stores = new Set();
        
        // List of known Shopify clothing directories
        const directories = [
            'https://trends.builtwith.com/websitelist/Shopify',
        ];

        // Also search through known Shopify marketplaces (focused on apparel/headwear)
        const knownStores = [
            'fashionnova.com',
            'gymshark.com',
            'allbirds.com',
            'newera.com',
            'lids.com',
            'hatclub.com',
            'brixton.com',
            'carhartt.com',
            'zumiez.com',
            'alpinestarsinc.com',
            'revzilla.com',
            'ruralkingstore.com',
            'capswag.com',
            'peakheadwear.com',
            'shophelmets.com',
            // Focused on potential competitors and similar markets
        ];

        // First add known stores
        for (const store of knownStores) {
            const url = `https://${store}`;
            if (await this.validateShopifyStore(url)) {
                stores.add(url);
            }
            await this.delay(1000);
        }

        // Then try to find more through directories
        for (const directory of directories) {
            try {
                const response = await axios.get(directory, {
                    headers: this.headers,
                    timeout: 10000
                });
                
                const $ = cheerio.load(response.data);
                const links = $('a');
                
                for (const link of links) {
                    const href = $(link).attr('href');
                    if (href && !href.includes('shopify.com')) {
                        try {
                            const url = new URL(href, directory);  // Ensure the URL is absolute
                            const baseUrl = `${url.protocol}//${url.hostname}`;
                            if (await this.validateShopifyStore(baseUrl)) {
                                stores.add(baseUrl);
                            }
                        } catch (e) {
                            // Invalid URL, skip
                            continue;
                        }
                    }
                    await this.delay(1000);
                }
            } catch (error) {
                console.error(`Error accessing directory ${directory}: ${error.message}`);
                continue;
            }
        }

        return Array.from(stores);
    }

    async validateShopifyStore(url) {
        try {
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 10000
            });
            return (
                response.data.includes('myshopify.com') ||
                response.data.includes('shopify.com') ||
                response.data.includes('cdn.shopify.com')
            );
        } catch {
            return false;
        }
    }

    async scanStore(url) {
        const storeData = {
            url,
            size_features: [],
            return_features: [],
            '3d_features': [],
            has_size_chart: false,
            has_return_portal: false,
            has_3d_viewer: false,
            product_count: 0,
            estimated_size_variants: 0
        };

        try {
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            const pageSource = response.data.toLowerCase();

            // Check for indicators
            Object.entries(this.targetIndicators).forEach(([category, indicators]) => {
                indicators.forEach(indicator => {
                    if (pageSource.includes(indicator)) {
                        // Initialize the array if it's undefined
                        if (!storeData[`${category}`]) storeData[`${category}`] = [];
                        storeData[`${category}`].push(indicator);
                        
                        const featureType = category.includes('3d') ? 'viewer' : 
                                          category.includes('size') ? 'chart' : 'portal';
                        storeData[`has_${category.split('_')[0]}_${featureType}`] = true;
                    }
                });
            });

            // Count products and analyze sample product
            const products = $('.product, [class*="product-"]');
            storeData.product_count = products.length;

            if (products.length > 0) {
                try {
                    const productLink = $(products[0]).find('a').attr('href');
                    if (productLink) {
                        const productUrl = productLink.startsWith('http') ? 
                            productLink : `${url.replace(/\/$/, '')}${productLink}`;
                        
                        const productResponse = await axios.get(productUrl, { 
                            headers: this.headers,
                            timeout: 10000
                        });
                        const product$ = cheerio.load(productResponse.data);
                        const variants = product$('[class*="size-"], [class*="variant-"]');
                        storeData.estimated_size_variants = variants.length;
                    }
                } catch (error) {
                    console.error(`Error analyzing product: ${error.message}`);
                }
            }

            return storeData;
        } catch (error) {
            console.error(`Error scanning ${url}: ${error.message}`);
            return null;
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async findAndAnalyzeStores(keywords = ['apparel', 'clothing', 'fashion', 'accessories']) {
        console.log("Finding Shopify stores...");
        const stores = new Set();
        
        for (const keyword of keywords) {
            const found = await this.findShopifyStores(keyword);
            found.forEach(store => stores.add(store));
            await this.delay(2000);
        }

        const storeList = Array.from(stores);
        console.log(`Found ${storeList.length} stores to analyze`);

        const results = [];
        for (const store of storeList) {
            console.log(`Analyzing ${store}...`);
            const result = await this.scanStore(store);
            if (result) results.push(result);
            await this.delay(2000);
        }

        if (results.length > 0) {
            // Save to CSV
            const csv = parse(results);
            await fs.writeFile('shopify_analysis.csv', csv);
            console.log('Results saved to shopify_analysis.csv');

            // Find best prospects
            const prospects = results.filter(store => 
                store.has_size_chart && 
                !store.has_3d_viewer && 
                store.estimated_size_variants > 3
            );

            console.log('\nTop prospects (stores with size charts but no 3D viewer):');
            prospects.forEach(store => {
                console.log(`\nURL: ${store.url}`);
                console.log(`Size features: ${store.size_features.join(', ')}`);
                console.log(`Product count: ${store.product_count}`);
                console.log(`Size variants: ${store.estimated_size_variants}`);
            });

            return results;
        }

        return null;
    }
}

module.exports = ShopifyStoreFinder;
