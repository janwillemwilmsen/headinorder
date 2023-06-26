# headinorder / perfhead
Analyzes the elements in the head of your page.
Shows current order, and outputs optimal order.

## Node/Express app with Playwright/Chrome 
Clone and install
Start server with : node app
Go to : localhost:4000
Test url.

Uses Capo.js as base script.

*Differences:* 
- fetches external stylesheets and converts them into <style> </style> elements to test if there are @import rules in them.
- uses what browser returns as the head, including elements added by scripts (in tagmanagers). 
- does not test if there are multiple head elements in the html of the tested page.
- sites that have Cloudflare/Akamai or other bot detection are blocked.
- pages are tested without accepting cookie consent 

http://localhost:4000/head?url=https://example.com 
Returns the json.

http://localhost:4000/testpage/ 
Contains page with CSP, and with duplicate title, base tags. 
- Multiple title/base tags are invalid.
- CSP after scripts/css invalidates the preload scanner, all files need to be downloaded again.
- elements other than base, link, meta, noscript, script, style, template, title are also invalid (but not in the testpage)




