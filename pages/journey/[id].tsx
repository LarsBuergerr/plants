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
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { CommentIcon, EditIcon, ImageIcon } from "@/components/icons";
import AddJourneyCommentModal from "@/components/add-journey-comment-modal";
import AddJourneyImageModal from "@/components/add-journey-image-modal";
import { JourneyImageWithUrl } from "@/types/journey_image.type";
import { storage } from "@/lib/appwrite";
import { emojiMap } from "@/components/emoji-picker-modal";
import { Card, CardHeader } from "@heroui/card";
import { SquarePen } from "lucide-react";

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
          imageUrl: storage.getFilePreview(
            "plant_journey_images",
            image.imageId
          ),
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

  const journeyEntries = [
    ...plant.journeyComments.map((c) => ({
      type: "comment" as const,
      id: c.$id,
      date: new Date(c.date),
      icon: c.icon,
      content: c.comment,
    })),
    ...journeyImagesWithUrl.map((img) => ({
      type: "image" as const,
      id: img.$id,
      date: new Date(img.date),
      icon: img.icon,
      imageUrl: img.imageUrl,
    })),
  ];

  journeyEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-xl md:text-3xl lg:text-3xl font-bold font-serif">
            {plant.name}'s journey
          </h1>
          <div className="flex gap-2 items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button color="primary" className="text-white" size="sm">
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

        <div className="flex flex-col">
          {journeyEntries.length === 0 && (
            <p className="text-center italic text-gray-500">
              no journey entries yet. add one!
            </p>
          )}

          {journeyEntries.map((entry) => {
            const Icon = entry.icon ? emojiMap[entry.icon] : null;

            return (
              <div key={entry.id} className="flex gap-4 pr-2">
                <div className="flex flex-col items-center">
                  {/* Top divider */}
                  <Divider orientation="vertical" className="flex-1 w-1" />

                  {/* Icon */}
                  {Icon && (
                    <div className="bg-white p-1 rounded-full z-10 border border-gray-300 p-2">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                  )}

                  {/* Bottom divider */}
                  <Divider orientation="vertical" className="flex-1 w-1" />
                </div>

                {/* Content */}
                <div className="my-4 flex-1">
                  <Card className="px-4 py-2">
                    <CardHeader className="p-0 pb-4 text-sm text-gray-500 justify-between flex gap-5">
                      {entry.date.toLocaleString()}

                      <Button
                        size="sm"
                        isIconOnly
                        color="primary"
                        className="rounded-full"
                      >
                        <SquarePen className="w-4 h-4" color="white" />
                      </Button>
                    </CardHeader>

                    {entry.type === "comment" ? (
                      <p className="whitespace-pre-line">{entry.content}</p>
                    ) : (
                      entry.imageUrl && (
                        <div className="pb-2">
                          <Image
                            src={entry.imageUrl}
                            alt="Journey image"
                            className="rounded-lg object-cover max-h-64"
                          />
                        </div>
                      )
                    )}
                  </Card>
                </div>
              </div>
            );
          })}
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
