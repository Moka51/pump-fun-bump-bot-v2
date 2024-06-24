# pump-fun-bump-bot

This bot buy and sell automatically on pump.fun and raydium. 

it can be used to be displayed on the main page of pump.fun.

## Demo 

[![Demo](https://img.youtube.com/vi/KIq8JfL0Ws0/0.jpg)](https://www.youtube.com/watch?v=KIq8JfL0Ws0)


## Intro

Private keys exported from Solflare are in a different format than Phantom.

This is why there are two folders:

- One to work with private keys exported from Solflare
- Another one to work with the exported private keys from Phantom

Depending on which extension you use, choose the right folder.

## Download the bot

If you have git installed on your computer you can fetch the content of this repository with the command : 

```
git clone https://github.com/LogicPush/pump-fun-bump-bot
```

Else, you can download the repository in a zip here : https://github.com/LogicPush/pump-fun-bump-bot/archive/refs/heads/master.zip

## Environment setup

you need to install nodejs :

For Windows : https://nodejs.org/dist/v22.2.0/node-v22.2.0-x64.msi

For MacOS : https://nodejs.org/dist/v22.2.0/node-v22.2.0.pkg

For Linux, execute in a terminal : 

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

nvm install 22
```

To check if nodejs is installed : 

- on Windows, open a cmd.exe, and run the command : 

```
node -v
```

- On MacOs & linux, open a terminal, and run the same command : 

```
node -v
```

It should return the version of nodejs.

## Dependency installation

In a cmd.exe or a terminal, go to the folder of Solflare or Phantom with the command :

```
cd /path/to/the/folder
```

Then, in your cmd.exe / terminal, start the command :

```
npm install
```

It should install all the dependencies in a new folder named "node_modules".

## Setup configuration in the config.js script

You have six things to setup : 

- The RPC endpoint to connect you to the Solana blockchain (Quicknode or Helius provide good free RPC endpoints)

- The private keys of the wallets who will buy and sell 

- The contract address of the token you want to bump

- The slippage you want for each buy / sell

- The fees (more fees = more speed & successful transactions)

- The amount in SOL for each buy

```
export const RPC_URL = "https://aged-delicate-bird.solana-mainnet.quiknode.pro/1db5b703fe4238d1403926702345678b36a134ef/"; // Quicknode or Helius give good rpc urls
export const TOKEN_ADDR = ""; // Put the address of the token you want to bump here
export const SOL_BUY_AMOUNT = 0.011; // here you can choose to increase/decrease the buy amount
export const FEES = 0.0005; // here you can adjust the fees
export const SLIPPAGE = 5; // here you can adjust the slippage
export const KEYPAIRS = [""] // here you can put multiple private keys to bump with multiple accounts
```
## Run the bump bot

To run the bump bot, in a cmd.exe or a terminal, start the command:

```
node index.js
```

And it's all. The bot will buy and sell 1 time in only one transaction with each account.

## Adjustments

If you want to buy more or less times before selling, it's at the bottom of the index.js script, in the while loop : 


To handle the pause between transactions you can add/adjust this line:

```
await new Promise(r => setTimeout(r, 2000)); // it's in milliseconds
```
To try to spend less fees, you can try to decrease the amount of fees in the config.js file, and run multiple instances of the script in multiple cmd.exe / terminals to spam the transactions.

## Support

If you have any question/problem, you can contact me on telegram : https://t.me/LogicPush

## Tips

To buy me a coffee, here are my addresses:

- Solana : 2zzTcxBkbFSseYzDrutrxSdeWaij3Un9oBtWjHF7v1bN

- BSC / ETH : 0xB041Dc915254D3E4F56487017076DCeDb61A81E3

Happy bumping!
