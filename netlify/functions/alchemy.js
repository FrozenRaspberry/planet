import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    baseUrl = 'https://eth-mainnet.g.alchemy.com/nft/v2/F262hk0OjXkjn6b7M8ncmb2KB3aPxqCF/getNFTs'
    options = { method: 'GET', headers: { Accept: 'application/json' } };
    url = baseUrl + '?' + event.rawQuery
    console.log('url', url)
    var status
    var response
    await fetch(url)
        .then((res) => {
            status = res.status;
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