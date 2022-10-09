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

window.ethereum.on('accountsChanged', function (accounts) {
    if (walletStatus == WALLET_STATUS.CONNECTED) {
        console.log('Account changed, auto connecting...')
        walletStatus = WALLET_STATUS.INSTALLED
        window.location.reload();
    }
})

async function connect(auto) {
    console.log('connecting')
    if (walletStatus == WALLET_STATUS.CONNECTED) {
        console.log('Connected already.');
        return {
            code: 0,
            msg: 'You have already connected.'
        }
    }
    if (typeof window.ethereum == 'undefined') {
        console.log('MetaMask not found!');
        walletStatus = WALLET_STATUS.UNINSTALLED;
        url = "https://metamask.io/"
        return {code: 1, msg: 'Please install MetaMask first, you can get it <a href='+url+' target="_blank">here</a>.'}
    } else {
        console.log('MetaMask OK.');
        walletStatus = WALLET_STATUS.INSTALLED;
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum)
            signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
        } catch (e) {
            console.log('init ethers failed', e)
            return {code: 1, msg: 'Init ethers failed, please refresh and try again.'}
        }
    }

    try {
        accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });
    } catch (e) {
        return {code: 1,msg: 'Fetch account failed, please refresh and try again.'}
    }
    msg = ''
    if (accounts[0]) {
        walletStatus = WALLET_STATUS.CONNECTED;
        $("button.connect").text('Loading...')
        userAccount = accounts[0];
        console.log('Connected. ', userAccount);        
        if (ethereum.chainId == '0x1') {
            if (env == ENV.TEST) {
                msg += 'Test mode, please switch to <span style="color: yellow">Rinkeby Testnet</span> and try again.'
                walletStatus = WALLET_STATUS.INSTALLED;
                showToastMessage('Network','', msg)
                return {code: 0, msg: msg }            
            } else {
                msg += userAccount.slice(0, 6) + '...' + userAccount.slice(-4)
                msg += ' connected. <br/>Loading spell contract status...'
            }
        } else if (ethereum.chainId == '0x4') {
            if (env == ENV.TEST) {
                msg += 'Rinkeby Testnet Network Detected.<br/>'
                msg += userAccount.slice(0, 6) + '...' + userAccount.slice(-4)
                msg += ' connected. <br/> Loading game status...' //Check your available options with command <span style="color: yellow">/help</span>
                showToastMessage('Network','', msg)
            } else {
                walletStatus = WALLET_STATUS.INSTALLED
                console.log('Prod mode, please switch to mainnet.')
                return {code: 1, msg: 'Wrong network, please connect to the mainnet.'}
            }
        } else {
            walletStatus = WALLET_STATUS.INSTALLED
            return {code: 1, msg: 'Wrong network, please connect to the mainnet.'}
        }
        spellContract = new ethers.Contract(spellContractAddress, spellContractAbi, signer)
        console.log('chain id: ', ethereum.chainId)
        balance = await provider.getBalance(userAccount)
        userBalance = Web3.utils.fromWei(balance.toString(), 'ether')
        console.log('balance: ', userBalance)
        await updateSpellMintStatus()
        return {code: 0, msg: 'ok' }
    }
}

async function updateSpellMintStatus() {
    if (spellContract) {
        p_totalSupply = spellContract.totalSupply()
        p_totalSupply.then((r)=>{
            totalSupply = parseInt(r)
            console.log('Total supply: ', totalSupply)
        })

        p_status = spellContract.getPublicSaleStatus()
        p_status.then((r)=>{
            publicSaleStatus = r
            console.log('publicSaleStatus: ', publicSaleStatus)
        })

        p_potionBalanceOf = spellContract.potionBalanceOf()
        p_potionBalanceOf.then((r)=>{
            potionBalanceOf = parseInt(r)
            console.log('potionBalanceOf: ', potionBalanceOf)
        })

        p_publicPrice = spellContract.publicPrice()
        p_publicPrice.then((r)=>{
            mintPrice = r
            console.log('Mint price: ', Web3.utils.fromWei(r.toString(), 'ether') , 'e')
        })

        p_numberMinted = spellContract.numberMinted(userAccount)
        p_numberMinted.then((r)=>{
            numberMinted = parseInt(r)
            console.log('numberMinted: ', numberMinted)
            $("p.number-minted").text("You've minted " + numberMinted)
            $("p.number-minted").show()
        })
        console.log('updating mint status')
        await Promise.all([p_status, p_totalSupply, p_potionBalanceOf]);
        console.log('status ready')
        // publicSaleStatus = false //test
        // 
        if (publicSaleStatus) {
            console.log('Mint Phase')
            if (totalSupply >= 5555) { //TEST PROD 5555
                // SOLDOUT-STATUS
                gamePhase = GamePhase.SOLDOUT
                console.log('GamePhase: SOLDOUT')
                $("div.connect-page").hide()
                $("div.mint-page").hide()
                $("div.soldout-page").show()
            } else {
                // MINT-STATUS
                gamePhase = GamePhase.MINT
                console.log('GamePhase: MINT')
                $("div.connect-page").hide()
                $("div.mint-page").show()
                await p_potionBalanceOf
                freeMintNum = potionBalanceOf
                if (potionBalanceOf == 0) {
                    freeMintNum = 1
                }
                if (freeMintNum > 5) {
                    freeMintNum = 5
                }
                if (potionBalanceOf > 0) {
                    $(".not-holder-prompt").hide()
                    $(".holder-prompt").show()
                } else {
                    $(".not-holder-prompt").show()
                    $(".holder-prompt").hide()
                }

                $(".potion-num-msg1").text("You have "+potionBalanceOf+"x POTION")
                $(".potion-num-msg2").text("You can mint "+freeMintNum+"x SPELL for FREE !")
            }
        } else {
            gamePhase = GamePhase.PREMINT
            console.log('Pre-Mint Phase')
            $("div.connect-page").hide()
            $("div.premint-page").show()
        }
    } else {
        console.log('Spell contract not set yet.')
    }
}
