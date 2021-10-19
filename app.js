require("dotenv").config();
const contractAddress = "0xb77c87cf0c12a20312b6b0885aab1d082e2d312f";

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
    extended: true
  })
)

app.use(express.json())

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.send({
        message: 'Node.js and Express REST API'}
    );
});



// Or to specify a gateway when running from NodeJS you might use
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

app.post('/arweave-upload', async (req, res) => {
  const body = req.body;
  let status = true;
  let resultData = '';


  if(!body.key)  // missiting jwt key
    status = false;

  if(!body.url && !body.data) // Missing content or url
    status = false;
  
  if(!body.contentType) // Missing content type
      status = false;

  if(status){
      let key = JSON.parse(body.key);

      if(body.data){
        let transaction = await arweave.createTransaction({
          data: body.data
        }, key);

        transaction.addTag('Content-Type', body.contentType);

        await arweave.transactions.sign(transaction, key);

        let response = await arweave.transactions.post(transaction);

        if(response.status == 200)
            resultData = transaction;
      }
      else if(body.url){     
        let responseData = '';
        try {
          responseData = await axios({
            method: 'get',
            url: body.url,
            responseType: 'arraybuffer'
          });
        } catch (error) {
          responseData = error;
        }

        var dataUrl = responseData.data;
        console.log(ArrayBuffer.isView(responseData)) //true
        console.log(responseData instanceof ArrayBuffer)

        if(dataUrl){
          let transaction = await arweave.createTransaction({
            data: dataUrl
          }, key);
          


          transaction.addTag('Content-Type', body.contentType);
  
          let response = await arweave.transactions.getUploader(transaction); 
  
          while (!response.isComplete)
              await response.uploadChunk();
  
          console.log(transaction);
        }
        else
          status = false;       
      }
  }

  res.send({
    status,
    resultData,
  });
});

app.post('/mint-nft', async (req, res) => {
  const body = req.body;// query = {sex:"female"}

  const status = true;

  console.log('debug');

  if(!body.applicationId || !body.serverUrl)
    status = false;

  if(!body.abi || !body.contractAddress)
    status = false;
  

  if(status){
    Moralis.initialize(body.applicationId);
    Moralis.serverURL = body.serverUrl;

    var web3 = await Moralis.enable();
    var tokenContract = new web3.eth.Contract(body.abi, body.contractAddress);

    let result = await tokenContract.methods.createItem(uri, creator || ethereum.selectedAddress).send({from: ethereum.selectedAddress})
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

const server = app.listen(port, (error) => {
  if (error) return console.log(`Error: ${error}`);
  console.log(`Server listening on port ${server.address().port}`);
});
