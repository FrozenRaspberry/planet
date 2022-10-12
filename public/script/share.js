function sharePlanet(tokenId) {
	text =	'@MergingGalaxy is a space of extinction, and my planet will be the last one standing🪐%0A'
	text += openSeaAssetUrl + gameContractAddress + '/' + playerTokenId

	url = "https://twitter.com/intent/tweet?text=" + text
	window.open(url, '_blank').focus();
}

function shareForDrop() {
	text =	'@MergingGalaxy is a space of extinction, own your planet and be the last one standing🪐%0A'
	text += websiteUrl
	
	url = "https://twitter.com/intent/tweet?text=" + text
	window.open(url, '_blank').focus();
}