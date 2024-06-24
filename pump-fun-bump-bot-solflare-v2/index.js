import {KEYPAIRS, RPC_ENDPOINT, SOl_AMOUNT_BUY, TOKEN_TO_BUMP} from "./config.js";
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {AnchorProvider, Program, Wallet} from "@coral-xyz/anchor";
import {PROGRAM_ID} from "./constants.js";
import {getOrCreateAssociatedTokenAccount} from "@solana/spl-token";
import {
    getTokenAmount,
    buildBuyTx,
    buildOptimizedTx,
    buildSellTx,
    getSolAmount,
    signAndSendTx, getBuyOrSellInstruction
} from "./lib.js";
import idl from "./idl.json" assert { type: "json" };

const keypairs = KEYPAIRS.map(k => Keypair.fromSecretKey(new Uint8Array(k)));
const connection = new Connection(RPC_ENDPOINT);
const provider = new AnchorProvider(connection, new Wallet(keypairs[0]), AnchorProvider.defaultOptions());
const program = new Program(idl, new PublicKey(PROGRAM_ID), provider);
const token = new PublicKey(TOKEN_TO_BUMP);

async function sendTx(bondingCurve, mint, globalState, feeRecipient, bondingCurveAta, userAta, user) {

    // Calculate amount of token in output for the amount of sol to buy
    const bondingCurveData = await program.account.bondingCurve.fetch(bondingCurve);
    const mintData = await connection.getParsedAccountInfo(mint);
    const {decimals, finalTokenAmount} = getTokenAmount(mintData, bondingCurveData, SOl_AMOUNT_BUY);
    const {finalSolAmount} = getSolAmount(mintData, bondingCurveData, finalTokenAmount);

    let tx = buildOptimizedTx(finalSolAmount, user);
    tx.add(await buildBuyTx(program, finalTokenAmount, decimals, globalState, feeRecipient, mint, bondingCurve, bondingCurveAta, userAta, user));
    tx.add(await buildSellTx(program, finalTokenAmount, finalSolAmount, decimals, globalState, feeRecipient, mint, bondingCurve, bondingCurveAta, userAta, user));

    console.log("try to send")
    try {
        signAndSendTx(tx, connection, user);
        console.log("Sent")
    } catch (e) {
        console.log(e)
    }

}

async function main() {
    // Parse transactions on token to fetch accounts to build buy/sell tx
    const data = await connection.getConfirmedSignaturesForAddress2(token, {limit: 10,});
    let buyOrSellTx = await getBuyOrSellInstruction(data, connection);

    // The accounts to build buy/sell tx
    const accounts = buyOrSellTx.accounts
    const globalState = accounts[0];
    const feeRecipient = accounts[1];
    const mint = accounts[2];
    const bondingCurve = accounts[3];
    const bondingCurveAta = accounts[4];

    const userAtas = await Promise.all(keypairs.map(async k => await (await getOrCreateAssociatedTokenAccount(connection, k, mint, k.publicKey, true)).address));

    while (true) {

        const promises = [];
        for (let i = 0; i < keypairs.length; i++) {
            promises.push(sendTx(bondingCurve, mint, globalState, feeRecipient, bondingCurveAta, userAtas[i], keypairs[i]));
        }
        await Promise.all(promises);

        await new Promise(r => setTimeout(r, 1000));
    }
}

main()
