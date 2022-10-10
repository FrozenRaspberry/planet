async function updatePlanetRankList() {
	planetRankList = await fetchRankList()
	if (!planetRankList) {
		throw 'get rank list error'
	}
	console.log('Rank List Loaded', planetRankList)
	for (i in planetRankList) {
		rank = parseInt(i) + 1
		loadPlanetAtRank(rank, planetRankList[i].id, planetRankList[i].level)
	}
}

async function fetchRankList(retry) {
	if (!retry) {
		retry = 1 
	}
	url = commonFetchUrl + '?' + rankListUrl
	console.log('common fetch', url)
	var status
	var response
	fetchResult = await fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        return jsonResponse
	    })
	    .catch((err) => {
	        console.error(err);
	        console.log('err retry remains ', retry)
	        retry --
	        if (retry > 0) {
				fetchRankList(retry)
	        }
	    })
	return fetchResult
}

async function loadPlanetAtRank(rank, tokenId, refLevel) {
	console.log('load planet at rank', rank, 'id', tokenId, 'ref level is', refLevel)
	//load planet name
	//load owner await provider.lookupAddress("0x12c012d2bf99de146c6c7465b81647abc56c9110");
	//load mass
}