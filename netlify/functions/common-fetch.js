import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    options = { method: 'GET', headers: { Accept: 'application/json' } }
    // return {
    //     statusCode: 200,
    //     body: JSON.stringify([{"id":2,"level":2},{"id":3,"level":1},{"id":7,"level":0}])
    // }
    paramArrary = event.rawQuery.split('&')
    var params = {}
    for (i in paramArrary) {
        p = paramArrary[i]
        console.log('current p', p)
        if (p.split('=').length != 2) {
            console.log('Invalid parm', p)
            continue
        } else {
            params[p.split('=')[0]] = p.split('=')[1]
            console.log('Add parm', params)
        }
    }

    if (params.port) {
        url = params.protocol + '://' + params.url + ':' + params.port
    } else {
        url = params.protocol + '://' + params.url
    }
    console.log('final url', url)
    var status
    var response
    await fetch(url)
        .then((res) => {
            console.log(res)
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

    return {
        statusCode: status,
        body: JSON.stringify(response)
    }
}
