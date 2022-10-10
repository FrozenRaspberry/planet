function rename() {
	if (playerTokenLv > 0) {
		$('div.rename-price').text('Rename a level '+playerTokenLv+' planet requires 0.0'+playerTokenLv+'e')
	} else {
		$('div.rename-price').text('Rename a level '+playerTokenLv+' planet is free')
			}
	$('#nameInputModal').modal('show')
}

async function renameSubmit() {
	var planetName = $('.planet-name-input').val()
	var value = { value: Web3.utils.toWei((playerTokenLv * 0.01).toString(),'ether')}
    console.log('Set Name ', planetName, 'id', playerTokenId, 'value', value)
    try {
        $('button.rename-submit').text('RENAMING...')
        $('button.rename-submit').prop( "disabled", true )
        tx = await gameContract.setName(planetName, value)
    } catch (e) {
        $('button.rename-submit').text('RENAME')
        $('button.rename-submit').prop( "disabled", false )
        if (e.code == 4001) {
            showToastMessage('Mint Alert', '', 'You rejected the transaction.')
            return {'code': -1, 'msg': 'You rejected the transaction.' }
        } else {
            globalTest = e
            console.log('rename error: ', e)
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
    console.log('Rename result: ', r)
    showToastMessage('', '', 'Rename success!<br/>Refresh in 5 seconds...', 15000)
    $('button.rename-submit').text('SUCCESS')
    $('#nameInputModal').modal('hide')
    setTimeout( ()=>location.reload(), 5000)
    return {code: 0, msg: 'Rename success!'}
}