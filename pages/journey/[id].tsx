import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/store";
import DefaultLayout from "@/layouts/default";
import { fetchPlantById } from "@/store/plantSlice";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { CommentIcon, EditIcon, ImageIcon } from "@/components/icons";
import AddJourneyCommentModal from "@/components/add-journey-comment-modal";
import AddJourneyImageModal from "@/components/add-journey-image-modal";
import { JourneyImageWithUrl } from "@/types/journey_image.type";
import { storage } from "@/lib/appwrite";

export default function PlantPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { plants, loading } = useSelector((state: RootState) => state.plants);
  const plant = plants.find((p) => p.$id === id);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [journeyImagesWithUrl, setJourneyImagesWithUrl] = useState<
    JourneyImageWithUrl[]
  >([]);

  useEffect(() => {
    if (id && typeof id === "string" && !plant) {
      dispatch(fetchPlantById({ id }));
    }

    if (plant && plant.journeyImages.length > 0) {
      const imagesWithUrls: JourneyImageWithUrl[] = plant.journeyImages.map(
        (image) => ({
          ...image,
          imageUrl: storage.getFileView("plant_journey_images", image.imageId),
        })
      );
      setJourneyImagesWithUrl(imagesWithUrls);
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

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-3xl font-bold font-serif">
            {plant.name}'s journey
          </h1>
          <div className="flex gap-2 items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button color="primary" className="text-white">
                  new entry <EditIcon></EditIcon>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem
                  key="comment"
                  endContent={<ImageIcon></ImageIcon>}
                  onClick={() => setIsImageModalOpen(true)}
                >
                  add image
                </DropdownItem>
                <DropdownItem
                  key="image"
                  endContent={<CommentIcon></CommentIcon>}
                  onClick={() => setIsCommentModalOpen(true)}
                >
                  add comment
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {plant.journeyComments.length === 0 && (
            <p className="text-center italic text-gray-500">
              no journey entries yet. add one!
            </p>
          )}
          {plant.journeyComments
            .slice()
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((comment) => (
              <div
                key={comment.$id}
                className="border rounded-lg p-4 bg-white shadow"
              >
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(comment.date).toLocaleString()}
                </p>
                <p className="whitespace-pre-line">{comment.comment}</p>
              </div>
            ))}
          {journeyImagesWithUrl
            .slice()
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((image) => (
              <div
                key={image.$id}
                className="border rounded-lg p-4 bg-white shadow flex flex-col gap-2"
              >
                <p className="text-sm text-gray-500">
                  {new Date(image.date).toLocaleString()}
                </p>
                {image.imageUrl && (
                  <img
                    src={image.imageUrl}
                    alt="Journey image"
                    className="rounded-lg object-cover max-h-64 w-full"
                  />
                )}
              </div>
            ))}
        </div>
      </section>
      <AddJourneyCommentModal
        open={isCommentModalOpen}
        onOpenChange={setIsCommentModalOpen}
        plantId={plant.$id}
      ></AddJourneyCommentModal>
      <AddJourneyImageModal
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        plantId={plant.$id}
      ></AddJourneyImageModal>
    </DefaultLayout>
  );
}
