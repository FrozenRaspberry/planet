function sharePlanet(tokenId) {
	text =	'@MergingGalaxy is a space of extinction, and my planet will be the last one standing🪐%0A'
	text += openSeaAssetUrl + gameContractAddress + '/' + playerTokenId

	url = "https://twitter.com/intent/tweet?text=" + text
	window.open(url, '_blank').focus();
}

function shareForDrop() {
	text =	'Own your planet and be the last one standing in @MergingGalaxy 🪐%0A'
	text += 'Tag two REAL friends to win a drop chance! %0A'
	text += websiteUrl
	
	url = "https://twitter.com/intent/tweet?text=" + text
	window.open(url, '_blank').focus();
}