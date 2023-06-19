import express from 'express';
import {chromium} from 'playwright-chromium';
import got from 'got'
const app = express();
const port = 3000;
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});



/////////////////////////////// 

 app.get('/head', async (req, res) => {
	const { url } = req.query;
  
	try {
	  const browser = await chromium.launch({
		headless: false,
	  });
	  const context = await browser.newContext();
	  const page = await context.newPage();
  
	  await page.goto(url);




	  
/// GET STYLESHEETS files, and store content.
 async function loadExternalStylesheets(page) {
      const stylesheetLinks = await page.$$eval('link[rel="stylesheet"][href]', (links) =>
        links.map((link) => link.href)
      );

      const stylesheetContents = [];

      for (const link of stylesheetLinks) {
        const response = await got(link);
		console.log(response)
        const content =  response.body.toString();
        stylesheetContents.push({ href: link, content });
      }

      for (const stylesheet of stylesheetContents) {
        await page.addStyleTag({ content: 'test jwww' });
        // await page.addStyleTag({ content: stylesheet.content });
      }
    }

    await loadExternalStylesheets(page);


	await loadExternalStylesheets(page);

    const headWeights = await page.evaluate(
      (loadExternalStylesheets) => {
	  // Call the loadExternalStylesheets function
	//   await loadExternalStylesheets();
		  // Your existing headWeights logic goes here
		  const ElementWeights={
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
		  const ElementDetectors={
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
		  function isMeta(element_20) {
			  return element_20.matches('meta:is([charset], [http-equiv], [name=viewport])');
		  }
		  function isTitle(element_21) {
			  return element_21.matches('title');
		  }
		  function isMeta(element_22) {
			  return element_22.matches('meta:is([charset], [http-equiv], [name=viewport])');
		  }
		  function isTitle(element_23) {
			  return element_23.matches('title');
		  }
		  function isPreconnect(element_24) {
			  return element_24.matches('link[rel=preconnect]');
		  }
		  function isAsyncScript(element_25) {
			  return element_25.matches('script[src][async]');
		  }
		  function isImportStyles(element_26) {
			  const importRe=/@import/;

			  if(element_26.matches('style')) {
				  return importRe.test(element_26.textContent);
			  }
		  }
		  function isImportStyles(element_27) {
			  const importRe_1=/@import/;

			  if(element_27.matches('style')) {
				  return importRe_1.test(element_27.textContent);
			  }

			  /* TODO: Support external stylesheets.
			  if (element.matches('link[rel=stylesheet][href]')) {
				let response = fetch(element.href);
				response = response.text();
				return importRe.test(response);
			  } */
			  return false;
		  }
		  function isSyncScript(element_28) {
			  return element_28.matches('script:not([src][defer],[src][async],[type*=json])');
		  }
		  function isSyncStyles(element_29) {
			  return element_29.matches('link[rel=stylesheet],style');
		  }
		  function isPreload(element_30) {
			  return element_30.matches('link:is([rel=preload], [rel=modulepreload])');
		  }
		  function isDeferScript(element_31) {
			  return element_31.matches('script[src][defer]');
		  }
		  function isPrefetchPrerender(element_32) {
			  return element_32.matches('link:is([rel=prefetch], [rel=dns-prefetch], [rel=prerender])');
		  }
		  function getWeight(element_33) {
			  for(const [id,detector] of Object.entries(ElementDetectors)) {
				  if(detector(element_33)) {
					  return ElementWeights[id];
				  }
			  }

			  return ElementWeights.OTHER;
		  }
		  const headChildren=Array.from(document.head.children);
		  return headChildren.map((element_35) => {
			  const weight=getWeight(element_35);
			  return {element: element_35.tagName.toLowerCase(),weight,html: element_35.outerHTML};
		  });
      },
      loadExternalStylesheets
    );

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
