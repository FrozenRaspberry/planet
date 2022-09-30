const ethers = require("ethers")
const fetch = require('node-fetch')
var HttpsProxyAgent = require('https-proxy-agent')

require("dotenv").config({ path: ".env.test" }) // TEST
// require("dotenv").config() // PROD
console.log(process.env.ENV)
console.log(process.env.PLANET_CONTRACT_ADDRESS)
const planetABI = require(process.env.PLANET_CONTRACT_ABI_FILE_NAME)
if (process.env.NEED_PROXY == '1') {
    console.log('Using proxy')
} else {
    console.log('Not using proxy')
}


async function refreshPlanet(tokenId) {
    var options
    if (process.env.NEED_PROXY == '1') {
        options = {
            method: 'GET',
            agent: new HttpsProxyAgent('http://127.0.0.1:4780')
        } 
    } else {
        options = {
            method: 'GET'
        } 
    }

    contractAddress = process.env.PLANET_CONTRACT_ADDRESS
    console.log('opensea-update-token #', tokenId)
    url = 'https://testnets-api.opensea.io/api/v1/asset/' + contractAddress + '/' + tokenId + '?force_update=true'
    console.log('url:', url)
    var status
    var response
    await fetch(url, options)
        .then((res) => {
            status = res.status;
            if (status != 200) {
                console.log('!status not OK:', res)
                throw('status not ok')
            }
            console.log('status:', status)
            // console.log('res:', res)
            return res.json()
        })
        .then((jsonResponse) => {
            response = jsonResponse
            // console.log(response)
            console.log('name:',response.name)
            console.log('description:',response.description)
            console.log('image_original_url:',response.image_original_url)
            console.log('address:',response.asset_contract.address)
            console.log('tokenId:', response.token_id)
            console.log('traits:', response.traits)
            // console.log('status', status)
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
		// console.log(JSON.stringify(info, null, 4))
        console.log('Trasfer token',tokenId,'from', from, 'to', to)
        tokenId = parseInt(tokenId)
		// console.log('refresh planet', tokenId)
		// refreshPlanet(tokenId)
	})

	contract.on("LevelUp", (tokenId, level, owner, event) => {
		info = {
			tokenId: tokenId,
			level: level,
			owner: owner,
			data: event,
		}
		// console.log(JSON.stringify(info, null, 4))
        console.log('Token LvUp',tokenId, 'new level', level, 'owner', owner)
        tokenId = parseInt(tokenId)
		console.log('refresh planet', tokenId)
		refreshPlanet(tokenId)
	})

    contract.on("Rename", (tokenId, newName, event) => {
        info = {
            tokenId: tokenId,
            newName: newName,
            data: event,
        }
        // console.log(JSON.stringify(info, null, 4))
        console.log('Token Rename',tokenId, 'new name', newName)
        tokenId = parseInt(tokenId)
        console.log('planet renamed', tokenId, newName)
        refreshPlanet(tokenId)
    })
}

main()
// refreshPlanet(1)