console.log('loaded')

async function updatePlanetRankList() {
	planetRankList = await fetchRankList()
	if (!planetRankList) {
		throw 'get rank list error'
	}
	console.log('Rank List Loaded', planetRankList)
	if (planetRankList.length == 0) {
		$('.planet-rank-list-group').html('<p class="label-text">Rank list is empty.<br>Merge & Level up!<br>Be the first one on list.</p>') 
		return
	}
	rankLen = Math.min(planetRankList.length, 4)
	for (i=0; i<rankLen; i++) {
		rank = parseInt(i) + 1
		updatePlanetAtRank(rank, planetRankList[i].id, planetRankList[i].size)
	}
}

async function fetchRankList(retry) {
	if (!retry) {
		retry = 1 
	}
	url = commonFetchUrl + '?' + rankListUrl
	// console.log('common fetch', url)
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
	rankListResult = fetchResult['planetRankList']
	return rankListResult
}

async function updatePlanetAtRank(rank, tokenId, refSize) {
	//Load Planet Data
	console.log('load planet at rank', rank, 'id', tokenId, 'ref size is', refSize)
	var planetLv, planetType, planetName, planetSize, planetOwnerName, planetOwnerAddress
    p_planetLv = gameContract.levelOf(tokenId)
    p_planetLv.then((r) => {
        planetLv = parseInt(r)
        // console.log('planetLv: ', planetLv)
    })
    p_planetSize = gameContract.sizeOf(tokenId)
    p_planetSize.then((r) => {
        planetSize = parseInt(r)
    })
    p_planetName = gameContract.nameOf(tokenId)
    p_planetName.then((r) => {
        planetName = r
		if (planetName == '') {
			planetName = 'Planet #' + tokenId.toString()
		} else {
			planetName = planetName + ' #' + tokenId
		}
    })
    p_planetType = gameContract.typeOf(tokenId)
    p_planetType.then((r) => {
        planetType = parseInt(r)
    })
    p_ownerAddress = gameContract.ownerOf(tokenId)
    p_ownerAddress.then((r) => {
        planetOwnerAddress = r
    })

    await p_ownerAddress
    p_planetOwnerName = provider.lookupAddress(planetOwnerAddress)
    p_planetOwnerName.then((r) => {
    	if (r) {
    		planetOwnerName = r
    	} else {
    		planetOwnerName = planetOwnerAddress.slice(0, 6) + '...' + planetOwnerAddress.slice(-4)	
    	}
    })

    Promise.all([p_planetLv, p_planetSize, p_planetName, p_planetType, p_planetOwnerName]).then((values) => {
    	console.log('load planet rank', rank, 'complete. Id', tokenId, 'Lv', planetLv, 'Size', planetSize, 'Name', planetName, 'Type', planetType, 'owner', planetOwnerAddress, 'ownerName', planetOwnerName)
		// Display Planet
		displayPlanet(rank, planetName, planetLv, planetOwnerName, planetSize, planetType, tokenId)
    })

}

function displayPlanet(rank, planetName, planetLv, planetOwnerName, planetSize, planetType, tokenId) {
	console.log('displayPlanet',rank, planetName, planetLv, planetOwnerName, planetSize, planetType, tokenId)
    var currentPlanet = planetRankListElement[rank - 1]
    currentPlanet.find('.rank-text').text('Rank ' + rank.toString())
	if (planetLv == 0) {
		currentPlanet.find('img').attr('src', 'img/planet/' + planetType + '-' + planetLv + '-' + (tokenId % 3 + 1) + '.gif')
	} else {
		currentPlanet.find('img').attr('src', 'img/planet/' + planetType + '-' + planetLv + '.gif')		
	}
	currentPlanet.find('div.name-text').text(planetName)
	currentPlanet.find('div.owner-text').text('Owner: ' + planetOwnerName)
	currentPlanet.find('div.mass-text').text('Level: '+ planetLv.toString() + '   Mass: ' + planetSize.toString())
	currentPlanet.show()
}