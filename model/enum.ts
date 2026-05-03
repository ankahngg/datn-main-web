export type BankAsset = "ETHER" | "USDC" | "NFT";
export type BankAction = "DEPOSIT" | "WITHDRAW";

export type TransactionStatus = "PROCESSING" | "DONE" | "FAILED";

export type LoanStatusResponse = 
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_PAID"
  | "PAID"
  | "PENDING_AUCTION"
  | "AUCTION"
  | "PENDING_LIQUIDATION"
  | "LIQUIDATED";

  export type ApplicationStatusResponse =
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_ACCEPTED"
  | "ACCEPTED"
  | "PENDING_CANCELED"
  | "CANCELED";

export type UserNFTResponseStatus = "DEPOSITED" | "WITHDRAWN" | "PENDING_DEPOSIT" | "PENDING_WITHDRAW" | "COLLATERALIZED";

export type CollateralType = "ETHER" | "NFT";
export type PayActionResponse = "PAY" | "END";