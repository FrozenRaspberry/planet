import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    options = {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-API-KEY': 'e34a5960d01447d49a9b247d447cf076' }
    };
    paramArrary = event.rawQuery.split(/=|&/)
    contractAddress = paramArrary[paramArrary.indexOf("contractAddress")+1]
    tokenId = paramArrary[paramArrary.indexOf("tokenId")+1]
    console.log('opensea-update-token', contractAddress, tokenId)
    url = 'https://testnets-api.opensea.io/api/v1/asset/' + contractAddress + '/' + tokenId + '?force_update=true'
    console.log('url:', url)
    var status
    var response
    await fetch(url, options)
        .then((res) => {
            status = res.status;
            console.log('status:', status)
            console.log('res:', res)
            return res.json()
        })
        .then((jsonResponse) => {
            response = jsonResponse
            console.log('jsonResponse\n', jsonResponse)
            console.log('status', status)
        })
        .catch((err) => {
            status = 500
            response = {msg: err}
            console.error(err)
        });
    return {
        statusCode: status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response)
    }
}