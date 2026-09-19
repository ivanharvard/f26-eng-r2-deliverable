"use client";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// zod handles validation of the input values with methods like .string(), .nullable(). It also processes the form inputs with .transform() before the inputs are sent to the database.

// Define kingdom enum for use in Zod schema and displaying dropdown options in the form
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

// Use Zod to define the shape + requirements of a Species entry; used in form validation
export const speciesSchema = z.object({
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z
    .string()
    .url()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

export type SpeciesFormData = z.infer<typeof speciesSchema>;

export default function SpeciesForm({
  form,
  onSubmit,
  submitLabel,
}: {
  form: UseFormReturn<SpeciesFormData>;
  onSubmit: (input: SpeciesFormData) => unknown;
  submitLabel: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="scientific_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scientific Name</FormLabel>
                <FormControl>
                  <Input placeholder="Cavia porcellus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="common_name"
            render={({ field }) => {
              // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
              const { value, ...rest } = field;
              return (
                <FormItem>
                  <FormLabel>Common Name</FormLabel>
                  <FormControl>
                    <Input value={value ?? ""} placeholder="Guinea pig" {...rest} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="kingdom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kingdom</FormLabel>
                <Select onValueChange={(value) => field.onChange(kingdoms.parse(value))} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a kingdom" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {kingdoms.options.map((kingdom, index) => (
                        <SelectItem key={index} value={kingdom}>
                          {kingdom}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="total_population"
            render={({ field }) => {
              const { value, ...rest } = field;
              return (
                <FormItem>
                  <FormLabel>Total population</FormLabel>
                  <FormControl>
                    {/* Using shadcn/ui form with number: https://github.com/shadcn-ui/ui/issues/421 */}
                    <Input
                      type="number"
                      value={value ?? ""}
                      placeholder="300000"
                      {...rest}
                      onChange={(event) => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => {
              // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
              const { value, ...rest } = field;
              return (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      value={value ?? ""}
                      placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/George_the_amazing_guinea_pig.jpg/440px-George_the_amazing_guinea_pig.jpg"
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
              const { value, ...rest } = field;
              return (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={value ?? ""}
                      placeholder="The guinea pig or domestic guinea pig, also known as the cavy or domestic cavy, is a species of rodent belonging to the genus Cavia in the family Caviidae."
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="flex">
            <Button type="submit" className="ml-1 mr-1 flex-auto">
              {submitLabel}
            </Button>
            <DialogClose asChild>
              <Button type="button" className="ml-1 mr-1 flex-auto" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </form>
    </Form>
  );
}
