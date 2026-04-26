import { Page } from "@/service/api";
import { UserLoanApplicationResponse, UserLoanOfferResponse } from "@/service/modules/loan-application";

export const mockLoanApplications: Page<UserLoanApplicationResponse> = {
  content: [
    {
      id: 1,
      applicationId: BigInt("1001"),
      borrower: "0x1234...abcd",
      collateralType: "ETHER",
      collateralAmount: BigInt("50000000000000000"), // 0.05 ETH
      status: "PENDING_CREATED",
      timeCreated: "2024-04-01T12:00:00Z",
      createdAt: "2024-04-01T12:00:00Z",
      offerCount: BigInt("2"),
    },
    {
      id: 2,
      applicationId: BigInt("1002"),
      borrower: "0x1234...abcd",
      collateralType: "NFT",
      collateralAmount: BigInt("1"), // 1 NFT
      nft: {
        userAddress: "0x1234...abcd",
        id: 1,
        nftId: BigInt("1001"),
        user: "0x1234...abcd",
        nftAddress: "0xNFT...001",
        tokenId: BigInt("5001"),
        timeCreated: "2024-01-01T12:00:00Z",
        createdAt: "2024-01-01T12:00:00Z",
      },
      status: "ACCEPTED",
      timeAccepted: "2024-03-05T12:00:00Z",
      timeCreated: "2024-03-01T12:00:00Z",
      createdAt: "2024-03-01T12:00:00Z",
      offerId: BigInt("2001"),
      offerCount: BigInt("1"),
    },
    {
      id: 3,
      applicationId: BigInt("1003"),
      borrower: "0x1234...abcd",
      collateralType: "ETHER",
      collateralAmount: BigInt("100000000000000000"), // 0.1 ETH
      status: "CANCELED",
      timeCancelled: "2024-02-10T12:00:00Z",
      timeCreated: "2024-02-01T12:00:00Z",
      createdAt: "2024-02-01T12:00:00Z",
      offerCount: BigInt("0"),
    },
    {
      id: 4,
      applicationId: BigInt("1004"),
      borrower: "0x1234...abcd",
      collateralType: "NFT",
      collateralAmount: BigInt("1"), // 1 NFT
      nft: {
        userAddress: "0x1234...abcd",
        id: 2,
        nftId: BigInt("1002"),
        user: "0x1234...abcd",
        nftAddress: "0xNFT...002",
        tokenId: BigInt("5002"),
        timeCreated: "2024-02-01T12:00:00Z",
        createdAt: "2024-02-01T12:00:00Z",
      },
      status: "PENDING_ACCEPTED",
      timeCreated: "2024-04-10T12:00:00Z",
      createdAt: "2024-04-10T12:00:00Z",
      offerCount: BigInt("1"),
    },
    {
      id: 5,
      applicationId: BigInt("1005"),
      borrower: "0x1234...abcd",
      collateralType: "ETHER",
      collateralAmount: BigInt("75000000000000000"), // 0.075 ETH
      status: "CREATED",
      timeCreated: "2024-04-12T09:30:00Z",
      createdAt: "2024-04-12T09:30:00Z",
      offerCount: BigInt("0"),
    },
    {
      id: 6,
      applicationId: BigInt("1006"),
      borrower: "0x1234...abcd",
      collateralType: "NFT",
      collateralAmount: BigInt("1"),
      nft: {
        userAddress: "0x1234...abcd",
        id: 3,
        nftId: BigInt("1003"),
        user: "0x1234...abcd",
        nftAddress: "0xNFT...003",
        tokenId: BigInt("5003"),
        timeCreated: "2024-03-21T10:00:00Z",
        createdAt: "2024-03-21T10:00:00Z",
      },
      status: "PENDING_CANCELED",
      timeCreated: "2024-04-15T11:45:00Z",
      createdAt: "2024-04-15T11:45:00Z",
      offerCount: BigInt("1"),
    },
  ],
  totalElements: 6,
  totalPages: 1,
  size: 10,
  number: 0,
};

export const mockLoanOffers: Page<UserLoanOfferResponse> = {
  content: [
    {
      id: 1,
      offerId: BigInt("2001"),
      applicationId: BigInt("1002"),
      lender: "0x5678...efgh",
      loanAmount: BigInt("2000000000"), // 2000 USDC with 6 decimals
      interestRate: BigInt("5"), // 5% monthly
      duration: BigInt("12"), // 12 months
      status: "CREATED",
      timeCreated: "2024-03-02T12:00:00Z",
      createdAt: "2024-03-02T12:00:00Z",
    },
    {
      id: 2,
      offerId: BigInt("2002"),
      applicationId: BigInt("1001"),
      lender: "0x5678...efgh",
      loanAmount: BigInt("1000000000"), // 1000 USDC with 6 decimals
      interestRate: BigInt("3"), // 3% monthly
      duration: BigInt("6"), // 6 months
      status: "CANCELED",
      timeCreated: "2024-04-02T12:00:00Z",
      timeCancelled: "2024-04-04T14:20:00Z",
      createdAt: "2024-04-02T12:00:00Z",
    },
    {
      id: 3,
      offerId: BigInt("2003"),
      applicationId: BigInt("1004"),
      lender: "0x5678...efgh",
      loanAmount: BigInt("1500000000"), // 1500 USDC with 6 decimals
      interestRate: BigInt("4"), // 4% monthly
      duration: BigInt("9"), // 9 months
      status: "PENDING_CREATED",
      timeCreated: "2024-04-11T12:00:00Z",
      createdAt: "2024-04-11T12:00:00Z",
    },
    {
      id: 4,
      offerId: BigInt("2004"),
      applicationId: BigInt("1006"),
      lender: "0x9abc...1234",
      loanAmount: BigInt("2200000000"), // 2200 USDC with 6 decimals
      interestRate: BigInt("6"), // 6% monthly
      duration: BigInt("10"), // 10 months
      status: "PENDING_CANCELED",
      timeCreated: "2024-04-16T08:15:00Z",
      createdAt: "2024-04-16T08:15:00Z",
    }
  ],
  totalElements: 4,
  totalPages: 1,
  size: 10,
  number: 0,
};
