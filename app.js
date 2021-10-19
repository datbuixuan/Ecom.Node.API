require('dotenv').config();
const contractAddress = '0xb77c87cf0c12a20312b6b0885aab1d082e2d312f';

const http = require('http');
const express = require('express');
const Moralis = require('moralis/node');
const Web3 = require('web3');
const axios = require('axios');
const Arweave = require('arweave');

const app = express();
const hostname = '127.0.0.1';
const port = 2020;

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.json());

app.use(express.static('public'));

app.get('/', (request, response) => {
    response.send({
        message: 'Node.js and Express REST API',
    });
});

// Or to specify a gateway when running from NodeJS you might use
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

app.post('/arweave-upload', async (req, res) => {
    const body = req.body;
    let status = true;
    let resultData = '';

    if (!body.key)
        // missiting jwt key
        status = false;

    if (!body.url && !body.data)
        // Missing content or url
        status = false;

    if (!body.contentType)
        // Missing content type
        status = false;

    if (status) {
        let key = JSON.parse(body.key);

        if (body.data) {
            let transaction = await arweave.createTransaction(
                {
                    data: body.data,
                },
                key
            );

            transaction.addTag('Content-Type', body.contentType);

            await arweave.transactions.sign(transaction, key);

            let response = await arweave.transactions.post(transaction);

            if (response.status == 200) resultData = transaction;
        } else if (body.url) {
            let responseData = '';
            try {
                responseData = await axios({
                    method: 'get',
                    url: body.url,
                    responseType: 'arraybuffer',
                });
            } catch (error) {
                responseData = error;
            }

            var dataUrl = responseData.data;
            console.log(ArrayBuffer.isView(responseData)); //true
            console.log(responseData instanceof ArrayBuffer);

            if (dataUrl) {
                let transaction = await arweave.createTransaction(
                    {
                        data: dataUrl,
                    },
                    key
                );

                transaction.addTag('Content-Type', body.contentType);

                let response = await arweave.transactions.getUploader(
                    transaction
                );

                while (!response.isComplete) await response.uploadChunk();

                console.log(transaction);
            } else status = false;
        }
    }

    res.send({
        status,
        resultData,
    });
});

app.post('/mint-nft', async (req, res) => {
    const body = req.body; // query = {sex:"female"}

    const status = true;

    console.log('debug');

    if (!body.applicationId || !body.serverUrl) status = false;

    if (!body.abi || !body.contractAddress) status = false;

    if (status) {
        Moralis.initialize(body.applicationId);
        Moralis.serverURL = body.serverUrl;

        var web3 = await Moralis.enable();
        var tokenContract = new web3.eth.Contract(
            body.abi,
            body.contractAddress
        );

        let result = await tokenContract.methods
            .createItem(uri, creator || ethereum.selectedAddress)
            .send({ from: ethereum.selectedAddress });
        console.log(result);
    }

    res.send({
        status,
        body,
    });
});

app.post('/tranfer-nft', async (req, res) => {
    const body = req.body;

    res.send({
        status: true,
        body,
    });
});

app.post('/mint-2', async () => {
    // In Node.js
    let web3 = new Web3(
        'wss://speedy-nodes-nyc.moralis.io/dafe9c6c96b39b4f2ec839eb/bsc/testnet/ws'
    );

    const contractABI = [
        {
            inputs: [
                { internalType: 'string', name: 'name', type: 'string' },
                { internalType: 'string', name: 'symbol', type: 'string' },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'owner',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'approved',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'uint256',
                    name: 'tokenId',
                    type: 'uint256',
                },
            ],
            name: 'Approval',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'owner',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'operator',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'approved',
                    type: 'bool',
                },
            ],
            name: 'ApprovalForAll',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'from',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'to',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'uint256',
                    name: 'tokenId',
                    type: 'uint256',
                },
            ],
            name: 'Transfer',
            type: 'event',
        },
        {
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'Items',
            outputs: [
                { internalType: 'uint256', name: 'id', type: 'uint256' },
                { internalType: 'address', name: 'creator', type: 'address' },
                { internalType: 'string', name: 'uri', type: 'string' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'to', type: 'address' },
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
            ],
            name: 'balanceOf',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'string', name: 'uri', type: 'string' },
                { internalType: 'address', name: 'creator', type: 'address' },
            ],
            name: 'createItem',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'getApproved',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'address', name: 'operator', type: 'address' },
            ],
            name: 'isApprovedForAll',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'name',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'ownerOf',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'from', type: 'address' },
                { internalType: 'address', name: 'to', type: 'address' },
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'safeTransferFrom',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'from', type: 'address' },
                { internalType: 'address', name: 'to', type: 'address' },
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
                { internalType: 'bytes', name: '_data', type: 'bytes' },
            ],
            name: 'safeTransferFrom',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'operator', type: 'address' },
                { internalType: 'bool', name: 'approved', type: 'bool' },
            ],
            name: 'setApprovalForAll',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' },
            ],
            name: 'supportsInterface',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'symbol',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'tokenURI',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'from', type: 'address' },
                { internalType: 'address', name: 'to', type: 'address' },
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'transferFrom',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    const contractAddress = '0x02dBa224893C1b57a6c17F99920B54aa939f5538';
    const publicKey = '0x02dBa224893C1b57a6c17F99920B54aa939f5538';
    const nftContract = new web3.eth.Contract(contractABI, contractAddress);

    const nonce = await web3.eth.getTransactionCount(publicKey, 'latest'); //get latest nonce

    //the transaction
    const tx = {
        from: publicKey,
        to: contractAddress,
        // 'nonce': nonce,
        gas: 500000,
        data: nftContract.methods.createItem('url', publicKey).encodeABI(),
    };

    // if (data.gasPrice) {
    //   tx.gasPrice = data.gasPrice;
    // }

    const signedTx = await web3.eth.accounts.signTransaction(
        tx,
        '0xbf0aab28c6d4373f12526e7b32cddfcd288b0c9bc97ea0433e0e2ffc4eae2801'
    );
    console.log(signedTx);
    return signedTx;
});

const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
    console.log(`Server listening on port ${server.address().port}`);
});
