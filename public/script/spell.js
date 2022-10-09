async function showSpell() {
    console.log('showSpell')
	window.location.href = '/#spell' 
    $(".connect-page").hide()
    $(".spell-page").show()
    $(".game-page").hide()
    $("body").css('background-image', '')
    $(".menu-spell").css('text-decoration', 'underline')
    $(".menu-brew").css('text-decoration', '')
    gamePhase = GamePhase.GAME
    console.log('GamePhase: GAME')
    // userAccount = '0x928c2909847B884ba5Dd473568De6382b028F7b8' //test chosen one
    updateCraftStatus()
}

function switchCraftStatus(target) {
	var craftStatus = [".craft-loading", ".craft-empty-page", "div.craft-activate-page", "div.craft-idle-page", "div.craft-claim-page"]
	for (c of craftStatus) {
		if (c != target) {
			$(c).hide()
		} else {
			$(c).show()
		}
	}
}

async function updateCraftStatus() {
    p_updateSpellList = updateSpellList()
    p_updatePotionList = updatePotionList()
	p_activated = gameContract.isApprovedForAll(userAccount, spellContractAddress)
	switchCraftStatus(".craft-loading")
	await Promise.all([p_updateSpellList, p_updatePotionList, p_activated])
	activated = await p_activated
	if ($(".spell-list").attr('quantity') == 0) {
		switchCraftStatus(".craft-empty-page")
		$(".craft-message").html('You don\'t have any spell books, find some <a target="_blank" class="label-text-light target="_blank" href="'+openSeaUrl+spellSlugName+'">HERE</a>.')
		return {code: 0, msg: 'no spell'}
	}
	if ($(".potion-list").attr('quantity') == 0) {
		switchCraftStatus(".craft-empty-page")
		$(".craft-message").html('You don\'t have any potion, find some <a target="_blank" class="label-text-light target="_blank" href="'+openSeaUrl+potionSlugName+'">HERE</a>.')
		return {code: 0, msg: 'no potion'}
	}
	if (!activated) {
		switchCraftStatus("div.craft-activate-page")
		$(".craft-message").html('Activate your magic circle and start crafting')
		return {code: 0, msg: 'not activated'}
	}
	console.log('activated')
    craftData = await spellContract.craftDataOf()
    potionId = parseInt(craftData[0])
    spellId = parseInt(craftData[1])
    startBlockNumber = parseInt(craftData[2])

    if (startBlockNumber == 0) {
    	console.log('spell idle')
    	switchCraftStatus("div.craft-idle-page")
    	$(".craft-idle-page").attr('status', 'empty')
    	$(".craft-message").text('Please select a SPELL on the RIGHT side.')
		return {code: 0, msg: 'nothing is crafting'}
    }

  	console.log('spell crafting')
  	newBookType = parseInt(craftData[3])
	newSpellType = parseInt(craftData[4])
  	newSpellLevel = parseInt(craftData[5])

	switchCraftStatus("div.craft-claim-page")
	potion = $("img.potion[token-id="+potionId+"]:first")
	spell = $("img.spell[token-id="+spellId+"]:first")

	console.log(potion, spell, spellId, potionId)

	$(".craft-spell-col").append(spell.clone())
	$(".craft-potion-col").append(potion.clone())

	res = await fetch('.netlify/functions/spellbook-image-future?spell='+newBookType+'-'+newSpellType+'-'+newSpellLevel)
	svgText = await res.text()
	// console.log(svgText)
	newSpellItem = $(svgText)
	$(".craft-result-col").append(newSpellItem)
	$(".craft-message").text('')
	
	blockNumber = await provider.getBlockNumber()
	timeForUpgrade = 900 //TEST PROD 900
	if (blockNumber - startBlockNumber >= timeForUpgrade) {
		$("button.upgrade").show()
		newSpellItem.attr('class', 'ready')
	} else {
		timeLeft = parseInt((timeForUpgrade - (blockNumber - startBlockNumber))*13 / 60)
		hrLeft = parseInt(timeLeft / 60)
		if (hrLeft > 0) {
			prompt = 'You can claim in ' + hrLeft + ' hrs'
		} else {
			prompt = timeLeft > 0 ? 'You can claim in ' + timeLeft + ' min' : 'You can claim in less than 1 min'
		}
		$(".craft-message").text(prompt)
	}
}

async function updateSpellList(retry) {
	if (!retry) {
		retry = 3
	}
	url = fetchAsssetUrl + '?' +
	    'owner=' + userAccount + '&' +
	    'contractAddresses[]=' + spellContractAddress + '&'
	url += 'withMetadata=true'
	console.log('spell request url ', url)
	var status
	var response
	p_spellResult = fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        response = jsonResponse
	        globalTest = response
	        console.log(response)
			$(".spell-list").empty()
			$(".spell-list").attr('quantity', response.ownedNfts.length)
			$('.spell-title').text('Your Spell' + ' (' + response.ownedNfts.length +')')
			console.log(response.ownedNfts)
			console.log(response.ownedNfts.length)
			for (spell of response.ownedNfts) {
				// console.log(spell)
				item = SpellItemTemplate.clone()
				item.attr('token-id', parseInt(spell.id.tokenId))
				itemIpfs = spell.metadata.image
				console.log(itemIpfs)
				itemData = (itemIpfs.split("/")[itemIpfs.split("/").length-1]).split(".")[0].split("-")
				item.attr('bookType', itemData[0] )
				item.attr('spellType', itemData[1] )
				item.attr('spellLevel', itemData[2] )
				item.attr('title', 'Lv.' + itemData[2] + ' ' + spell.title )
				raw = spell.media[0].raw
				if (raw.indexOf('http://') == 0 || raw.indexOf('https://') == 0) {
					src = raw
				} else if (raw.indexOf('ipfs://') == 0){
					raw = raw.split('ipfs://')[1]
					src = 'https://potion.mypinata.cloud/ipfs/' + raw
				}
				item.attr('src', src )
				item.on('click', function () {
					console.log($(this).attr('token-id'))
					console.log($(this).attr('title'))
					addSpell($(this))
				})
				$(".spell-list").append(item)
			}
			if (response.ownedNfts.length < 20) {
				emptyItem = 20 - response.ownedNfts.length
				while (emptyItem > 0) {
					item = SpellItemTemplate.clone()
					$(".spell-list").append(item)
					emptyItem --
				}
			}
	    })
	    .catch((err) => {
	        console.error(err);
	        console.log('err spell retry remains ', retry)
	        retry --
	        if (retry > 0) {
				updateSpellList(retry)
	        }
	    })
	await p_spellResult
}

async function activate() {
    console.log('activate...')
    $('button.activate').text('Activating...')
    try {
        tx = await gameContract.setApprovalForAll(spellContractAddress, true)
    } catch (e) {
       	$('button.activate').text('Activate')
        if (e.code == 4001) {
            showToastMessage('Activate Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Activate error: ', e)
            msg += 'Sending transaction errer.' + '<br/>'
            msg += globalTest.error.message
            return {'code': -1, 'msg': msg}
        }
    }
    if (env == ENV.TEST) {
        url = 'https://rinkeby.etherscan.io/tx/' + tx['hash']
    } else {
        url = 'https://etherscan.io/tx/' + tx['hash']
    }
    showToastMessage('Mutant Potion', '', 'Transaction sent, waiting for confirmation...<br/>' + 'If it takes too long, check your <a href='+url+' target="_blank">transaction here</a>.', 15000)
    r = await provider.waitForTransaction(tx['hash'])
    console.log('Activate result: ', r)
    showToastMessage('Mutant Potion', '', 'Spell Ready!')
    updateCraftStatus()
    return {'code': 0, 'msg': 'Spell ready'}
}


async function clearSpellResult() {
	emptyResult = $(".craft-result-col > img.empty:first").clone().show()
	$(".craft-result-col").empty()
	$(".craft-result-col").append(emptyResult)
}

async function clearPotionResult() {
	emptyResult = $(".craft-potion-col > img.empty:first").clone().show()
	$(".craft-potion-col").empty()
	$(".craft-potion-col").append(emptyResult)
}



async function addSpell(spell) {
	if ($(".craft-idle-page").attr('status') != 'empty') {
		console.log('spell already selected')
		return
	}

	$(".craft-idle-page").attr('status', 'spell')

	item = spell.clone()
	item.on('click', function () {
		console.log('click spell ', $(this))
		$(this).remove()
		$(".craft-spell-col > img").show()
		clearPotionResult()
		clearSpellResult()
    	$(".craft-idle-page").attr('status', 'empty')
    	$(".craft-message").text('Please select a SPELL on the RIGHT side.')
		$("button.craft").hide()

	});
	$(".craft-spell-col > img").hide()
	$(".craft-spell-col").append(item)

	bookType = parseInt(spell.attr('bookType'))
	spellType = parseInt(spell.attr('spellType'))
	spellLevel = parseInt(spell.attr('spellLevel'))

	if (bookType == 0) {
		$(".craft-message").text('Please select Lv.1 POTION on the LEFT side.')
	} else {
		$(".craft-message").text('Please select Lv.'+(spellLevel+2)+' POTION on the LEFT side.')
	}
}

async function addPotion(potion) {
	if ($(".craft-idle-page").attr('status') != 'spell') {
		console.log('not ready to add potion, status is not spell')
		return
	}

	bookType = parseInt($(".craft-spell-col > img:visible").attr('bookType'))
	spellType = parseInt($(".craft-spell-col > img:visible").attr('spellType'))
	spellLevel = parseInt($(".craft-spell-col > img:visible").attr('spellLevel'))

	potionType = parseInt(potion.attr('type'))
	potionLevel = parseInt(potion.attr('level'))

	console.log('bookType, spellType, spellLevel, potionType, potionLevel')
	console.log(bookType, spellType, spellLevel, potionType, potionLevel)

	if (bookType == 0) {
		if (potionLevel == 1) {
			newBookType = potionType
			newSpellType = 0
			newSpellLevel = 0
		} else {
			console.log('potion is not lv.1')
			return			
		}
	} else {
		if (spellLevel + 2 != potionLevel) {
			console.log('potion level invalid')
			return
		}
		newBookType = bookType
		if (spellLevel == 0) {
			newSpellType = potionType
			newSpellLevel = 1
		} else if (spellType == potionType || potionLevel == 4){
			newSpellType = spellType
			newSpellLevel = spellLevel + 1
		} else {
			newSpellType = potionType
			newSpellLevel = spellLevel
		}
	}


	$(".craft-idle-page").attr('status', 'potion')

	item = potion.clone()
	item.attr('msg', $(".craft-message:first").text())
	item.on('click', function () {
		text = $(this).attr('msg')
		console.log('click potion ', $(this))
		$(this).remove()
		clearPotionResult()
		clearSpellResult()
    	$(".craft-idle-page").attr('status', 'spell')
    	$(".craft-message").text(text)
		$("button.craft").hide()
	});
	$(".craft-potion-col > img").hide()
	$(".craft-potion-col").append(item)

	//update big potion result
	res = await fetch('.netlify/functions/spellbook-image-future?spell='+newBookType+'-'+newSpellType+'-'+newSpellLevel)
	svgText = await res.text()
	// console.log(svgText)
	$(".craft-result-col > img").hide()
	$(".craft-result-col").append($(svgText))

	$(".craft-message").text('')
	$("button.craft").show()
}

async function craft() {
	console.log('craft')
	potion = $(".craft-potion-col > img:visible")
	potionLevel = parseInt(potion.attr('level'))
	potionType = parseInt(potion.attr('type'))
	potionId = parseInt(potion.attr('token-id'))

	spell = $(".craft-spell-col > img:visible")
	spellBookType = parseInt(spell.attr('bookType'))
	spellSpellType = parseInt(spell.attr('spellLevel'))
	spellSpellLevel = parseInt(spell.attr('spellType'))
	spellId = parseInt(spell.attr('token-id'))

	result = await sendCraftTx(potionId, spellId)
	if (result.code == 0) {
		setTimeout( function() {
			window.location.href = '/#spell' 
			location.reload()
		}, 5000)
	}
}

async function sendCraftTx(potionId, spellId) {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    console.log('craft ', potionId, spellId)
	$("button.craft").text("Crafting...")
    msg = ''
    try {
        tx = await spellContract.craft(potionId, spellId)
    } catch (e) {
    	$("button.craft").text("Craft New Spell")
        if (e.code == 4001) {
            showToastMessage('Craft Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Craft error: ', e)
            msg += 'Sending transaction errer.' + '<br/>'
            msg += globalTest.error.message
            return {'code': -1, 'msg': msg}
        }
    }
    if (env == ENV.TEST) {
        url = 'https://rinkeby.etherscan.io/tx/' + tx['hash']
    } else {
        url = 'https://etherscan.io/tx/' + tx['hash']
    }
    showToastMessage('Mutant Potion', '', 'Transaction sent, waiting for confirmation...<br/>' + 'If it takes too long, check your <a href='+url+' target="_blank">transaction here</a>.', 15000)
    r = await provider.waitForTransaction(tx['hash'])
    console.log('Craft result: ', r)
    showToastMessage('Mutant Potion', '', 'Craft Success!<br/>Refresh in 5 seconds...')
    return {
        'code': 0,
        'msg': 'Craft Success!',
    }
}

async function upgradeFree() { 
	$('button.upgrade.free').text('Upgrading...')
	result = await upgrade('free')
	if (result.code == 0){
		//TODO WIN
	} else {
		$('button.upgrade.free').text('Upgrade with Potion (FREE)')
	}
}
async function upgradePaid() {
	$('button.upgrade.paid').text('Upgrading...')
	result = await upgrade('paid')
	if (result.code == 0){
		//TODO WIN
	} else {
		$('button.upgrade.paid').text('Upgrade & Keep Potion (0.0069e)')
	}
	
}

async function upgrade(mode) {
	upgradeFee = (mode == 'free') ? '0' : '0.0069'
	console.log(upgradeFee)
	value = { value: Web3.utils.toWei(upgradeFee,'ether')}
	result = await sendUpgradeTx(value)
	return result
}

async function sendUpgradeTx(value) {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    console.log('sendUpgradeTx')
    msg = ''

    try {
        tx = await spellContract.claim(value)
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Upgrade Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Upgrade error: ', e)
            msg += 'Sending transaction errer.' + '<br/>'
            msg += globalTest.error.message
            return {'code': -1, 'msg': msg}
        }
    }
    if (env == ENV.TEST) {
        url = 'https://rinkeby.etherscan.io/tx/' + tx['hash']
    } else {
        url = 'https://etherscan.io/tx/' + tx['hash']
    }
    showToastMessage('Mutant Potion', '', 'Transaction sent, waiting for confirmation...<br/>' + 'If it takes too long, check your <a href='+url+' target="_blank">transaction here</a>.', 15000)
    r = await provider.waitForTransaction(tx['hash'])
    console.log('Upgrade result: ', r)
    showToastMessage('Upgrade Spell', '', 'Upgrade Success!<br/>Refresh in 5 seconds...')
    spellId = $('.craft-spell-col > img.spell:visible').attr('token-id')
    console.log('refresh spell with id ', spellId)
    refreshOpenSeaSpell(spellId)
    refreshAlchemySpell(spellId)
	setTimeout( function() {
		window.location.href = '/#spell' 
		location.reload()
	}, 5000)
    return {'code': 0,'msg': 'Upgrade Success!',}
}

async function refreshOpenSeaSpell(tokenId) {
	if (env == ENV.TEST) {
		url = '/.netlify/functions/opensea-update-token-test?contractAddress='+spellContractAddress+'&tokenId=' + tokenId
	} else {
		url = '/.netlify/functions/opensea-update-token?contractAddress='+spellContractAddress+'&tokenId=' + tokenId
	}
	console.log('refresh OS spell token '+tokenId+' calling opensea-update-token url: ', url)
	fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        response = jsonResponse
	        console.log('refresh result', tokenId, response)
	    })
	    .catch((err) => {
	        console.error('refresh failed', tokenId, err)
	    })
}

async function refreshAlchemySpell(tokenId) {
	if (env == ENV.TEST) {
		url = '/.netlify/functions/alchemy-update-token-test?contractAddress='+spellContractAddress+'&tokenId=' + tokenId + '&refreshCache=true'
	} else {
		url = '/.netlify/functions/alchemy-update-token?contractAddress='+spellContractAddress+'&tokenId=' + tokenId + '&refreshCache=true'
	}
	console.log('refresh Alchemy spell token '+tokenId+' calling alchemy-update-token url: ', url)
	fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        response = jsonResponse
	        console.log('refresh alchemy spell result', response)
	    })
	    .catch((err) => {
	        console.error('refresh collection failed', err)
	    })
}

async function cancelUpgrade() {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    console.log('cancel upgrade')
    msg = ''

    try {
        tx = await spellContract.cancel()
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Craft Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Craft error: ', e)
            msg += 'Sending transaction errer.' + '<br/>'
            msg += globalTest.error.message
            return {'code': -1, 'msg': msg}
        }
    }
    if (env == ENV.TEST) {
        url = 'https://rinkeby.etherscan.io/tx/' + tx['hash']
    } else {
        url = 'https://etherscan.io/tx/' + tx['hash']
    }
    showToastMessage('Mutant Potion', '', 'Transaction sent, waiting for confirmation...<br/>' + 'If it takes too long, check your <a href='+url+' target="_blank">transaction here</a>.', 15000)
    r = await provider.waitForTransaction(tx['hash'])
    console.log('Cancel upgrade result: ', r)
    showToastMessage('Mutant Potion', '', 'Upgrade Cancelled!<br/>Refresh in 5 seconds...')
	setTimeout( function() {
		window.location.href = '/#spell' 
		location.reload()
	}, 5000)
    return {'code': 0,'msg': 'Brewing Cancelled!',}
}