import { Page } from "@/service/api";
import { ApplicationStatusResponse } from "./enum";

export type UserLoanTransferOfferResponse = {
    id: number;
    offerId: bigint;
    applicationId : bigint;
    requester   : string;
    price : bigint;
    status: ApplicationStatusResponse;
    timeCreated: string;
    timeCancelled?: string;
    timeAccepted?: string;
    createdAt: string;
}

export type UserLoanTransferOffer = {
    id: number;
    offerId: bigint;
    applicationId : bigint;
    requester   : string;
    price : bigint;
    status: ApplicationStatusResponse;
    timeCreated: string;
    timeCancelled?: string;
    timeAccepted?: string;
    createdAt: string;
}

export type LoanTransferOfferFilter = {
    requester?: string;
    price?: bigint;
    status?: ApplicationStatusResponse;
    fromTimeCreated?: string; // local date-time string
    toTimeCreated?: string;   // local date-time string
}

export const LOAN_TRANSFER_OFFER_ACTIONS = [
    "ACCEPT_OFFER",
    "CANCEL_OFFER",
] as const;

export type LoanTransferOfferAction = typeof LOAN_TRANSFER_OFFER_ACTIONS[number];

export const LoanTransferOfferActionLabelMap: Record<LoanTransferOfferAction, string> = {
    ACCEPT_OFFER: "Chấp nhận offer",
    CANCEL_OFFER: "Hủy offer",
};


export type CreateLoanTransferOfferSubmitValues = {
    seller: string;
    price: bigint;
    transferId: bigint;
}

export type UpdateLoanTransferPriceSubmitValues = {
    transferId: bigint;
    newPrice: bigint;
}

export const mockLoanTransferOffersResponse: Page<UserLoanTransferOfferResponse> = {
    content: [
    {
      id: 1,
      offerId: BigInt("3001"),  
        applicationId: BigInt("1001"),  
        requester: "0xRequesterAddress1",
        price: BigInt("500000000"), // 500 USDC with 6 decimals
        status: "PENDING_CREATED",
        timeCreated: "2024-06-01T10:00:00Z",
        createdAt: "2024-06-01T10:00:00Z",
    },
    {
      id: 2,
      offerId: BigInt("3002"),
        applicationId: BigInt("1002"),
        requester: "0xRequesterAddress2",
        price: BigInt("1000000000"), // 1000 USDC with 6 decimals
        status: "ACCEPTED",
        timeCreated: "2024-06-02T11:00:00Z",
        createdAt: "2024-06-02T11:00:00Z",
    },
    {
      id: 3,
        offerId: BigInt("3003"),    
        applicationId: BigInt("1003"),
        requester: "0xRequesterAddress3",
        price: BigInt("1500000000"), // 1500 USDC with 6 decimals
        status: "CANCELED",
        timeCreated: "2024-06-03T12:00:00Z",
        createdAt: "2024-06-03T12:00:00Z",
    },
    {
        id: 4,
        offerId: BigInt("3004"),
        applicationId: BigInt("1004"),
        requester: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
        price: BigInt("1800000000"), // 2000 USDC with 6 decimals
        status: "CREATED",
        timeCreated: "2024-06-06T13:00:00Z",
        createdAt: "2024-06-06T13:00:00Z",
    }
    ],
    totalElements: 4,
    totalPages: 1,
    size: 10,
    number: 0,
};
