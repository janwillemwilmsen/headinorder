

/// Function to remove Overflow from <code> element in sorted view
const copyableElements = document.getElementsByClassName('copyable');
function showHideOverflowedText() {
	const selectedValue = document.querySelector('input[name="overflowToggle"]:checked').value;
  
	for (let i = 0; i < copyableElements.length; i++) {
	  const element = copyableElements[i];
  
	  if (selectedValue === 'visible') {
		element.style.overflow = 'visible';
		element.style.whiteSpace = 'normal';
	  } else {
		element.style.overflow = 'hidden';
		element.style.whiteSpace = 'nowrap';
	  }
	}
  }




const LOGGING_PREFIX = 'Capo: ';
 

/// Fetch the data from api
async function fetchHead2() {
		// const response = await fetch(`http://localhost:3000/head?url=https://www.essent.nl`);
		const urlInput = document.getElementById('url');
		const response = await fetch(`/head?url=${encodeURIComponent(urlInput.value)}`);
		// console.log(response)
		const headChildren = await response.json();
		console.log('data fetchhead:',headChildren)
		console.log('Is data an array? -false ', Array.isArray(headChildren))
		return headChildren;
}


 /// Added swiches for Mobile/Desktop

function visualizeWeight(weight) {
// return `<span class="weight-${weight + 1}">${new Array(weight + 1).fill('█').join('')}</span>`;

if (window.matchMedia("(max-width: 767px)").matches) {
	return `<span class="weight-${weight + 1}">${new Array(weight + 1).fill('|').join('')}</span>`;
  } else {
	return `<span class="weight-${weight + 1}">${new Array(weight + 1).fill('█').join('')}</span>`;
  }

}

function visualizeWeights(weights) {
// weights is an array of objects, so you can destructure each object in the map function
let visual;
if (window.matchMedia("(max-width: 767px)").matches) {
 visual = weights.map(({ weight }) => `<span style="padding:0px;margin:0;" class="weight-${weight +1}">${"|"}</span>`).join('');
} else {
 visual = weights.map(({ weight }) => `<span style="padding:0px;margin:0;" class="weight-${weight +1}">${"█"}</span>`).join('');
}


return visual;
}

function visualizeSortedWeights(weights) {
let visual
	if (window.matchMedia("(max-width: 767px)").matches) {
 visual = weights.map(weight => `<span class="weight-${weight +1}">${"|"}</span>`).join('');
	} else {
 visual = weights.map(weight => `<span class="weight-${weight +1}">${"█"}</span>`).join('');
	}
return visual;
}

function htmlEncode(str){
return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
		

/// Add styling to show when invalid head-elements are in the head.
let validSign;
let validStyle;
function validatedHeadElement(valid){
	if(valid === true){
		console.log('FOUND valid element')
		validStyle = ''
		validSign = ''
	}
	else {
		console.log('FOUND invalid element')
		validStyle = 'red'
		validSign = `❌`; /* Content to be prepended */
	}
}



async function logWeights() {

	/// REMOVE ERROR IF IT WAS THERE FROM PREV CHECK:
	const errorDiv = document.getElementById('error');
	errorDiv.innerHTML = ``

	
	const loadingVideo = document.getElementById('loading-video');
	try {


	const resultsContainer = document.getElementById('results-container');
	resultsContainer.innerHTML = '';
	
	const form = document.querySelector('form');
	const urlInput = document.getElementById('url');
  
	// Show the loading video
	loadingVideo.style.display = 'block';
  
	// Disable the form while waiting
	form.classList.add('disabled');
	urlInput.disabled = true;



// const headWeights = getHeadWeights();
const headWeights = await fetchHead2();
const actualViz = visualizeWeights(headWeights);

console.log(headWeights)

const actualOrderDetails = document.createElement('details');
actualOrderDetails.className = 'results'
const actualOrderSummary = document.createElement('summary');
actualOrderSummary.innerHTML = `<span class="summaryText">${LOGGING_PREFIX} Actual &lt;head&gt; order</span>`;
const actualVizSpan = document.createElement('span');
actualVizSpan.classList = 'barItems'
actualVizSpan.innerHTML = `<br>${actualViz}`;
actualOrderSummary.appendChild(actualVizSpan);

actualOrderDetails.innerHTML += `<p class="detailsText">Actual &lt;head&gt; element ${document.head.innerHTML}</p>`;
actualOrderDetails.appendChild(actualOrderSummary);

//// Can't bypass Cloudflare bot detection. (Could not get Playwright Stealth working.) -> Show bot detected message:
let cloudflareObj = headWeights.some(item => item.html.includes("cloudflare"));
console.log(cloudflareObj)

if(cloudflareObj === true){
	// create a new element
	const newElement = document.createElement('div');
	
	// give the new element some content
	newElement.innerHTML = `<div style=" color:white;text-align:center;">
							The website you are testing is protected by Cloudflare. <br>Perfhead cannot access the html..... please use ct.css or capo.js in another way.
							</div>
							<style> .results{display:none;} </style>
							`
	resultsContainer.appendChild(newElement);
}






//   actualOrderDetails.innerHTML += `<pre>${actualViz}</pre>`;
headWeights.forEach(({element, weight, html, valid}) => {






console.log('VALID::', valid)
const isvalidated = validatedHeadElement(valid)

console.log('ELEMENT -->',element)
const viz = visualizeWeight(weight);
// const encodedElement = htmlEncode(element.outerHTML);
const encodedElement = element;

const codedHeadElement = htmlEncode(html)
 
actualOrderDetails.innerHTML += `<div class="outerresults">
									<div class="visWeight">${viz} ${weight + 1}</div> 
									<div style="user-select: none;width:50px; min-width: 50px;height: 20px;  overflow: hidden;  white-space: nowrap;background-color:${validStyle}"> 	${encodedElement}: </div>
							  		<code style="display:inline-block;overflow-wrap:anywhere; overflow: hidden; white-space:nowrap;" class="Xlanguage-html">
									  <span style="user-select: none;">	${validSign} </span>
										${codedHeadElement}
									</code>
								 </div>`;
});

resultsContainer.appendChild(actualOrderDetails);

const sortedWeights = headWeights.sort((a, b) => {
return b.weight - a.weight;
});
console.log('Sorted type::', typeof sortedWeights)
console.log('Sorted:', sortedWeights)
const sortedOrderDetails = document.createElement('details');
sortedOrderDetails.className = 'results'
const sortedOrderSummary = document.createElement('summary');
sortedOrderSummary.innerHTML = `<span class="summaryText">${LOGGING_PREFIX} Sorted &lt;head&gt; order</span>`;
const sortedViz = visualizeSortedWeights(sortedWeights.map(obj => obj.weight));
const sortedVizSpan = document.createElement('span');
sortedVizSpan.classList = 'barItems'
sortedVizSpan.innerHTML = `<br>${sortedViz}`;
sortedOrderSummary.appendChild(sortedVizSpan);
sortedOrderDetails.innerHTML += `<p class="detailsText">Sorted &lt;head&gt; element</p>`;
sortedOrderDetails.appendChild(sortedOrderSummary);

 const sortedHead = document.createElement('span');





sortedWeights.forEach(({element, weight, html, valid}) => {
	const isvalidated = validatedHeadElement(valid)
const viz = visualizeWeight(weight);
 const encodedElement = element;
const codedHeadElement = htmlEncode(html)
sortedOrderDetails.innerHTML += `<div class="outerresults">
									<div class="visWeight">${viz} ${weight + 1}</div> 
									<div style="user-select: none;width:50px; min-width: 50px;height: 20px;  overflow: hidden;  white-space: nowrap;background-color:${validStyle}">${encodedElement}:</div>
									<code style="display:inline-block;overflow-wrap:anywhere; overflow: hidden; white-space:nowrap;" class="copyable Xlanguage-html">
									<span style="user-select: none;">	${validSign} </span>
									${codedHeadElement}
									</code>
								</div>`;
// sortedHead.appendChild(element.cloneNode(true));
});


sortedOrderDetails.innerHTML += `

	<div style="display:flex;flex-direction:row;gap:10px; font-size:12px; padding:10px;align-items: baseline;">	
		<span>Make whole 'sorted head elements' visible.</span> 
		<label>
			<input type="radio" name="overflowToggle" value="visible" onchange="showHideOverflowedText()">
			Yes
		</label>
		<label>
			<input type="radio" name="overflowToggle" value="hidden" onchange="showHideOverflowedText()">
			No
		</label>
  <div>
`;

 
 





const explain = document.createElement('div')
explain.innerHTML = ` <br><br>	<div class="explain">
<div class="explaintitle">Weights + Head elements:</div>
<div class="weight-10" style="color:#9e0142">Weight 11 - meta:is([charset], [http-equiv], [name=viewport]), base</div>
<div class="weight-9" style="color:#d53e4f">Weight 10 - title</div>
<div class="weight-8" style="color:#f46d43">Weight 9 - link[rel=preconnect]</div>
<div class="weight-7" style="color:#fdae61">Weight 8 - script[src][async]</div>
<div class="weight-6" style="color:#fee08b">Weight 7 - @import in CSS</div>
<div class="weight-5" style="color:#e6f598">Weight 6 - script:not([src][defer],[src][async],[type*=json])</div>
<div class="weight-4" style="color:#abdda4">Weight 5 - link[rel=stylesheet],style</div>
<div class="weight-3" style="color:#66c2a5">Weight 4 - link:is([rel=preload], [rel=modulepreload])</div>
<div class="weight-2" style="color:#3288bd">Weight 3 - script[src][defer]</div>
<div class="weight-1" style="color:#5e4fa2">Weight 2 - link:is([rel=prefetch], [rel=dns-prefetch], [rel=prerender])</div>
<div class="weight-0" style="color:#cccccc">Weight 1 - other</div>
</div>

<br><br>
<div class="explain">
<div class="explaintitle">Notes:</div>
<div class="explainnote">
					<div style="display:flex;flex-direction:row;gap:10px;">
							<div> 
								<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAACXBIWXMAAAsTAAALEwEAmpwYAAAALklEQVR4nGNgwAU+fPiQ/uHDh+sfPnxIQxa88fHjx/8gGlkwDaTy/fv3qTiNAwBunx9GP6YwMAAAAABJRU5ErkJggg==">
							</div> 
							<div>  	
								External stylesheets are downloaded and inlined in the results (&lt;link rel=stylesheet&gt; is converted into &lt;style&gt). 
						   		This is to test if there are '@import' includes in the CSS.
							</div>
					</div>
</div>

<div class="explainnote">
					<div style="display:flex;flex-direction:row;gap:10px;">
							<div> 
								<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAACXBIWXMAAAsTAAALEwEAmpwYAAAALklEQVR4nGNgwAU+fPiQ/uHDh+sfPnxIQxa88fHjx/8gGlkwDaTy/fv3qTiNAwBunx9GP6YwMAAAAABJRU5ErkJggg==">
							</div>
							<div>  
								If the results of the test contain 'link rel = stylesheets', these external stylesheets are probably are injected by scripts, 
						   		and cannot be converted/tested/prioritized automatically. 
						   		They are seen as normal CSS files. Check the content of the CSS manually if there are '@import' includes in them.
							</div>
					</div>
</div>
					
<div class="explainnote">
					<div style="display:flex;flex-direction:row;gap:10px;">
							<div> 
								<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAACXBIWXMAAAsTAAALEwEAmpwYAAAALklEQVR4nGNgwAU+fPiQ/uHDh+sfPnxIQxa88fHjx/8gGlkwDaTy/fv3qTiNAwBunx9GP6YwMAAAAABJRU5ErkJggg==">
							</div>
							 <div>	
								Scripts from tagmanagers and social media platforms can and may inject other head-elements ('origin trails', 'button.js', or styles).
							   	When trying to rearrange the elements in the head you might not see those elements. 
								Cookie consent managers can trigger the injecting of addional elements in the head. Perfhead can't accept cookie consent.  		
							</div>
					</div>
 </div>

 </div>
 
`



resultsContainer.appendChild(sortedOrderDetails);
resultsContainer.appendChild(explain);




			loadingVideo.style.display = 'none';
			form.classList.remove('disabled');
			urlInput.disabled = false;


// document.body.appendChild(resultsContainer);


 
	confetti({
	  particleCount: 10,
	  spread: 50,
	  origin: { y: 0.6 },
	  disableForReducedMotion: true
	});



}
	catch (error) {
        console.error('Fetch failed:', error);
		loadingVideo.style.display = 'none';

		
		
	

        // Assuming you have a div with id 'error' to show the error message
        const errorDiv = document.getElementById('error');
        errorDiv.innerHTML = `
		
		<div class="wrapper" style="padding: 40px">
		Hmnnnn, something went wrong. Please check the url you are testing, is it valid? Some websites may have rules in place which block automated test tools like this one.
		Invalid certificates can also cause an error. 
		</div>
		`;

		const form = document.querySelector('form');
		const urlInput = document.getElementById('url');

		errorDiv.classList.add('visible');

		form.classList.remove('disabled');
		urlInput.disabled = false;
	
	
	}
  

}







// window.onload = function() {
// logWeights();
// };


 
