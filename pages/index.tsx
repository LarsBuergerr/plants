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
import WaterBubble from "@/components/water-bubble";
import { useRouter } from "next/router";

export default function IndexPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currUid } = useSelector((state: RootState) => state.app);
  const { plants } = useSelector((state: RootState) => state.plants);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<
    (Models.Document & PlantWithImages) | undefined
  >(undefined);

  useEffect(() => {
    if (typeof currUid === "string") {
      dispatch(fetchPlants(currUid));
    }
  }, [currUid, dispatch]);

  const handleAddPlant = () => {
    setSelectedPlant(undefined);
    setIsModalOpen(true);
  };

  const handleEditPlant = (plant: Models.Document & PlantWithImages) => {
    setSelectedPlant(plant);
    setIsModalOpen(true);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 pb-4 md:py-10">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold">my collection</h2>
          <Button
            className="text-white"
            variant="solid"
            color="primary"
            startContent="add"
            onPress={handleAddPlant}
          >
            add plant
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Card className="relative" key={plant.$id}>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex justify-between w-full items-center">
                  <p className="text-sm font-bold line-clamp-2 font-serif pr-2">
                    {plant.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <WaterBubble plant={plant} />
                  </div>
                </div>
                <h4 className="hidden md:block lg:block font-bold text-large">
                  {new Date(plant.lastWateredAt).toLocaleString()}
                </h4>
              </CardHeader>
              <CardBody
                className="overflow-visible py-2"
                onClick={() => {
                  router.push(`/plant/${plant.$id}`);
                }}
              >
                <div className="aspect-square md:aspect-5/6 w-full overflow-hidden rounded-xl">
                  <Image
                    alt={plant.name}
                    className="object-cover rounded-xl w-full"
                    src={plant.headerImageUrl}
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <AddPlantModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plant={selectedPlant}
      />
    </DefaultLayout>
  );
}
