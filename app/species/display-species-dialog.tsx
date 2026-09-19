"use client";

import { Button } from "@/components/ui/button";
import SpeciesDialog from "./species-dialog";

interface Species {
    scientific_name: string;
    common_name: string | null;
    total_population: number | null;
    kingdom: string;
    description: string | null;
}

export default function DisplaySpeciesDialog({ species }: { species: Species }) {
  return (
    <SpeciesDialog
      trigger={<Button className="mt-3 w-full">Learn More</Button>}
      title={species.scientific_name}
      description={species.common_name ?? undefined}
    >
        <div className="grid gap-4">
            <div>
                <strong>Scientific Name:</strong>{" "}
                {species.scientific_name}
            </div>

            <div>
                <strong>Common Name:</strong>{" "}
                {species.common_name ?? "Unknown"}
            </div>

            <div>
                <strong>Total Population:</strong>{" "}
                {species.total_population?.toLocaleString() ?? "Unknown"}
            </div>

            <div>
                <strong>Kingdom:</strong> {species.kingdom}
            </div>

            <div>
                <strong>Description:</strong>{" "}
                {species.description ?? "No description available."}
            </div>
      </div>
    </SpeciesDialog>
  );
}