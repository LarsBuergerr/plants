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
import { Plant, PlantWithImages } from "@/types/plant.type";

export default function IndexPage() {
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
    console.log(plants);
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
      <section className="flex flex-col gap-6 py-8 md:py-10">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold">Plant Collection</h2>
          <Button
            variant="solid"
            color="primary"
            startContent="Add Plant"
            onPress={handleAddPlant}
          >
            Add Plant
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Card className="relative py-4" key={plant.$id}>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex justify-between w-full items-center">
                  <p className="text-tiny uppercase font-bold">{plant.name}</p>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleEditPlant(plant)}
                  >
                    Edit
                  </Button>
                </div>
                <h4 className="font-bold text-large">
                  {new Date(plant.lastWateredAt).toLocaleString()}
                </h4>
              </CardHeader>
              <CardBody className="overflow-visible py-2">
                <Image
                  alt={plant.name}
                  className="object-cover rounded-xl w-full"
                  src={plant.headerImageUrl}
                />
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
