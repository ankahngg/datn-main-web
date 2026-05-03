"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    title: string;
    destination?: string;
}

function BackButton(props : BackButtonProps) {
    const router = useRouter();

     const handleBack = () => {
        if (window.history.length > 1) {
        router.back(); // 👈 quay về trang trước
        } else if (props.destination) {
        router.push(props.destination); // 👈 fallback nếu vào trực tiếp
        }
    };

    return (  
        <Button
           onClick={handleBack}
          className="italic text-foreground/80 hover:text-foreground hover:bg-sidebar"
        >
          <ArrowLeft className="size-4" />
            {props.title}
        </Button>
    );
}

export default BackButton;