export type AssetSymbol = "ETH" | "USDC" | "NFT";
export type TxType = "Gửi" | "Rút";
export type TxStatus = "Thành công" | "Đang xử lý" | "Thất bại";

export type AssetBalance = {
  symbol: AssetSymbol;
  name: string;
  amount: string;
  unit: string;
};

export type Transaction = {
  id: number;
  type: TxType;
  asset: AssetSymbol;
  amount: string;
  time: string;
  status: TxStatus;
  
};

export type AssetTransferSubmitValues = {
  action: TxType;
  asset: AssetSymbol;
  amount: number;
  nftName?: string;
  nftDescription?: string;
  nftAddress?: string;
  tokenId?: string;
  withdrawNftId?: string;
};

export type NftDepositStatus = "Đã gửi" | "Đã rút";

export type NftDeposit = {
  id: number;
  nftAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  depositedAt: string;
  status: NftDepositStatus;
};
