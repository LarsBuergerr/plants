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
import { Droplets } from "lucide-react";
import DateBubble from "@/components/date-bubble";

export default function IndexPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currUid } = useSelector((state: RootState) => state.app);
  const { plants, loading } = useSelector((state: RootState) => state.plants);

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
          <h2 className="text-2xl font-bold">my collection &lt;3 </h2>
          <div className="flex gap-2">
            <Button
              isIconOnly
              className="text-white"
              variant="solid"
              color="secondary"
              startContent="add"
              onPress={handleAddPlant}
            >
              <CheckCircleIcon />
            </Button>
            <Button
              isIconOnly
              className="text-white"
              variant="solid"
              color="primary"
              startContent="add"
              onPress={handleAddPlant}
            >
              <PlusCircleIcon />
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
                <h4 className="hidden md:block lg:block font-bold text-small text-default-500">
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
                className="overflow-visible py-3 px-3"
                onClick={() => router.push(`/plant/${plant.$id}`)}
              >
                <div className="relative aspect-square md:aspect-5/6 w-full overflow-hidden rounded-xl">
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
    </DefaultLayout>
  );
}
