exports.handler = async (event, context) => {
    owner = event.queryStringParameters.owner
    collection = event.queryStringParameters.collection

    console.log('owner ', owner)
    console.log('collection ', collection)
    
    return {
        statusCode: 200,
        body: JSON.stringify({message: 'test data'})
    }
}