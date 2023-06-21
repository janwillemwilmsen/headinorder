




const LOGGING_PREFIX = 'Capo: ';
 


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

 
 

function visualizeWeight(weight) {
return `<span class="weight-${weight + 1}">${new Array(weight + 1).fill('█').join('')}</span>`;
}

function visualizeWeights(weights) {
// weights is an array of objects, so you can destructure each object in the map function
const visual = weights.map(({ weight }) => `<span style="padding:0px;margin:0;" class="weight-${weight +1}">${"█"}</span>`).join('');
return visual;
}

function visualizeSortedWeights(weights) {
const visual = weights.map(weight => `<span class="weight-${weight +1}">${"█"}</span>`).join('');
return visual;
}

function htmlEncode(str){
return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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



const actualOrderDetails = document.createElement('details');
const actualOrderSummary = document.createElement('summary');
actualOrderSummary.innerHTML = `<span class="summaryText">${LOGGING_PREFIX} Actual &lt;head&gt; order</span>`;
const actualVizSpan = document.createElement('span');
actualVizSpan.classList = 'barItems'
actualVizSpan.innerHTML = `<br>${actualViz}`;
actualOrderSummary.appendChild(actualVizSpan);

actualOrderDetails.innerHTML += `<p class="detailsText">Actual &lt;head&gt; element ${document.head.innerHTML}</p>`;
actualOrderDetails.appendChild(actualOrderSummary);
//   actualOrderDetails.innerHTML += `<pre>${actualViz}</pre>`;
headWeights.forEach(({element, weight, html}) => {
	console.log('ELEMENT -->',element)
const viz = visualizeWeight(weight);
// const encodedElement = htmlEncode(element.outerHTML);
const encodedElement = element;

const codedHeadElement = htmlEncode(html)
 
actualOrderDetails.innerHTML += `<div class="outerresults">
									<div style="min-width:200px;">${viz} ${weight + 1}</div> 
									<div style="min-width:100px;"> 	${encodedElement}: </div>
							  		<code style="display:inline-block;overflow-wrap: anywhere;" class="Xlanguage-html">
									
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
sortedWeights.forEach(({element, weight, html}) => {
const viz = visualizeWeight(weight);
 const encodedElement = element;
const codedHeadElement = htmlEncode(html)
sortedOrderDetails.innerHTML += `<div class="outerresults">
										<div style="min-width:200px;">${viz} ${weight + 1}</div> 
										<div style="min-width:100px;">${encodedElement}:</div>
							  			<code style="display:inline-block;overflow-wrap:anywhere;" class="Xlanguage-html">
											
											${codedHeadElement}
										</code>
								 </div>`;
// sortedHead.appendChild(element.cloneNode(true));
});




const explain = document.createElement('div')
explain.innerHTML = ` <br><br>	<div class="explain">
<div class="explaintitle">Weights + Head elements:</div>
<div class="weight-10" style="color:#9e0142">Weight 11 - meta:is([charset], [http-equiv], [name=viewport])</div>
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
<div class="explainnote">- External stylesheets are downloaded and inlined in the results. This is to test if there are '@import' includes in the file.</div>
<div class="explainnote">- If there are external 'link rel = stylesheets' loaded they probably are injected by scripts. Check manually if there are @import in them.</div>
<div class="explainnote">- Script from tagmanagers and social media platforms can inject other head-elements ('origin trails', or 'button.js').</div>
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


 
