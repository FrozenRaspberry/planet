async function showPlayerPlanet() {
	if (playerTokenLv == 0) {
		$('img.player-planet').attr('src', 'img/planet/' + playerTokenType + '-' + playerTokenLv + '-' + (playerTokenId % 3 + 1) + '.gif')
	} else {
		$('img.player-planet').attr('src', 'img/planet/' + playerTokenType + '-' + playerTokenLv + '.gif')		
	}
	$('div.player-planet-lv').text('level: ' + playerTokenLv) 
	$('div.player-planet-size').text('Mass: ' + playerTokenSize)
	$('div.player-planet-name').text(getPlayerPlanetName()) 
}

function getPlayerPlanetName() {
	if (playerTokenName == '') {
		return 'Planet #' + playerTokenId
	} else {
		return playerTokenName + ' #' + playerTokenId
	}
}

async function rule() {
	$('#ruleModal').modal('toggle')
}