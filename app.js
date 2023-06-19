import express from 'express';
import {chromium} from 'playwright-chromium';
import got from 'got'
import url from 'url'


/// BLA

const app = express();
const port = 3000;
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.send('Hello World!');
});



/////////////////////////////// 

 app.get('/head', async (req, res) => {
	const { url } = req.query;


	async function getProcessedHeadElements(page) {
		const headElements = await page.$$('head > *');
		const newElements = [];
	
		for (const element of headElements) {
			const tagName = await element.evaluate(el => el.tagName);
			if (tagName.toLowerCase() === 'link') {
				const rel = await element.getAttribute('rel');
				const href = await element.getAttribute('href');
				if (rel && rel.toLowerCase().includes('stylesheet') && href) {
					let hrefUrl = new URL(href, page.url());  // handle both absolute and relative URLs
	
					// Fetch the CSS content
					const response = await got(hrefUrl.toString());
					const cssContent = response.body;
	
					// Add the CSS content to newElements in style tags
					newElements.push({type: 'style', content: cssContent});
				} else {
					// simply add to newElements for non-stylesheet links
					newElements.push({type: 'other', content: await page.evaluate(el => el.outerHTML, element)});
				}
			} else {
				newElements.push({type: 'other', content: await page.evaluate(el => el.outerHTML, element)});
			}
	
			// Remove the current element from the head
			await element.evaluate(el => el.remove());
		}
	
		return newElements;
	}


  
	try {
	  const browser = await chromium.launch({headless: true});
	  const context = await browser.newContext();
	  const page = await context.newPage();
  
	  await page.goto(url);



	  
	  
/// GET STYLESHEETS files, and store content.
/// GET STYLESHEETS files, and store content.
// async function loadExternalStylesheets(page) {
// 	const stylesheetLinks = await page.$$eval('link[rel="stylesheet"][href]', (links) =>
// 	  links.map((link) => link.href)
// 	);

// 	const updatetedHeadElements = [];

// 	for (const link of stylesheetLinks) {
// 	  const response = await got(link);
// 	  console.log(response)
// 	  const content =  response.body.toString();
// 	  updatetedHeadElements.push({ href: link, content });
// 	}

// 	for (const stylesheet of updatetedHeadElements) {
// 	  await page.addStyleTag({ content: 'test jwww' });
// 	  // await page.addStyleTag({ content: stylesheet.content });
// 	}
//   }

//   await loadExternalStylesheets(page);

  
const newElements = await getProcessedHeadElements(page);

for (const newElement of newElements) {
	if(newElement.type === 'style') {
		await page.addStyleTag({content: newElement.content});
	} else {
		await page.evaluate(({content}) => {
			const template = document.createElement('template');
			template.innerHTML = content;
			const newNode = template.content.firstChild;
			document.head.appendChild(newNode);
		}, newElement);
	}
}


//// 

	  const headWeights = await page.evaluate(() => {
		const ElementWeights = {
		  META: 10,
		  TITLE: 9,
		  PRECONNECT: 8,
		  ASYNC_SCRIPT: 7,
		  IMPORT_STYLES: 6,
		  SYNC_SCRIPT: 5,
		  SYNC_STYLES: 4,
		  PRELOAD: 3,
		  DEFER_SCRIPT: 2,
		  PREFETCH_PRERENDER: 1,
		  OTHER: 0
		};
	  
		const ElementDetectors = {
		  META: isMeta,
		  TITLE: isTitle,
		  PRECONNECT: isPreconnect,
		  ASYNC_SCRIPT: isAsyncScript,
		  IMPORT_STYLES: isImportStyles,
		  SYNC_SCRIPT: isSyncScript,
		  SYNC_STYLES: isSyncStyles,
		  PRELOAD: isPreload,
		  DEFER_SCRIPT: isDeferScript,
		  PREFETCH_PRERENDER: isPrefetchPrerender
		};
	  
		function isMeta(element) {
		  return element.matches('meta:is([charset], [http-equiv], [name=viewport])');
		}
	  
		function isTitle(element) {
		  return element.matches('title');
		}
	  
		function isMeta(element) {
		return element.matches('meta:is([charset], [http-equiv], [name=viewport])');
		}

		function isTitle(element) {
		return element.matches('title');
		}

		function isPreconnect(element) {
		return element.matches('link[rel=preconnect]');
		// return element.matches('link[rel=preconnect], link[rel="preconnect style"]');
		}

		function isAsyncScript(element) {
		return element.matches('script[src][async]');
		}

		function isImportStyles(element) {
		const importRe = /@import/;

		if (element.matches('style')) {
		return importRe.test(element.textContent);
		}
		// return false;
		}


		function isImportStyles(element) {
			const importRe = /@import/;
		  
			if (element.matches('style')) {
			  return importRe.test(element.textContent);
			}
		  
			/* TODO: Support external stylesheets.
			if (element.matches('link[rel=stylesheet][href]')) {
			  let response = fetch(element.href);
			  response = response.text();
			  return importRe.test(response);
			} */
		  
			return false;
		  }

		function isSyncScript(element) {
		return element.matches('script:not([src][defer],[src][async],[type*=json])')
		}

		function isSyncStyles(element) {
		return element.matches('link[rel=stylesheet],style');
		}

		function isPreload(element) {
		return element.matches('link:is([rel=preload], [rel=modulepreload])');
		}

		function isDeferScript(element) {
		return element.matches('script[src][defer]');
		}

		function isPrefetchPrerender(element) {
		return element.matches('link:is([rel=prefetch], [rel=dns-prefetch], [rel=prerender])');
		}

		function getWeight(element) {
			for (const [id, detector] of Object.entries(ElementDetectors)) {
			if (detector(element)) {
				return ElementWeights[id];
			}
			}

			return ElementWeights.OTHER;
		}
			
		const headChildren = Array.from(document.head.children);

		return headChildren.map(element => {
			const weight = getWeight(element);
			return { element: element.tagName.toLowerCase(), weight, html: element.outerHTML };
		});
});
  
	//   await browser.close();
  
	  res.json(headWeights);
	} catch (error) {
	  console.error('Error:', error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });




  ///////////// LISTEN

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
