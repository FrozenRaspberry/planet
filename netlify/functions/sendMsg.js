import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    options = { method: 'GET' };
    url = 'http://45.77.181.175:3000/hook?' + event.rawQuery
    console.log('url', url)
    var status
    var response
    await fetch(url)
        .then((res) => {
            status = res.status
            response = res
            console.log('status: ', status)
            console.log('res: \n', res)
        })
        .catch((err) => {
            console.error(err);
        });

    return {
        statusCode: status,
        body: JSON.stringify(response)
    }
}
