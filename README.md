# KOII Recipient SDK
## What is KOII PoRT:
KOII PoRT is a way to track the attention that assets on KOII network gets and to earn rewards based on that attention. But before the attention can  be tracked you must register your NFT (Recipient) on KOII network using thi SDK  
## Introduction:

This package will sign NFT tokens and submit to KOII Nodes and in returns your user will be able to earn earn some KOII after their NFT registration

## How to use:

Following is the installation guide for KOII PoRT

`npm install @_koii/recipients`
or
`yarn add @_koii/recipients`


or 
`<script src="https://cdn.koii.live/port-latest.js"></script>`

**Replace {{Version}} with a correct version from release`**

**Note:CDN Coming soon!!**

## SDK Documentation

First you have to initialize the PoRT class:

```js
 import {registerArweaveNFT, registerIpfsNFT, RegisterWEBNFT, } from "@_koii/recipients"
```

Now here's the list of function this SDK exposes:

### **`registerArweaveNFT()`**
This function will register an Arweave smart contract as a KOII Recipient.

##### Arguments

This function accepts an optional options object which for now includes following options.

**`address`** <br />
**Type**: `string` <br />
**description**: Pay load is the Arweave address you need to register

**`wallet`** <br />
**Type**: `string` <br />
**description**: Arweave wallet used to create that NFT on arweave. Will be used to sign the NFT for verification 
 <br />
### **`registerIpfsNFT()`** <br />
This function will register your NFT  <br />
##### Arguments

This function accepts following arguments
**`image`** <br />
**Type**: `buffer` <br />
**Required**: `true` <br />
**description**: The image which will be used as an NFT

**`privateKey`** <br />
**Type**: `UInt8Array` <br />
**Required**: `true` <br />
**description**: KOII private to be used as a signer (recipient) 

**`metadata`** <br />
**Type**: `object` <br />
**Required**: `true` <br />
**description**: IPFS metadata which will be linked to the NFT

### **`registerWEBNFT()`** <br />
This function will register your  Web NFT  <br />
##### Arguments

This function accepts following arguments
**`image`** <br />
**Type**: `buffer` <br />
**Required**: `true` <br />
**description**: The image which will be used as an NFT

**`privateKey`** <br />
**Type**: `UInt8Array` <br />
**Required**: `true` <br />
**description**: KOII private to be used as a signer (recipient) 

**`metadata`** <br />
**Type**: `object` <br />
**Required**: `true` <br />
**description**: IPFS metadata which will be linked to the NFT



