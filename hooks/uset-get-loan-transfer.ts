import { UserLoanTransfer, UserLoanTransferResponse } from "@/model/LoanTransfer";
import { UserLoanTransferOffer, UserLoanTransferOfferResponse } from "@/model/LoanTransferOffer";
import { Page } from "@/service/api";
import { getUserLoanTransferById, getUserLoanTransfers, LoanTransferParams } from "@/service/modules/loan-transfer";
import { getLoanTransferOffersByTransferId, getUserLoanTransferOfferById, getUserTransferOffer, LoanTransferOfferParams } from "@/service/modules/loan-transfer-offer";
import { useQuery } from "@tanstack/react-query";


export function useGetLoanTransfers(params: LoanTransferParams) {
    const { filter, pageable } = params;
    return useQuery<Page<UserLoanTransferResponse>>({
        queryKey: ["loanTransfers", filter, pageable],
        queryFn: async () => {
            const data = await getUserLoanTransfers({
                filter,
                pageable,
            });
            return data;
        }
    });
}

export function useGetLoanTransfers2(params: LoanTransferParams) {
    const { filter, pageable } = params;
    return useQuery<UserLoanTransfer[]>({
        queryKey: ["loanTransfers", filter, pageable],
        queryFn: async () => {
            const data = await getUserLoanTransfers({
                filter,
                pageable,
            });

            const res: UserLoanTransfer[] = data.content.map((item) => ({
                id: item.id,
                transferId: item.transferId,
                loanId: item.loanId,
                seller: item.seller,
                buyer: item.buyer,
                price: item.price,
                status: item.status,
                acceptedOfferId: item.acceptedOfferId,
                timeCreated: item.timeCreated,
                timeCancelled: item.timeCancelled,
                timeAccepted: item.timeAccepted,
                acceptedPrice: item.acceptedPrice,
            }));
            return res;
        }
    });
}

export function useGetLoanTransferById(transferId: bigint | undefined) {
    return useQuery<UserLoanTransferResponse>({
        queryKey: ["loanTransfer", transferId],
        queryFn: async () => {
            if (!transferId) {
                throw new Error("Transfer ID is required");
            }
            const data = await getUserLoanTransferById(transferId);
            return data;
        }
    });
}

export function useGetLoanTransferById2(transferId: bigint | undefined) {
    return useQuery<UserLoanTransfer>({
        queryKey: ["loanTransfer", transferId?.toString()],
        queryFn: async () => {
            if (!transferId) {
                throw new Error("Transfer ID is required");
            }
            const data = await getUserLoanTransferById(transferId);
            const res: UserLoanTransfer = {
                id: data.id,
                transferId: data.transferId,
                loanId: data.loanId,
                seller: data.seller,
                buyer: data.buyer,
                price: data.price,
                acceptedOfferId: data.acceptedOfferId,
                status: data.status,
                timeCreated: data.timeCreated,
                timeCancelled: data.timeCancelled,
                timeAccepted: data.timeAccepted,
                acceptedPrice: data.acceptedPrice,
            };
            return res;
        }
    });
}

export function useGetLoanTransferOffer(params: LoanTransferOfferParams) {
    const { filter, pageable } = params;
    return useQuery<Page<UserLoanTransferOfferResponse>>({
        queryKey: ["loanTransferOffers", filter, pageable],
        queryFn: async () => {
            const data = await getUserTransferOffer({
                filter,
                pageable,
            });
            return data;
        }
    });
}

export function useGetLoanTransferOffer2(params: LoanTransferOfferParams) {
    const { filter, pageable } = params;
    return useQuery<UserLoanTransferOfferResponse[]>({
        queryKey: ["loanTransferOffers", filter, pageable],
        queryFn: async () => {
            const data = await getUserTransferOffer({
                filter,
                pageable,
            });
            const res: UserLoanTransferOfferResponse[] = data.content.map((item) => ({
                id: item.id,
                offerId: item.offerId,
                applicationId: item.applicationId,
                requester: item.requester,
                price: item.price,
                status: item.status,
                timeCreated: item.timeCreated,
                timeCancelled: item.timeCancelled,
                timeAccepted: item.timeAccepted,
                createdAt: item.createdAt,
            }));
            return res;
        }
    });
}

export function useGetLoanTransferOfferById(offerId: bigint | undefined) {
    return useQuery<UserLoanTransferOfferResponse>({
        queryKey: ["loanTransferOffer", offerId],
        queryFn: async () => {
            if (!offerId) {
                throw new Error("Offer ID is required");
            }
            const data = await getUserLoanTransferOfferById(offerId);
            return data;
        }
    });
}

export function useGetLoanTransferOfferById2(offerId: bigint | undefined) {
    return useQuery<UserLoanTransferOffer>({
        queryKey: ["loanTransferOffer", offerId],
        queryFn: async () => {
            if (!offerId) {
                throw new Error("Offer ID is required");
            }
            const data = await getUserLoanTransferOfferById(offerId);
            const res: UserLoanTransferOffer = {
                id: data.id,
                offerId: data.offerId,
                applicationId: data.applicationId,
                requester: data.requester,
                price: data.price,
                status: data.status,
                timeCreated: data.timeCreated,
                timeCancelled: data.timeCancelled,
                timeAccepted: data.timeAccepted,
                createdAt: data.createdAt,
            };
            return res;
        }
    });
}

export function useLoanTransferOffersByTransferId(transferId: bigint) {
    const enabled = Boolean(transferId);
    return useQuery<Page<UserLoanTransferOfferResponse>>({
        queryKey: ["loanTransferOffersByTransferId", transferId.toString()],
        queryFn: () => {
            if (!transferId) {
                throw new Error("Transfer ID is required");
            }
            return getLoanTransferOffersByTransferId(transferId);
        },
        enabled,
    });
}

export function useLoanTransferOffersByTransferId2(transferId: bigint) {
    const enabled = Boolean(transferId);
    return useQuery<UserLoanTransferOffer[]>({
        queryKey: ["loanTransferOffersByTransferId", transferId.toString()],
        queryFn: async () => {
            if (!transferId) {
                throw new Error("Transfer ID is required");
            }
            const data = await getLoanTransferOffersByTransferId(transferId);
            const res: UserLoanTransferOffer[] = data.content.map((item) => ({
                id: item.id,
                offerId: item.offerId,
                applicationId: item.applicationId,
                requester: item.requester,
                price: item.price,
                status: item.status,
                timeCreated: item.timeCreated,
                timeCancelled: item.timeCancelled,
                timeAccepted: item.timeAccepted,
                createdAt: item.createdAt,
            }));
            return res;
        },
        enabled,
    }); 
}