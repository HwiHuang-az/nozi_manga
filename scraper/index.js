const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting scraper...');
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to a site (example: a placeholder or a simple page)
    console.log('Navigating to example.com...');
    await page.goto('https://example.com');
    
    // Get the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Get some text
    const text = await page.$eval('h1', el => el.textContent);
    console.log(`Heading text: ${text}`);
    
    console.log('Scraper test successful!');
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
})();
