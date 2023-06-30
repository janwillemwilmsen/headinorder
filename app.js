import express from 'express';
import {chromium} from 'playwright-chromium';
import got from 'got'
import url from 'url'

// GIT IT AGain

/// got(targetUrl, {rejectUnauthorized: false}) /// https://github.com/sindresorhus/got/issues/675

const app = express();
const port = 4000;
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.send('Hello World!');
});



/////////////////////////////// 

 app.get('/head', async (req, res) => {
	const { url } = req.query;



	async function getProcessedHeadElements(page) {
		const headElements = await page.$$('head > *');
		const newElements = await Promise.all(headElements.map(async (element) => {
			const tagName = await element.evaluate(el => el.tagName);
			if (tagName.toLowerCase() === 'link') {
				const rel = await element.getAttribute('rel');
				const href = await element.getAttribute('href');
				if (rel && rel.toLowerCase().includes('stylesheet') && href) {
					let hrefUrl = new URL(href, page.url());  // handle both absolute and relative URLs
	
					// Fetch the CSS content
					const response = await got(hrefUrl.toString());
					let cssContent = response.body;
					// if you don't want all the css, slice everything above 100 chars
					// cssContent = cssContent.slice(0, 100);

					// Return the CSS content in style tags
					return { type: 'style', content: cssContent };
				} else {
					// Return non-stylesheet links
					return { type: 'other', content: await page.evaluate(el => el.outerHTML, element) };
				}
			} else {
				// Return other elements
				return { type: 'other', content: await page.evaluate(el => el.outerHTML, element) };
			}
		}));
	
		// Remove all elements from the head
		await Promise.all(headElements.map(element => element.evaluate(el => el.remove())));
	
		return newElements;
	}
	



  
	try {
	  const browser = await chromium.launch({headless: true});
	//   const browser = await chromium.launch({headless: false});
	  const context = await browser.newContext();
	  const page = await context.newPage();
  
	  await page.goto(url);
	  await page.waitForLoadState('domcontentloaded'); // Wait for DOMContentLoaded event

	  await page.waitForTimeout(1000)

	  
	  

  
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

		const VALID_HEAD_ELEMENTS = new Set([
			'base',
			'link',
			'meta',
			'noscript',
			'script',
			'style',
			'template',
			'title'
		  ]);
	  
		// function isMeta(element) {
		//   return element.matches('meta:is([charset], [http-equiv], [name=viewport]), base');
		// }
	  
		// function isTitle(element) {
		//   return element.matches('title');
		// }
	  
		function isMeta(element) {
		return element.matches('meta:is([charset], [http-equiv], [name=viewport]), base');
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


		// function isImportStyles(element) {
		// 	const importRe = /@import/;
		  
		// 	if (element.matches('style')) {
		// 	  return importRe.test(element.textContent);
		// 	}
		  
		// 	/* TODO: Support external stylesheets.
		// 	if (element.matches('link[rel=stylesheet][href]')) {
		// 	  let response = fetch(element.href);
		// 	  response = response.text();
		// 	  return importRe.test(response);
		// 	} */
		  
		// 	return false;
		//   }

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


		/// NEW 

		function isValidElement(element) {
			// Element itself is not valid.
			if (!VALID_HEAD_ELEMENTS.has(element.tagName.toLowerCase())) {
			  return false;
			}
			
			// Children are not valid.
			if (element.matches(`:has(:not(${Array.from(VALID_HEAD_ELEMENTS).join(', ')}))`)) {
			  return false;
			}
		  
			// <title> is not the first of its type.
			if (element.matches('title:is(:nth-of-type(n+2))')) {
			  return false;
			}
		  
			// <base> is not the first of its type.
			if (element.matches('base:is(:nth-of-type(n+2))')) {
			  return false;
			}
		  
			// CSP meta tag comes after a script. CSP disable preload scanner, invalidates prev downloaded scripts, re-downloads all files....
			if (element.matches('script ~ meta[http-equiv="Content-Security-Policy" i]')) {
			  return false;
			}
		  
			return true;
		  }

		/// NEW end
			
		const headChildren = Array.from(document.head.children);

		return headChildren.map(element => {
			const weight = getWeight(element);
			const isvalidElement = isValidElement(element);
			return { element: element.tagName.toLowerCase(), weight, html: element.outerHTML, valid : isvalidElement };
		});
});
  
	  await browser.close();
  
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
