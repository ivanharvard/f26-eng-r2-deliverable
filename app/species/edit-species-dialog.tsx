"use client";

import { Button } from "@/components/ui/button";
import SpeciesDialog from "./species-dialog";
import SpeciesForm, { speciesSchema, type SpeciesFormData } from "./species-form";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = SpeciesFormData;
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function EditSpeciesDialog({ species }: { species: Species }) {
    const router = useRouter();

    const [open, setOpen] = useState<boolean>(false);

    // Prefill form with current values
    const defaultValues: Partial<FormData> = {
        scientific_name: species.scientific_name,
        common_name: species.common_name,
        kingdom: species.kingdom,
        total_population: species.total_population,
        image: species.image,
        description: species.description,
    };

    const form = useForm<FormData>({
        resolver: zodResolver(speciesSchema),
        defaultValues,
        mode: "onChange",
    });

    const onSubmit = async (input: FormData) => {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase
            .from("species")
            .update({
                common_name: input.common_name,
                scientific_name: input.scientific_name,
                kingdom: input.kingdom,
                total_population: input.total_population,
                image: input.image,
                description: input.description,
            })
            .eq("id", species.id);

        if (error) {
            return toast({
                title: "Error updating species.",
                description: error.message,
                variant: "destructive",
            });
        }


        // Reset to saved values and close the dialog
        form.reset(input);
        setOpen(false);
        router.refresh();
        toast({
            title: "Species updated.",
            description: `${input.scientific_name} has been updated.`,
        });
    };

    return (
        <SpeciesDialog
            open={open}
            onOpenChange={setOpen}
            title="Edit Species"
            description="Edit the details of this species here. Click 'Save Changes' below when you're done."
            trigger={
                <Button size="sm" variant="secondary" className="h-8 w-8 rounded-full p-0" aria-label="Edit species">
                    <Pencil className="h-4 w-4" />
                </Button>
            }
        >
            <SpeciesForm form={form} onSubmit={onSubmit} submitLabel="Save Changes" />
        </SpeciesDialog>
    );
}