import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";
import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

type SpeciesListProps = {
  searchParams: Promise<{
    view?: string;
  }>;
}

export default async function SpeciesList({ 
  searchParams,
}: SpeciesListProps) {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = session.user.id;

  const { view } = await searchParams;
  const showingMySpecies = view === "mine";
  
  let speciesQuery = supabase
    .from("species")
    .select("*")
    .order("id", { ascending: false });

  // Only retrieve the signed-in user's species when "My Species" is selected
  if (showingMySpecies) {
    speciesQuery = speciesQuery.eq("author", sessionId);
  }

  const { data: species } = await speciesQuery;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <AddSpeciesDialog userId={sessionId} />
      </div>
      <Separator className="my-4" />
      {/* Species filter */}
      <div className="mb-6 flex gap-2">
        <Button
          asChild
          variant={!showingMySpecies ? "default" : "secondary"}
        >
          <Link href="/species">All Species</Link>
        </Button>

        <Button
          asChild
          variant={showingMySpecies ? "default" : "secondary"}
        >
          <Link href="/species?view=mine">My Species</Link>
        </Button>
      </div>
      {/* End species filter */}
      <div className="flex flex-wrap justify-center">
        {species?.map((species) => (
          <SpeciesCard 
            key={species.id} 
            species={species} 
            currentUserId={sessionId} 
          />
        ))}
      </div>
    </>
  );
}
