import type {
  BankAction as BankActionResponse,
  BankAsset,
  TransactionStatus as TransactionStatusResponse,
} from "@/service/modules/bank-transaction";

export type BankAction = BankActionResponse;
export type TransactionStatus = TransactionStatusResponse;
export type BankActionLabel = "Gửi" | "Rút";
export type TxStatus = "Đang xử lý" | "Thành công" | "Thất bại";
export type NftDepositStatus = "Đã gửi" | "Đã rút";

export const bankActionLabelMap: Record<BankAction, BankActionLabel> = {
  DEPOSIT: "Gửi",
  WITHDRAW: "Rút",
};

export const transactionStatusVariantMap: Record<TransactionStatus, "warning" | "success" | "danger"> = {
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

export const transactionStatusLabelMap: Record<TransactionStatus, TxStatus> = {
  PROCESSING: "Đang xử lý",
  DONE: "Thành công",
  FAILED: "Thất bại",
};

export type AssetBalance = {
  symbol: BankAsset;
  name: string;
  amount: string;
  unit: string;
};

export type Transaction = {
  id: number;
  type: BankAction;
  asset: BankAsset;
  amount: string;
  time: string;
  status: TransactionStatus;
};

export type AssetTransferSubmitValues = {
  action: BankActionLabel;
  asset: BankAsset;
  amount: number;
  nftName?: string;
  nftDescription?: string;
  nftAddress?: string;
  tokenId?: string;
  withdrawNftId?: string;
};


export type NftDeposit = {
  id: number;
  nftAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  depositedAt: string;
  status: NftDepositStatus;
};
