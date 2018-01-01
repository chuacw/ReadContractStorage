  // Node.js script by chuacw Singapore
  // npm install bignumber.js
  // npm install web3
  // node ReadStorageContract.js
  
  // Uses Infura to read storage of a contract
  const Web3 = require('web3');
  const BigNumber = require('bignumber.js');
  var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));

  // Based on information from: http://solidity.readthedocs.io/en/latest/miscellaneous.html#layout-of-state-variables-in-storage
  // Layout of State Variables in Storage
  // For simple variables, the first variable in a contract starts at slot 0, so to read the variable
  // call web3.eth.getStorageAt(ContractAddr, slot); eg, data = web3.eth.getStorageAt(ContractAddr, slot); // where slot = 0
  // if the variable is a string, convert it as such: web3.toAscii(data), if it's an integer, use web3.toDecimal(data)...
  // For dynamic arrays of simple variables, if it's the second variable in a contract, the slot is 1, so, read the array length as such:
  // arraylen = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, slot)); where slot = 1
  // Then, the first piece of item for the dynamic array is: web3.eth.getStorageAt(ContractAddr, web3.sha3(slot));
  // The second piece of item can be retrieved by web3.eth.getStorageAt(ContractAddr, web3.sha3(slot)+1) 
  // and the third piece can be retrieved by web3.eth.getStorageAt(ContractAddr, web3.sha3(slot)+2)
  
  
  function increaseHexByOne(hex) {
   let x = new BigNumber(hex);
   let sum = x.add(1);
   let result = '0x' + sum.toString(16);
   return result;
  }
  
  function pad(n, width, z) {
    let z = z || '0';
    let n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  /// turns the input into a 64-length value
  function to64(val) {
    return pad(val, 64);
  }
  
  /// Turns the given value specified in seconds, into a date string
  function DateToString(value) {
	  let date  = new Date(value * 1000);
	  let year  = date.getFullYear();
	  let month = "0" + (date.getMonth()+1);
	  let day   = "0" + date.getDate();
	  let hours = "0" + date.getHours();
	  let min   = "0" + date.getMinutes();
	  let sec   = "0" + date.getSeconds();
	  return year + "/" + month.substr(-2) + "/" + day.substr(-2) + " " + hours.substr(-2) + ":" + min.substr(-2) + ":" + sec.substr(-2);
  }

  let ContractAddr = "0x27695E09149AdC738A978e9A678F99E4c39e9eb9";
  
  let owner = web3.eth.getStorageAt(ContractAddr, 0);                    // This is CSToken.owner
  console.log("Owner: " + owner);
  
  let standard = web3.toAscii(web3.eth.getStorageAt(ContractAddr, 1));   // CsToken.standard
  console.log("standard: " + standard);
  
  let name = web3.toAscii(web3.eth.getStorageAt(ContractAddr, 2));
  console.log("name: " + name);
  
  let symbol = web3.toAscii(web3.eth.getStorageAt(ContractAddr, 3));
  console.log("symbol: " + symbol);
  
  let decimals = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, 4));
  console.log("decimal: " + decimals);
  
  let totalSupply = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, 5));
  console.log("total supply: " + totalSupply);
  
  let allowManuallyBurnTokens = Boolean(web3.toDecimal(web3.eth.getStorageAt(ContractAddr, 6)));
  console.log("allow manually burn tokens: " + allowManuallyBurnTokens);
  
  let index = to64(7);
  let account = "0xC1163cf4420cAa8abac95D91401B60a084b225E7"; // update this to get a new account balance
  let key   = to64(account);
  
  let hexEncoding = {"encoding": "hex"};
  let newKey = web3.sha3(key + index, hexEncoding);
  let value = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, newKey));
  console.log("Account Balance of " + account + ": " + value);
  
  // agingBalanceOf is public, so skipped

  console.log();
  let varIndex = 9;
  let agingTimesLen = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, varIndex)); // get the dynamic array length
  console.log("aging Balance length: " + agingTimesLen); // returns a value
  index = to64(varIndex.toString(16));
  newKey = web3.sha3(index, hexEncoding);
  
  for (i=1; i<=agingTimesLen; i++) {  
	  value = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, newKey));
	  newKey = increaseHexByOne(newKey);
	  let date = DateToString(value);
	  console.log(date);
  }
  console.log();
  
  varIndex = 15; // currentDividendIndex storage location, slot 15
  let currentDividendIndex = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, varIndex));
  console.log("currentDividendIndex: " + currentDividendIndex);

  varIndex = 10;
  let dividendsLen = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, varIndex));
  console.log("dividends length: " + dividendsLen);

  index = to64(varIndex.toString(16));
  newKey = web3.sha3(index, hexEncoding);
  for (i=0; i<dividendsLen; i++) {  
	  if (i==0) {
	    for (j=1; j<=3; j++) newKey = increaseHexByOne(newKey);
	    continue; // skip the first, as it's 0, 0, 0
	  }

	  let time = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, newKey));
	  newKey = increaseHexByOne(newKey);
	  
 	  let tenThousandth = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, newKey));
	  newKey = increaseHexByOne(newKey);
	  
	  let countComplete = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, newKey));
	  newKey = increaseHexByOne(newKey);
	  
	  let markedIndex = "";
	  if (currentDividendIndex == i)
	    markedIndex = " <= currentDividendIndex!!!"; else
	    markedIndex = "";
	  
	  console.log(DateToString(time) + markedIndex);
  }
  
  varIndex = 16;
  index = to64(varIndex.toString(16));
  let myAccount = "0x518a00ffcd5d7029d811cbea97165534fde986f0"; // 0x518a00ffcd5d7029d811cbea97165534fde986f0
  key = to64(myAccount);
  newKey = web3.sha3(key + index, hexEncoding);
  value = web3.toDecimal(web3.eth.getStorageAt(ContractAddr, newKey));
  console.log("caculatedDividendsIndex for " + myAccount + ": " + value);