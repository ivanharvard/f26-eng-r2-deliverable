"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import SpeciesDialog from "./species-dialog";
import SpeciesForm, { speciesSchema, type SpeciesFormData } from "./species-form";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = SpeciesFormData;

// Default values for the form fields.
/* Because the react-hook-form (RHF) used here is a controlled form (not an uncontrolled form),
fields that are nullable/not required should explicitly be set to `null` by default.
Otherwise, they will be `undefined` by default, which will raise warnings because `undefined` conflicts with controlled components.
All form fields should be set to non-undefined default values.
Read more here: https://legacy.react-hook-form.com/api/useform/
*/
const defaultValues: Partial<FormData> = {
  scientific_name: "",
  common_name: null,
  kingdom: "Animalia",
  total_population: null,
  image: null,
  description: null,
};

export default function AddSpeciesDialog({ userId }: { userId: string }) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);

  // Instantiate form functionality with React Hook Form, passing in the Zod schema (for validation) and default values
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (input: FormData) => {
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").insert([
      {
        author: userId,
        common_name: input.common_name,
        description: input.description,
        kingdom: input.kingdom,
        scientific_name: input.scientific_name,
        total_population: input.total_population,
        image: input.image,
      },
    ]);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    // Because Supabase errors were caught above, the remainder of the function will only execute upon a successful edit

    // Reset form values to the default (empty) values.
    // Practically, this line can be removed because router.refresh() also resets the form. However, we left it as a reminder that you should generally consider form "cleanup" after an add/edit operation.
    form.reset(defaultValues);

    setOpen(false);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();

    return toast({
      title: "New species added!",
      description: "Successfully added " + input.scientific_name + ".",
    });
  };

  return (
    <SpeciesDialog
      open={open}
      onOpenChange={setOpen}
      title="Add Species"
      description="Add a new species here. Click 'Add Species' below when you're done."
      trigger={
        <Button variant="secondary">
          <Icons.add className="mr-3 h-5 w-5" />
          Add Species
        </Button>
      }
    >
      <SpeciesForm form={form} onSubmit={onSubmit} submitLabel="Add Species" />
    </SpeciesDialog>
  );
}
