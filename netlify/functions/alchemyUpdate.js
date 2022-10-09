import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    url = 'https://eth-mainnet.g.alchemy.com/nft/v2/F262hk0OjXkjn6b7M8ncmb2KB3aPxqCF/reingestContract?contractAddress=0x319e0e6a5c93c218e987a48ed3f98b23712db4d8'
    options = { method: 'GET', headers: { Accept: 'application/json' } };
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