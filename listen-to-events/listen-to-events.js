const ethers = require("ethers")
const planetABI = 

require("dotenv").config({ path: ".env.test" }) // TEST
// require("dotenv").config() // PROD

console.log(process.env.ENV)

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
	})

	contract.on("LevelUp", (tokenId, level, owner, event) => {
		info = {
			tokenId: tokenId,
			level: level,
			owner: owner,
			data: event,
		}
		console.log(JSON.stringify(info, null, 4))
	})
}

main()