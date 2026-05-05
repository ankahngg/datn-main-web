import { UserLoanTransfer } from "@/model/LoanTransfer";

type Props = {
    data: UserLoanTransfer;
    onCancel: (transferId: bigint) => void;
    txMessage?: string | null;
    txStatus?: "idle" | "success" | "error" | null;
    isSubmtting?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};



function CancelTransferApplicationDialog(props: Props) {
    const {
        data,
        onCancel,
        txMessage,
        txStatus,
        isSubmtting,
        open,
        onOpenChange,
    } = props;
    
    return ( 
        // <Dialog open={open} onOpenChange={onOpenChange}>

        // </Dialog>
        <>
        </>


    );
}

export default CancelTransferApplicationDialog;