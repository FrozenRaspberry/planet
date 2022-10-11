async function mint(s) {
    if (walletStatus != WALLET_STATUS.CONNECTED) {
        showErrorMessage("You haven't connected yet.<br>Please refresh and try again.")
    	throw "You haven't connected yet."
    }
    if (!publicSaleStatus) {
        showErrorMessage('Mint is not live yet.<br>Follow out twitter to get the latest info.')
        throw 'mint is not live yet.' 
    }
    if (planetBalance != 0) {
        showErrorMessage('You have already own a planet.')
        throw 'You have already own a planet.'
    }
    var mintNum = 1
    msg = ''

    console.log('Mint ', mintNum)
    try {
        $('button.mint').text('MINTING...')
        $('button.mint').prop( "disabled", true )
        tx = await gameContract.publicSaleMint(mintNum)
    } catch (e) {
        $('button.mint').text('FREE MINT (' + parseInt(maxSupply - totalSupply) + ' Left)')
        $('button.mint').prop( "disabled", false )
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
        url = 'https://goerli.etherscan.io/tx/' + tx['hash']
    } else {
        url = 'https://etherscan.io/tx/' + tx['hash']
    }
    showToastMessage('', '', 'Transaction sent, waiting for confirmation...<br/>' + 'If it takes too long, check your <a href='+url+' target="_blank">transaction here</a>.', 15000)
    r = await provider.waitForTransaction(tx['hash'])
    console.log('Mint result: ', r)
    showToastMessage('', '', 'Mint success!<br/>Refresh in 5 seconds...', 15000)
    $('button.mint').text('Mint Success!')
    setTimeout( ()=>location.reload(), 5000)
    return {code: 0, msg: 'Mint success!'}
}