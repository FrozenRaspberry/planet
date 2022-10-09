import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    options = {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-API-KEY': 'e34a5960d01447d49a9b247d447cf076' }
    };
    tokenId = event.rawQuery.split('=')[1]
    console.log('tokenId', tokenId)
    url = 'https://api.opensea.io/api/v1/asset/0x319e0e6a5c93c218e987a48ed3f98b23712db4d8/' + tokenId + '?force_update=true'
    console.log('url:', url)
    var status
    var response
    console.log('options:', options)
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
            console.error(err);
        });

    console.log(typeof(response))

    return {
        statusCode: status,
        body: JSON.stringify(response)
    }
}