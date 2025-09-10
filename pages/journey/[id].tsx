import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/store";
import DefaultLayout from "@/layouts/default";
import { fetchPlantById } from "@/store/plantSlice";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { EditIcon } from "@/components/icons";
import { emojiMap } from "@/components/emoji-picker-modal";
import { Card, CardHeader } from "@heroui/card";
import { SquarePen } from "lucide-react";
import AddJourneyEntryModal from "@/components/add-journey-entry-modal";
import { fetchJourneyEntries } from "@/store/plantSlice";
import { JourneyEntryWithUrl } from "@/types/journey_entry.type";

export default function PlantPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { plants, loading } = useSelector((state: RootState) => state.plants);
  const plant = plants.find((p) => p.$id === id);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const { entriesByPlant } = useSelector((state: RootState) => state.plants);
  const entryState = entriesByPlant[id as string] || {
    entries: [],
    hasMore: true,
  };
  const [editingEntry, setEditingEntry] = useState<JourneyEntryWithUrl | null>(
    null
  );

  const handleEdit = (entry: JourneyEntryWithUrl) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  useEffect(() => {
    if (id && typeof id === "string" && entryState.entries.length === 0) {
      dispatch(fetchJourneyEntries({ plantId: id, limit: 5 }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && typeof id === "string" && !plant) {
      dispatch(fetchPlantById({ id }));
    }
  }, [id, plant, dispatch]);

  if (loading || !plant) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <p>Loading plant...</p>
        </div>
      </DefaultLayout>
    );
  }

  const sortedEntries = [...entryState.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-xl md:text-3xl lg:text-3xl font-bold font-serif">
            {plant.name}’s journey
          </h1>
          <div className="flex gap-2 items-center">
            <Button
              color="primary"
              className="text-white"
              size="sm"
              onPress={() => {
                setEditingEntry(null);
                setIsEntryModalOpen(true);
              }}
            >
              new entry <EditIcon />
            </Button>
          </div>
        </div>

        <div className="flex flex-col">
          {sortedEntries.length === 0 && (
            <p className="text-center italic text-gray-500">
              no journey entries yet. add one!
            </p>
          )}

          {sortedEntries.map((entry) => {
            const Icon = entry.icon ? emojiMap[entry.icon] : null;

            return (
              <div key={entry.$id} className="flex gap-4 pr-2">
                <div className="flex flex-col items-center">
                  <Divider orientation="vertical" className="flex-1 w-1" />

                  {Icon && (
                    <div className="bg-white p-1 rounded-full z-10 border border-gray-300 p-2">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                  )}

                  <Divider orientation="vertical" className="flex-1 w-1" />
                </div>

                <div className="my-4 flex-1">
                  <Card className="px-4 py-2">
                    <CardHeader className="p-0 pb-4 text-sm text-gray-500 justify-between flex gap-5">
                      {new Date(entry.date).toDateString()}

                      <Button
                        size="sm"
                        isIconOnly
                        color="primary"
                        className="rounded-full"
                        onPress={() => handleEdit(entry)}
                      >
                        <SquarePen className="w-4 h-4" color="white" />
                      </Button>
                    </CardHeader>

                    {entry.imageId && (
                      <div className="my-2">
                        <Image
                          src={
                            entryState.entries.find((e) => e.$id === entry.$id)
                              ?.imageUrl || ""
                          }
                          alt="Journey Image"
                        />
                      </div>
                    )}
                    {entry.comment && (
                      <p className="whitespace-pre-wrap">{entry.comment}</p>
                    )}
                  </Card>
                </div>
              </div>
            );
          })}

          {entryState.hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                color="secondary"
                onPress={() =>
                  dispatch(
                    fetchJourneyEntries({
                      plantId: plant.$id,
                      limit: 5,
                      cursor: entryState.lastCursor,
                    })
                  )
                }
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </section>
      <AddJourneyEntryModal
        open={isEntryModalOpen}
        onOpenChange={setIsEntryModalOpen}
        plantId={plant.$id}
        existingEntry={editingEntry || undefined}
      ></AddJourneyEntryModal>
    </DefaultLayout>
  );
}
