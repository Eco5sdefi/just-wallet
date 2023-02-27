import { ethers } from "ethers";
const JsonRpcProvider = ethers.providers.JsonRpcProvider;
const Web3Provider = ethers.providers.Web3Provider;
class Provider extends JsonRpcProvider {
    constructor(provider) {
        super(provider);
    }
    get isReady() {
        return new Promise(async (resolve, reject) => {
            const ready = await this.ready;
            if (ready) {
                resolve(true);
                return;
            }
            reject(false);
        });
    }
    Ethers(provider) {
        if (provider._isProvider) {
            throw new Error("Provider is not ethers.Provider");
        }
        return provider;
    }
    static get Web3() {
        return Web3Provider;
    }
}
export default Provider;
