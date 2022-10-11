const ethers = require("ethers")
const fetch = require('node-fetch')
const http = require('http')
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

var planetRankList = []

const fs = require('fs');

async function savePlanetRankListToFile() {
    fs.writeFile("./planetRankList.json", JSON.stringify(planetRankList), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    })
}

async function loadPlanetRankListFromFile() {
    try {
        rawdata = fs.readFileSync('./planetRankList.json');
        planetRankList = JSON.parse(rawdata);
        console.log('planet rank list loaded', planetRankList)
    } catch (err) {
        console.log(err)
        planetRankList = []
    }
}

async function refreshPlanet(tokenId, retry) {
    if (!retry) {
        retry = 1
    } else if (retry >= 4) {
        console.log('!error refresh Fail reach max limit, tokenId', tokenId, retry)
        return
    }
    var options
    if (process.env.NEED_PROXY == '1') {
        options = {
            method: 'GET',
            agent: new HttpsProxyAgent('http://127.0.0.1:7890')
        } 
    } else {
        options = {
            method: 'GET'
        } 
    }

    contractAddress = process.env.PLANET_CONTRACT_ADDRESS
    console.log('opensea-update-token #', tokenId, 'retry remains', retry)
    url = process.env.OS_API_URL + '/api/v1/asset/' + contractAddress + '/' + tokenId + '?force_update=true'
    console.log('url:', url)
    var status
    var response
    await fetch(url, options)
        .then((res) => {
            status = res.status;
            if (status != 200) {
                console.log('!ERR status not OK, retry remains', retry, '\n', res)
                setTimeout(()=>{ refreshPlanet(tokenId, retry + 1)}, 5000)     
                return
            }
            console.log('!status ok:', status)
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

function updatePlanetRankList(tokenId, size) {
    if (planetRankList.length == 0) {
        planetRankList.push({id:tokenId, size:size})
        savePlanetRankListToFile()
        return
    }
    index = 0
    while (index < planetRankList.length) {
        if (planetRankList[index].id == tokenId) {
            planetRankList.splice(index, 1)
            break
        }
        index++
    }
    index = planetRankList.length - 1
    while (index >= 0) {
        if (planetRankList[index].size > size) {
            planetRankList.splice(index+1, 0, {id:tokenId, size:size})
            savePlanetRankListToFile()
            return
        }
        index --
    }
    planetRankList.splice(0, 0, {id:tokenId, size:size})
    savePlanetRankListToFile()
}

function removePlanetFromRankList(tokenId) {
    if (planetRankList.length == 0) {
        return
    }
    index = 0
    while (index < planetRankList.length) {
        if (planetRankList[index].id == tokenId) {
            planetRankList.splice(index, 1)
            break
        }
        index++
    }
    savePlanetRankListToFile()
}

async function startEventListen() {
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
        if (from == '0x0000000000000000000000000000000000000000') {
            console.log('!Mint token', tokenId, 'to', to)
            return
        }
        tokenId = parseInt(tokenId)
        console.log('!Trasfer token',tokenId,'from', from, 'to', to)
	})

    contract.on("Absorb", (tokenIdA, tokenIdB, size, event) => {
        info = {
            tokenIdA: tokenIdA,
            tokenIdB: tokenIdB,
            size: size,
            data: event,
        }
        tokenIdA = parseInt(tokenIdA)
        tokenIdB = parseInt(tokenIdB)
        size = parseInt(size)

        console.log('!Absord ',tokenIdA,' absorb ', tokenIdB, ' grow to size ', size)
        console.log('refresh planet', tokenIdA, tokenIdB)
        refreshPlanet(tokenIdA)
        setTimeout(()=>{ refreshPlanet(tokenIdB) }, 2000)        
        removePlanetFromRankList(tokenIdB)
        updatePlanetRankList(tokenIdA, size)
    })

	contract.on("LevelUp", (tokenId, level, owner, event) => {
		info = {
			tokenId: tokenId,
			level: level,
			owner: owner,
			data: event,
		}
		// console.log(JSON.stringify(info, null, 4))
        tokenId = parseInt(tokenId)
        level = parseInt(level)
        console.log('!Token LvUp',tokenId, 'new level', level, 'owner', owner)
	})

    contract.on("Rename", (tokenId, newName, event) => {
        info = {
            tokenId: tokenId,
            newName: newName,
            data: event,
        }
        tokenId = parseInt(tokenId)
        console.log('!Token Rename',tokenId, 'new name', newName)
        refreshPlanet(tokenId)
    })
}

async function startServer() {
    http.createServer((request, response) => {
      const { headers, method, url } = request;
      let body = [];
      request.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        // BEGINNING OF NEW STUFF

        response.on('error', (err) => {
          console.error(err);
        });

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        // Note: the 2 lines above could be replaced with this next one:
        // response.writeHead(200, {'Content-Type': 'application/json'})

        // const responseBody = { headers, method, url, body };
        const responseBody = {planetRankList};

        response.write(JSON.stringify(responseBody));
        response.end();
        // Note: the 2 lines above could be replaced with this next one:
        // response.end(JSON.stringify(responseBody))

        // END OF NEW STUFF
      });
    }).listen(8080)
}

loadPlanetRankListFromFile()
startEventListen()
startServer()

// test refresh
console.log('!Test refresh token')
refreshPlanet(0)