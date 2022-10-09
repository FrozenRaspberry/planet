async function showBrew() {
    console.log('showBrew')
	window.location.href = '/#potion'
    $(".connect-page").hide()
    $(".spell-page").hide()
    $(".game-page").show()
    $("body").css('background-image', 'url("../img/bowl-bg.png")')
    $(".menu-brew").css('text-decoration', 'underline')
    $(".menu-spell").css('text-decoration', '')
    gamePhase = GamePhase.GAME
    console.log('GamePhase: GAME')
    // userAccount = '0x928c2909847B884ba5Dd473568De6382b028F7b8' //test chosen one
    updateArtifactList()
    await updatePotionList()
    updateBrewStatus()
}

async function updatePotionList(retry) {
	if (!retry) {
		retry = 3
	}
	url = fetchAsssetUrl + '?' +
	    'owner=' + userAccount + '&' +
	    'contractAddresses[]=' + gameContractAddress + '&'
	url += 'withMetadata=true'
	// console.log('potion request url ', url)
	var status
	var response
	p_potionResult = fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        response = jsonResponse
	        globalTest = response
	        console.log(response)
			$(".potion-list").empty()
			$(".potion-list").attr('quantity', response.ownedNfts.length)
			$('.potion-title').text('Your Potion' + ' (' + response.ownedNfts.length +')')
			for (potion of response.ownedNfts) {
				// console.log(potion)
				item = PotionItemTemplate.clone()
				item.attr('token-id', parseInt(potion.id.tokenId))
				itemIpfs = potion.metadata.image
				itemData = (itemIpfs.split("/")[itemIpfs.split("/").length-1]).split(".")[0].split("-")
				item.attr('level', itemData[1] )
				item.attr('type', itemData[0] )
				item.attr('title', 'Lv.' + itemData[1] + ' ' + potion.title )
				raw = potion.media[0].raw
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
					if ($(".game-page").is(":visible")){
						addIngredient($(this))
					} else {
						addPotion($(this))
					}
				})
				$(".potion-list").append(item)
			}
			if (response.ownedNfts.length < 20) {
				emptyItem = 20 - response.ownedNfts.length
				while (emptyItem > 0) {
					item = PotionItemTemplate.clone()
					$(".potion-list").append(item)
					emptyItem --
				}
			}
			if (response.ownedNfts.length < 2) {
				$(".brew-text.title").text("You need more potion")
				$(".brew-text.prompt").html('Find potion on <a class="label-text-light" target="_blank" href="https://opensea.io/collection/mutant-potion">OpenSea</a>')
				$(".ingredient").empty()
			} else {
				$(".brew-text.title").html("Select Your Potion<br/>And Start Brewing")
				$(".brew-text.prompt").html('')
				$(".ingredient").empty()		
			}
	    })
	    .catch((err) => {
	        console.error(err);
	        console.log('err potion retry remains ', retry)
	        retry --
	        if (retry > 0) {
				updatePotionList(retry)
	        }
	    })
	await p_potionResult
}

async function updateArtifactList(retry) {
	if (!retry) {
		retry = 3
	}
	url = fetchAsssetUrl + '?' + 'owner=' + userAccount + '&' 
	for (contract of chosenContractList) {
		url += 'contractAddresses[]=' + contract + '&'
	}
	url += 'withMetadata=true'
	// console.log('artifact request url ', url)
	p_artifactResult = fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        response = jsonResponse
	        $(".artifact-list").empty()

	        if (response.ownedNfts.length == 0) {
	        	$('.artifact-title').html('<p class="label-text artifact-title">Your Artifacts <a href="'+openSeaUrl+cosmosSlugName+'" target="_blank" class="label-text">[BUY]</a></p>')
	        } else {
		        $('.artifact-title').text('Your Artifacts' + ' (' + response.ownedNfts.length +')')
	        }
			for (artifact of response.ownedNfts) {
				// console.log(artifact)
				item = ArtifactItemTemplate.clone()
				item.attr('token-id', parseInt(artifact.id.tokenId))
				item.attr('title', artifact.title )
				item.attr('contract-address', artifact.contract.address )
				raw = artifact.media[0].raw
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
					addArtifact($(this))
				})
				$(".artifact-list").append(item)
			}
			if (response.ownedNfts.length < 20) {
				emptyItem = 20 - response.ownedNfts.length
				while (emptyItem > 0) {
					item = ArtifactItemTemplate.clone()
					$(".artifact-list").append(item)
					emptyItem --
				}
			}
	    })
	    .catch((err) => {
	        console.error(err)
	        console.log('err artifact retry remains ', retry)
	        retry --
	        if (retry > 0) {
				updateArtifactList(retry)
	        }
	    })
}

async function updateBrewStatus() {
	$(".brew-loading").show()
	$("div.brew").hide()
	$("div.brewing").hide()

    brewData = await gameContract.brewDataOf()
    potionAid = parseInt(brewData[0])
    potionBid = parseInt(brewData[1])
    artifact = brewData[2]
    startBlockNumber = parseInt(brewData[3])

	// startBlockNumber = 0//test status

    if (startBlockNumber == 0) {
    	console.log('startBlockNumber is 0, not brewing')
    	$("div.brew").show()
		$(".brew-loading").hide()
		return
    } else {
		$(".brew-loading").hide()
    	$("div.brewing").show()
    	$(".brewing-ingredient").empty()
    	potionA = $(".potion-list>img.potion[token-id="+ potionAid +"]:first").clone()
    	console.log('item', potionA)
    	$(".brewing-ingredient").append(potionA)
    	potionB = $(".potion-list>img.potion[token-id="+ potionBid +"]:first").clone()
    	console.log('item', potionB)
    	$(".brewing-ingredient").append(potionB)
    }
    blockNumber = await provider.getBlockNumber()
	potionALevel = parseInt(potionA.attr('level'))
    if (potionALevel == 1) {
    	if (blockNumber - startBlockNumber >= 300) {
    		$("button.claim").show()
    		$(".brewing-text.prompt").text('')
    	} else {
    		timeLeft = parseInt((300 - (blockNumber - startBlockNumber))*13 / 60)
    		prompt = timeLeft > 0 ? 'You can claim in ' + timeLeft + ' min' : 'You can claim in less than 1 min'
    		$(".brewing-text.prompt").text(prompt)
    	}
    } else if ( potionALevel == 2) {
    	if (blockNumber - startBlockNumber >= 3600) {
    		$("button.claim").show()
       		$(".brewing-text.prompt").text('')
    	} else {
    		timeLeft = parseInt((3600 - (blockNumber - startBlockNumber))*13 / 60)
    		hrLeft = parseInt(timeLeft / 60)
    		if (hrLeft > 0) {
    			prompt = 'You can claim in ' + hrLeft + ' hrs'
    		} else {
				prompt = timeLeft > 0 ? 'You can claim in ' + timeLeft + ' min' : 'You can claim in less than 1 min'
    		}
    		$(".brewing-text.prompt").text(prompt)
    	}
    } else if ( potionALevel == 3) {
    	if (blockNumber - startBlockNumber >= 7200) {
    		$("button.claim").show()
    		$(".brewing-text.prompt").text('')
    	} else {
    		timeLeft = parseInt((3600 - (blockNumber - startBlockNumber))*13 / 60)
    		hrLeft = parseInt(timeLeft / 60)
    		if (hrLeft > 0) {
    			prompt = 'You can claim in ' + hrLeft + ' hrs'
    		} else {
				prompt = timeLeft > 0 ? 'You can claim in ' + timeLeft + ' min' : 'You can claim in less than 1 min'
    		}
    		$(".brewing-text.prompt").text(prompt)
    	}
    }
}

async function addIngredient(potion) {
	if ($("div.potion.ingredient").children().length < 2) {
		if ($("div.potion.ingredient").children().length == 1) {
			if ($("div.potion.ingredient").children().attr('token-id') == potion.attr('token-id')) {
				console.log('same potion')
				return
			}
		}
		item = potion.clone()
		item.on('click', function () {
			console.log('click ingredient ', $(this))
			$(this).remove()
			$(".brew-text.prompt").text('')
			$("button.brew").hide()
			$("div.artifact-ingredient").hide()
		});
		$("div.potion.ingredient").append(item)
	}

	if ($("div.potion.ingredient").children().length == 2) {
		potion1 = $("div.potion.ingredient").children().eq(0)
		potion1Level = parseInt(potion1.attr('level'))
		potion1Type = parseInt(potion1.attr('type'))
		potion2 = $("div.potion.ingredient").children().eq(1)
		potion2Level = parseInt(potion2.attr('level'))
		potion2Type = parseInt(potion2.attr('type'))

		// potion1Level = 3//test potion level2

		if (potion1Level == 1) {
			if (potion2Level != 1) {
				$(".brew-text.prompt").text('You need 2 potion with the same LEVEL')
			} else if (potion1Type != potion2Type) {
				$(".brew-text.prompt").text('You need 2 potion with the same TYPE')
			} else {
				$("button.brew").show()
			}
		} else if (potion1Level == 2) {
			if (potion2Level != 2) {
				$(".brew-text.prompt").text('You need 2 potion with the same LEVEL')
			} else if (potion1Type != potion2Type) {
				$(".brew-text.prompt").text('You need 2 potion with the same TYPE')
			} else {
				$("div.artifact-ingredient").show()
				$(".brew-text.prompt").text('Select Your Artifact')
			}
		} else if (potion1Level == 3) {
            if (potion2Level != 3) {
                $(".brew-text.prompt").text('You need 2 potion with the same LEVEL')
            } else if (potion1Type == 1 && potion2Type != 2 || potion1Type == 2 && potion2Type != 1) {
                $(".brew-text.prompt").text("Try another receipe")
            } else if (potion1Type == 3 && potion2Type != 4 || potion1Type == 4 && potion2Type != 3) {
                $(".brew-text.prompt").text("Try another receipe")
            } else if (potion1Type == 5 && potion2Type != 6 || potion1Type == 6 && potion2Type != 5) {
                $(".brew-text.prompt").text("Try another receipe")
            } else {
                $("div.artifact-ingredient").show()
                $(".brew-text.prompt").text('Select Your Artifact')
            }
		} else if (potion1Level == 4) {
			$(".brew-text.prompt").text("Can't brew top level potion")
		}
	}
}

async function addArtifact(artifact) {
	if ($("div.artifact-ingredient").is(":visible")) {
		item = artifact.clone()
		item.on('click', function () {
			console.log('click artifact ', $(this))
			emptyItem = $('<img class="artifact" src="img/artifact-border-img.png"></img>')
			$(this).replaceWith(emptyItem)
			$("button.brew").hide()
		});
		$("div.artifact-ingredient").empty()
		$("div.artifact-ingredient").append(item)
		$("button.brew").show()
	}
}


async function brew() {
	if ($(".potion.ingredient").children().length == 2) {
		potion1 = $(".potion.ingredient").children().eq(0)
		potion1Level = parseInt(potion1.attr('level'))
		potion1Type = parseInt(potion1.attr('type'))
		potion2 = $(".potion.ingredient").children().eq(1)
		potion2Level = parseInt(potion2.attr('level'))
		potion2Type = parseInt(potion2.attr('type'))

		// potion1Level = 3//test potion level 2

		if (potion1Level == 1 && potion2Level == 1 && potion1Type == potion2Type) {
			$("button.brew").text('Brewing...')
			sendBrewTx(false, potion1.attr('token-id'), potion2.attr('token-id'), chosenContractList[0]).then((r)=>{
				if (r.code == 0) {
					$("button.brew").hide()
					$(".brew-text.prompt").text('Success!')
				} else {
					$("button.brew").text('Brew')
				}
	        })
		} else if (potion1Level >= 2 && potion2Level >= 2) {
			$("button.brew").text('Brewing...')
			artifactAddress = $(".artifact-ingredient>img").attr('contract-address')
			sendBrewTx(true, potion1.attr('token-id'), potion2.attr('token-id'), artifactAddress).then((r)=>{
				if (r.code == 0) {
					$("button.brew").hide()
					$(".brew-text.prompt").text('Success!')
				} else {
					$("button.brew").text('Brew')
				}
	        })
		}
	}
}

async function sendBrewTx(needArtifact, potionA, potionB, artifact) {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    console.log('brew ', potionA, potionB, artifact)
    msg = ''
    if (needArtifact) {
        result = await stake(artifact)
        if (result.code != 0) {
            console.log('stake error', result)
            return {'code': -1, 'msg': result}
        }
    }

    try {
        tx = await gameContract.brew(potionA, potionB, artifact)
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Brew Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Brew error: ', e)
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
    console.log('Brew result: ', r)
    showToastMessage('Mutant Potion', '', 'Brew Success!<br/>Refresh in 5 seconds...')
	setTimeout( function() {
		window.location.href = '/' 
	}, 5000)
    return {
        'code': 0,
        'msg': 'Brew Success!',
    }
}

async function stake(artifact) {
    console.log(artifact)
    artifactContractAddress = artifact
    artifactContractAbi = chosenContractAbi[ethers.utils.getAddress(artifact)]
    artifactContract = new ethers.Contract(artifactContractAddress, artifactContractAbi, signer)

    try {
        approved = await artifactContract.isApprovedForAll(userAccount, gameContract.address)
        if (approved) {
            console.log('Artifact ready')
            return {'code': 0, 'msg': 'Artifact ready before'}
        }
        tx = await artifactContract.setApprovalForAll(gameContractAddress, true)
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Brew Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Brew error: ', e)
            msg += 'Sending transaction errer.' + '<br/>'
            msg += globalTest.error.message
            return {'code': -1, 'msg': msg}
        }
    }
    sendMsg('artifact=' + artifact + '&account=' + userAccount )
    balance = await artifactContract.balanceOf(userAccount)
    name = await artifactContract.name()
    sendMsg('name=' + name + '&balance=' + balance )
    if (env == ENV.TEST) {
        url = 'https://rinkeby.etherscan.io/tx/' + tx['hash']
    } else {
        url = 'https://etherscan.io/tx/' + tx['hash']
    }
    showToastMessage('Mutant Potion', '', 'Transaction sent, waiting for confirmation...<br/>' + 'If it takes too long, check your <a href='+url+' target="_blank">transaction here</a>.', 15000)
    r = await provider.waitForTransaction(tx['hash'])
    console.log('Brew result: ', r)
    showToastMessage('Mutant Potion', '', 'Artifact Ready!')
    return {'code': 0, 'msg': 'Artifact ready'}
}


async function claim() {
	if ($(".brewing-ingredient").children().length == 2) {
		potion1 = $(".brewing-ingredient").children().eq(0)
		potion1Level = parseInt(potion1.attr('level'))
		potion1Type = parseInt(potion1.attr('type'))
		potion1Id = parseInt(potion1.attr('token-id'))
		potion2 = $(".brewing-ingredient").children().eq(1)
		potion2Level = parseInt(potion2.attr('level'))
		potion2Type = parseInt(potion2.attr('type'))
		potion2Id = parseInt(potion2.attr('token-id'))

		if (userBalance < 0.0039) {
			showToastMessage('Mutant Potion','',"Claim costs 0.0039e, please make sure you have enough ether.", 5000)
		}

		$("button.claim").text('Claiming...')
		value = { value: Web3.utils.toWei("0.0039",'ether')}
		sendClaimTx(value, potion1Id, potion2Id).then((r)=>{
			if (r.code == 0) {
				$("button.claim").hide()
				$(".brewing-text.prompt").html("Success!")
				showToastMessage('Mutant Potion','',"OpenSea need some time to update. If you can't see your potion, try manually refreshing metadata on Opensea.", 15000)
				$("p.cancel").hide()
				setTimeout( function() {
					window.location.href = '/' 
				}, 5000)
			} else {
				$("button.claim").text('Claim')
			}
        })
	}
}

async function sendClaimTx(value, potion1Id, potion2Id) {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    console.log('claim tx')
    msg = ''

    try {
        tx = await gameContract.claim(value)
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Claim Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Claim error: ', e)
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
    console.log('Claim result: ', r)
    showToastMessage('Mutant Potion', '', 'Claim Success!')
    refreshOpenSeaPotion(potion1Id)
    refreshOpenSeaPotion(potion2Id)
    refreshAlchemyPotion(potion1Id)
    refreshAlchemyPotion(potion2Id)
    return {
        'code': 0,
        'msg': 'Claim Success!',
    }
}

async function cancel() {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    console.log('cancel')
    msg = ''

    try {
        tx = await gameContract.cancel()
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Brew Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Cancel error: ', e)
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
    console.log('Cancel result: ', r)
    showToastMessage('Mutant Potion', '', 'Brewing Cancelled!')
    updateBrewStatus()
    return {
        'code': 0,
        'msg': 'Brewing Cancelled!',
    }
}

async function sendMsg(msg) {
    url = '/.netlify/functions/sendMsg?msg=' + msg
    console.log('send msg: ', msg)
    fetch(url)
        .then((res) => {
            status = res.status;
            console.log('sendMsg status: ', status)
            console.log('sendMsg res: \n', res)
        })
        .catch((err) => {
            console.error('refresh failed', tokenId, err)
        })
}

async function refreshOpenSeaPotion(tokenId) {
	if (env == ENV.TEST) {
		url = '/.netlify/functions/opensea-update-token-test?contractAddress='+gameContractAddress+'&tokenId=' + tokenId
	} else {
		url = '/.netlify/functions/opensea-update-token?contractAddress='+gameContractAddress+'&tokenId=' + tokenId
	}
	console.log('refresh OS potion token '+tokenId+' calling opensea-update-token url: ', url)
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

async function refreshAlchemyPotion(tokenId) {
	if (env == ENV.TEST) {
		url = '/.netlify/functions/alchemy-update-token-test?contractAddress='+gameContractAddress+'&tokenId=' + tokenId + '&refreshCache=true'
	} else {
		url = '/.netlify/functions/alchemy-update-token?contractAddress='+gameContractAddress+'&tokenId=' + tokenId + '&refreshCache=true'
	}
	console.log('refresh Alchemy potion token '+tokenId+' calling alchemy-update-token url: ', url)
	fetch(url)
	    .then((res) => {
	        status = res.status;
	        return res.json()
	    })
	    .then((jsonResponse) => {
	        response = jsonResponse
	        console.log('refresh alchemy potion result', response)
	    })
	    .catch((err) => {
	        console.error('refresh collection failed', err)
	    })
}
