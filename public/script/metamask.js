var provider;
var signer;
var walletStatus;
const WALLET_STATUS = {
    UNINSTALLED: 0,
    INSTALLED: 1,
    CONNECTED: 2
}

const M = 10 ** 18;
var chainId = -1;
var userAccount;

function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
}

window.ethereum.on('accountsChanged', function(accounts) {
    if (walletStatus == WALLET_STATUS.CONNECTED) {
        console.log('Account changed, auto connecting...')
        walletStatus = WALLET_STATUS.INSTALLED
        window.location.reload();
    }
})

async function connect(auto) {
    console.log('connecting')
    if (walletStatus == WALLET_STATUS.CONNECTED) {
        console.log('Connected already.')
        return { code: 0, msg: 'Already connected.' }
    }
    if (typeof window.ethereum == 'undefined') {
        console.log('MetaMask not found!');
        walletStatus = WALLET_STATUS.UNINSTALLED;
        url = "https://metamask.io/"
        msg = 'Please install MetaMask first, you can get it <a href=' + url + ' target="_blank">here</a>.'
        showErrorMessage(msg)
        return { code: 1, msg: msg }
    } else {
        console.log('MetaMask OK.');
        walletStatus = WALLET_STATUS.INSTALLED;
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum)
            signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
        } catch (e) {
            console.log('init ethers failed', e)
            msg = 'Init ethers failed, please refresh and try again.'
            showErrorMessage(msg)
            return { code: 1, msg: msg }
        }
    }

    try {
        accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });
    } catch (e) {
        msg = 'Fetch account failed, please refresh and try again.'
        showErrorMessage(msg)
        return { code: 1, msg: msg }
    }

    msg = ''
    if (accounts[0]) {
        walletStatus = WALLET_STATUS.CONNECTED;
        $("button.connect").text('Loading...')
        userAccount = accounts[0];
        console.log('Connected. ', userAccount);
        if (ethereum.chainId == '0x1') {
            if (env == ENV.TEST) {
                console.error('Test mode, please switch to Goerli Testnet and try again.')
                msg += 'Test mode, please switch to Goerli Testnet and try again.'
                walletStatus = WALLET_STATUS.INSTALLED;
                showToastMessage('Network', '', msg)
                return { code: 0, msg: msg }
            } else {
                msg += userAccount.slice(0, 6) + '...' + userAccount.slice(-4)
                msg += ' connected. <br/>Loading game status...'
                gameContract = new ethers.Contract(gameContractAddress, gameContractAbi, signer)
            }
        } else if (ethereum.chainId == '0x5') {
            if (env == ENV.TEST) {
                msg += 'Goerli Testnet Network Detected.<br/>'
                msg += userAccount.slice(0, 6) + '...' + userAccount.slice(-4)
                msg += ' connected. <br/> Loading game status...' //Check your available options with command <span style="color: yellow">/help</span>
                showToastMessage('Network', '', msg)
                gameContract = new ethers.Contract(gameContractAddress, gameContractAbi, signer)
            } else {
                walletStatus = WALLET_STATUS.INSTALLED
                console.error('Prod mode, please switch to mainnet.')
                return { code: 1, msg: 'Wrong network, please connect to the mainnet.' }
            }
        } else {
            walletStatus = WALLET_STATUS.INSTALLED
            return { code: 1, msg: 'Wrong network, please connect to the mainnet.' }
        }
        console.log('chain id: ', ethereum.chainId)
        balance = await provider.getBalance(userAccount)
        userBalance = Web3.utils.fromWei(balance.toString(), 'ether')
        console.log('balance: ', userBalance)
        return { code: 0, msg: 'connected' }
    }
}

async function getAccount() {
    if (walletStatus == WALLET_STATUS.CONNECTED) {
        walletStatus = WALLET_STATUS.CONNECTED;
        userAccount = accounts[0];
        if (ethereum.chainId == '0x1') {
            networkName = 'ETH Mainnet';
        } else {
            networkName = 'Wrong Network';
        }
        console.log(networkName)
        return {
            code: 0,
            msg: userAccount.slice(0, 6) + '...' + userAccount.slice(-4) + ' connected.'
        }
    }
    return {
        code: 1,
        msg: "You haven't connected yet."
    }
}

async function updateContractStatus() {
    if (gameContract) {
        p_totalSupply = gameContract.totalSupply()
        p_totalSupply.then((r) => {
            totalSupply = parseInt(r)
            console.log('Total supply: ', totalSupply)
        })

        p_status = gameContract.getPublicSaleStatus()
        p_status.then((r) => {
            publicSaleStatus = r
            console.log('publicSaleStatus: ', publicSaleStatus)
        })

        p_maxSupply = gameContract.maxSupply()
        p_maxSupply.then((r) => {
            maxSupply = r
            console.log('maxSupply: ', parseInt(maxSupply))
        })
    } else {
        console.log('Game contract not set yet.')
    }
}