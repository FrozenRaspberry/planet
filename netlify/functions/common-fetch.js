import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    options = { method: 'GET', headers: { Accept: 'application/json' } };
    console.log(event.rawQuery)
    return {
        statusCode: 200,
        body: JSON.stringify([{"id":2,"level":2},{"id":3,"level":1},{"id":7,"level":0}])
    }
    url = 'https://api.etherscan.io/api?module=contract&action=getabi&address='+address+'&apikey=4TATWET897GUV2PS9PAXYJMZKY5NJCS76I'
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
