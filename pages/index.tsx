import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchPlants } from "@/store/plantSlice";

import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";

import AddPlantModal from "@/components/add-plant-modal";
import { Models } from "appwrite";
import { PlantWithImages } from "@/types/plant.type";
import WaterBubble from "@/components/date-bubble";
import { useRouter } from "next/router";
import { CheckCircleIcon, PlusCircleIcon } from "@/components/icons";
import {
  Archive,
  Circle,
  CircleCheck,
  CircleCheckBig,
  CirclePlus,
  Droplets,
  SprayCan,
} from "lucide-react";
import DateBubble from "@/components/date-bubble";
import MultiActionModal from "@/components/multi-action-modal";

export default function IndexPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currUid } = useSelector((state: RootState) => state.app);
  const { plants, loading } = useSelector((state: RootState) => state.plants);

  const [editMode, setEditMode] = useState(false);
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "water" | "fertilize" | "repot" | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<
    (Models.Document & PlantWithImages) | undefined
  >(undefined);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (typeof currUid === "string") {
      dispatch(fetchPlants({ uid: currUid, limit: 30 }));
    }
  }, [currUid, dispatch]);

  const handleLoadMore = async () => {
    if (!plants.length) return;

    const lastDocId = plants[plants.length - 1].$id;
    const result = await dispatch(
      fetchPlants({ uid: currUid!, limit: 18, cursor: lastDocId })
    ).unwrap();

    if (result.data.length === 0) {
      setHasMore(false);
    }
  };

  const handleAddPlant = () => {
    setSelectedPlant(undefined);
    setIsModalOpen(true);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 pb-4 md:py-10">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          {!editMode ? (
            <h2 className="text-2xl font-bold">my collection &lt;3 </h2>
          ) : (
            <div className="gap-2 flex">
              <Button
                className="text-white"
                isIconOnly
                color="secondary"
                onPress={() => {
                  if (selectedPlants.size === 0) return;
                  setBulkAction("water");
                  setBulkModalOpen(true);
                }}
              >
                <Droplets />
              </Button>

              <Button
                className="text-white"
                isIconOnly
                color="secondary"
                onPress={() => {
                  if (selectedPlants.size === 0) return;
                  setBulkAction("fertilize");
                  setBulkModalOpen(true);
                }}
              >
                <SprayCan />
              </Button>

              <Button
                className="text-white"
                isIconOnly
                color="secondary"
                onPress={() => {
                  console.log(selectedPlants);
                  if (selectedPlants.size === 0) return;
                  setBulkAction("repot");
                  setBulkModalOpen(true);
                }}
              >
                <Archive />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              isIconOnly
              className="text-white"
              variant="solid"
              color="secondary"
              onPress={() => {
                setSelectedPlants(new Set());
                setEditMode(!editMode);
              }}
            >
              <CircleCheckBig />
            </Button>
            <Button
              isIconOnly
              className="text-white"
              variant="solid"
              color="primary"
              startContent="add"
              onPress={handleAddPlant}
            >
              <CirclePlus />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {plants.map((plant) => (
            <Card className="relative" key={plant.$id}>
              <CardHeader className="pb-0 pt-2 px-3 flex-col items-start min-h-[3em] md:min-h-[80px]">
                <div className="flex justify-between w-full items-center">
                  <p className="text-small font-bold line-clamp-2 font-serif w-full pr-1">
                    {plant.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <DateBubble
                      type="water"
                      plant={plant}
                      width={30}
                      height={30}
                    />
                  </div>
                </div>
                <h4 className="hidden md:block lg:block font-bold text-small text-default-500 line-clamp-1">
                  {plant.botanicalName || "\u00A0"}
                </h4>
                <div className="flex flex-row gap-2">
                  <Droplets width={20} className="hidden md:block lg:block" />
                  <h4 className="hidden md:block lg:block font-bold text-md">
                    {new Date(plant.lastWateredAt).toDateString()}
                  </h4>
                </div>
              </CardHeader>

              <CardBody
                className={`overflow-visible py-3 px-3 relative ${
                  editMode ? "z-2 cursor-pointer" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (editMode) {
                    const newSelectedPlants = new Set(selectedPlants);
                    if (selectedPlants.has(plant.$id)) {
                      newSelectedPlants.delete(plant.$id);
                    } else {
                      newSelectedPlants.add(plant.$id);
                    }
                    setSelectedPlants(newSelectedPlants);
                  } else {
                    router.push(`/plant/${plant.$id}`);
                  }
                }}
              >
                {editMode && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-transparent rounded-full">
                      {selectedPlants.has(plant.$id) ? (
                        <CircleCheck className="text-white w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" />
                      ) : (
                        <Circle className="text-white w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" />
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`relative aspect-square md:aspect-5/6 w-full overflow-hidden rounded-xl ${
                    editMode ? "opacity-50" : ""
                  }`}
                >
                  <Image
                    loading="eager"
                    alt={plant.name}
                    src={plant.headerImageUrl}
                    classNames={{
                      wrapper: "w-full h-full",
                      img: "w-full h-full object-cover",
                    }}
                    removeWrapper
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-2">
            <Button
              onPress={handleLoadMore}
              disabled={loading}
              variant="flat"
              color="primary"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </section>

      <AddPlantModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plant={selectedPlant}
      />

      {bulkAction && (
        <MultiActionModal
          open={bulkModalOpen}
          onOpenChange={(open) => {
            setBulkModalOpen(open);
            // if modal closes, turn off edit mode
            if (!open) setEditMode(false);
          }}
          selectedIds={Array.from(selectedPlants)}
          actionType={bulkAction}
          onCloseComplete={() => setEditMode(false)} // <-- NEW CALLBACK
        />
      )}
    </DefaultLayout>
  );
}
