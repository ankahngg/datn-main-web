export function parseEther(amount: bigint): number {
    return Number(amount) / 1e18;
}
