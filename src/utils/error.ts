/**
 * Friendly Error Handler for Web3 Transactions
 * Parses Wagmi/Viem errors into human-readable messages for Toasts
 */
export function getFriendlyError(error: any): string {
    if (!error) return "An unknown error occurred 🔍";

    // 1. User Rejected
    if (
        error.name === 'UserRejectedRequestError' || 
        error.code === 4001 || 
        error.message?.includes('rejected') ||
        error.message?.includes('User denied')
    ) {
        return "Transaction rejected by user 🚫";
    }

    // 2. Insufficient Funds
    if (
        error.name === 'InsufficientFundsError' || 
        error.message?.includes('insufficient funds') ||
        error.message?.includes('exceeds the balance')
    ) {
        return "Insufficient BNB for gas or transaction ⛽";
    }

    // 3. Contract Revert with specific reason
    if (error.name === 'ContractFunctionRevertedError' || error.message?.includes('reverted')) {
        // Try to extract reason from common viem error structures
        const reason = error.reason || error.shortMessage?.split('reverted with the following reason:')?.[1]?.trim();
        if (reason) return `Contract error: ${reason} ❌`;
        
        // Handle specific common custom errors if possible
        if (error.message?.includes('TransferAmountExceedsBalance')) return "Balance too low for transfer 📉";
        if (error.message?.includes('OwnableUnauthorizedAccount')) return "Unauthorized: Admin access required 🛡️";
        
        return "Contract execution reverted ❌";
    }

    // 4. Deadline Exceeded (Common in DEX/Bonding)
    if (error.message?.includes('deadline')) {
        return "Transaction expired. Please try again ⏳";
    }

    // 5. RPC / Network Issues
    if (error.message?.includes('network') || error.message?.includes('rpc') || error.code === -32000) {
        return "Network busy or RPC error. Please retry 🌐";
    }

    // 6. Generic Fallback
    return error.shortMessage || error.message || "Transaction failed ⚠️";
}
