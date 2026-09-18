"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

type SpeciesDialogProps = {
    trigger: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

// A generic dialog component that can be reused to display information or forms related to a (new) species.
export default function SpeciesDialog({
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange
}: SpeciesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>

                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                {children}
            </DialogContent>

        </Dialog>
    );
}