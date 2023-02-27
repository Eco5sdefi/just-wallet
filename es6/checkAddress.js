function isValidAddress(address) {
    const addressRegExp = /^0x[a-fA-F0-9]{40}$/g;
    const match = address.trim().match(addressRegExp);
    const valid = match && match.length > 0 ? true : false;
    const value = address;
    const validAddress = match ? match[0] : undefined;
    return { address: validAddress, value, valid };
}
export default isValidAddress;