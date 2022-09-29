const ethers = require("ethers")
const fetch = require('node-fetch')
var HttpsProxyAgent = require('https-proxy-agent')

require("dotenv").config({ path: ".env.test" }) // TEST
// require("dotenv").config() // PROD
console.log(process.env.ENV)

const planetABI = require(process.env.PLANET_CONTRACT_ABI_FILE_NAME)

async function refreshPlanet(tokenId) {
    options = {
        method: 'GET',
        agent: new HttpsProxyAgent('http://127.0.0.1:4780')
    }
    contractAddress = process.env.PLANET_CONTRACT_ADDRESS
    console.log('opensea-update-token', contractAddress, tokenId)
    url = 'https://testnets-api.opensea.io/api/v1/asset/' + contractAddress + '/' + tokenId + '?force_update=true'
    console.log('url:', url)
    var status
    var response
    await fetch(url, options)
        .then((res) => {
            status = res.status;
            console.log('status:', status)
            return res.json()
        })
        .then((jsonResponse) => {
            response = jsonResponse
            console.log('tokenId', response.token_id)
            console.log('traits', response.traits)            
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

async function main() {
	const planetContractAddress = process.env.PLANET_CONTRACT_ADDRESS
	const planetContractAbi = require(process.env.PLANET_CONTRACT_ABI_FILE_NAME)
	const provider = new ethers.providers.WebSocketProvider(process.env.ALCHEMY_WSS)
	const contract = new ethers.Contract(planetContractAddress, planetContractAbi, provider)
	contract.on("Transfer", (from, to, tokenId, event) => {
		info = {
			from: from,
			to: to,
			tokenId: tokenId,
			data: event,
		}
		console.log(JSON.stringify(info, null, 4))
		console.log('refresh planet', tokenId)
		refreshPlanet(tokenId)
	})

	contract.on("LevelUp", (tokenId, level, owner, event) => {
		info = {
			tokenId: tokenId,
			level: level,
			owner: owner,
			data: event,
		}
		console.log(JSON.stringify(info, null, 4))
		console.log('refresh planet', tokenId)
		refreshPlanet(tokenId)
	})
}

main()