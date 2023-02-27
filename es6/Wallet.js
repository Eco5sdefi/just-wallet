var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Wallet_mnemonic;
import { ethers } from "ethers";
import TokenWallet from "./Token.js";
import Format from "./Format.js";
import GasFormat from "./GasFormat.js";
import Transaction from "./Transaction.js";
import Provider from "./Provider.js";
import Contract from "./Contract.js";
import FromSigner from "./fromSigner";
import addressValidator from "./checkAddress";
const abi = `[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`;
const privatekeyRegExp = /^0x[0-9a-fA-F]/g;
export class Wallet {
    constructor(wallet, provider) {
        _Wallet_mnemonic.set(this, void 0);
        if (wallet === undefined) {
            throw new Error("Wallet is Emty");
        }
        this.Wallet = wallet;
        const walletLength = 66;
        let __provider;
        if (typeof provider === "string") {
            __provider = new Provider(provider || `http://localhost:8545`);
        }
        else {
            __provider = provider;
        }
        this.provider = __provider;
        this.decimals = 18;
        if (typeof wallet === "string") {
            const isPrivate = wallet.match(privatekeyRegExp);
            const isValidPrivateKey = !!isPrivate;
            const splitted = wallet.trim().split(" ");
            if (isValidPrivateKey && (wallet === null || wallet === void 0 ? void 0 : wallet.length) === walletLength) {
                this.Wallet = new ethers.Wallet(wallet, provider);
            }
            else if (splitted.length >= 12) {
                const fromMnemonicWallet = ethers.Wallet.fromMnemonic(wallet);
                const __privateKey = fromMnemonicWallet.privateKey;
                this.Wallet = new ethers.Wallet(__privateKey, provider);
                __classPrivateFieldSet(this, _Wallet_mnemonic, wallet, "f");
            }
        }
        else if (wallet._isSigner === true) {
            this.Wallet = wallet;
        }
    }
    get address() {
        return this.Wallet.address;
    }
    get privateKey() {
        return this.Wallet.privateKey;
    }
    get balance() {
        return new Promise((resolve, reject) => {
            this.provider.getBalance(this.address).then((bal) => {
                resolve(new Format.Wei(bal.toString(), 18));
            });
        });
    }
    send(amount, to, gasLimit) {
        return new Promise(async (resolve, reject) => {
            const balance = await this.balance;
            const factory = Format.Factory(this.decimals);
            const tokenAmount = factory(amount);
            const enoughBalance = BigInt(balance.wei) >= BigInt(tokenAmount);
            const isValidAddress = addressValidator(to);
            var tx = {};
            if (gasLimit) {
                tx.gasLimit = gasLimit;
            }
            tx.to = to;
            tx.value = factory(amount);
            if (!isValidAddress.valid) {
                reject({ msg: "Address Provided is not valid", data: isValidAddress });
                return;
            }
            if (!enoughBalance) {
                reject({ msg: "Not enough balance to contineu this transaction", transaction: tx, balance: balance });
                return;
            }
            this.Wallet.sendTransaction(tx).then((result) => {
                result.Transaction = new Transaction(tx.value, 18);
                resolve(result);
            })
                .catch((err) => reject(err));
            return;
        });
    }
    estimateGas(amount, to) {
        const factory = Format.Factory(this.decimals);
        const tx = {
            to: to,
            value: factory(amount)
        };
        return new Promise((resolve, reject) => {
            const isValidAddress = addressValidator(to);
            if (!isValidAddress) {
                reject({ msg: "Address Provided is not valid", data: isValidAddress });
                return;
            }
            this.Wallet.estimateGas(tx).then((res) => {
                resolve(new GasFormat.Static(tx, res));
            });
        });
    }
    Token(addr) {
        return new TokenWallet(this.Wallet, addr);
    }
    static get Contract() {
        return Contract;
    }
    static get Format() {
        return Format;
    }
    static get FromSigner() {
        return FromSigner;
    }
    static get Provider() {
        return Provider;
    }
}
_Wallet_mnemonic = new WeakMap();
export default Wallet;
