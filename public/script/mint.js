function mintMinus() {
	quantity = parseInt($('.mint-text.quantity').text())
	if (quantity > 1) {
		quantity--
		$('.mint-text.quantity').text(quantity)
	}
}

function mintPlus() {
	quantity = parseInt($('.mint-text.quantity').text())
	if (quantity < 10) {
		quantity++
		$('.mint-text.quantity').text(quantity)
	}
}

async function mint(s) {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
    	throw "You haven't connected yet."
    }
    if (gamePhase != GamePhase.MINT) {
        throw 'mint is not live yet.' 
    }
    var mintNum = parseInt($('.mint-text.quantity').text())
	if (!isNumber(mintNum) || mintNum < 1 || mintNum > 10 || mintNum != parseInt(mintNum)) {
    	throw 'mint number is not valid. mintNum: ' + str(mintNum)
    }
    console.log('mint ', mintNum)
    msg = ''
    if (numberMinted === null || mintPrice === null) {
    	throw 'numberMinted or mintPrice is null, please wait'
    }

    if (numberMinted + mintNum > freeMintNum) {
        if ( numberMinted >= freeMintNum) {
            numberToPay = mintNum;
        } else {
            numberToPay = numberMinted + mintNum - freeMintNum;
        }
    } else {
        numberToPay = 0
    }
    totalMintPrice = mintPrice * numberToPay
    console.log('totalMintPrice', totalMintPrice, 'mintPrice', mintPrice, 'mintPrice', mintPrice, 'numberMinted', numberMinted)
    if ((await provider.getBalance(accounts[0])) < totalMintPrice) {
        price = Web3.utils.fromWei(mintPrice.toString(),'ether')  * mintNum
        msg = "You don't have enough ETH, " + price + "E is required."
        showToastMessage('Mint Alert', '', msg)
        return { code: 1, msg: msg }
    }
    console.log('Mint ', mintNum)
    try {
        tx = await spellContract.publicSaleMint(mintNum, { value: Web3.utils.toWei(totalMintPrice.toString(),'wei')} )
    } catch (e) {
        if (e.code == 4001) {
            showToastMessage('Mint Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('Mint error: ', e)
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
    console.log('Mint result: ', r)
    showToastMessage('Mutant Potion', '', 'Mint success!<br/>You can craft new spells with the spell books you just minted <a href="https://mutant-potion.xyz/#spell" target="_blank">HERE</a>.', 15000)
    return {
        'code': 0,
        'msg': 'Mint success!',
    }
}