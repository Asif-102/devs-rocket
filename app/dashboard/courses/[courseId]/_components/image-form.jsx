/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { UploadDropzone } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image-compression";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ImageForm = ({ initialData, courseId }) => {
  const [file, setFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
  const router = useRouter();

  useEffect(() => {
    if (file) {
      handleImageUpload(file);
    }
  }, [file]);

  const handleImageUpload = async (selectedFile) => {
    try {
      const compressedFile = await compressImage(selectedFile[0]); // Use the imported function
      await uploadFile(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(error.message);
    }
  };

  const uploadFile = async (compressedFile) => {
    try {
      const formData = new FormData();
      formData.append("files", compressedFile);
      formData.append("courseId", courseId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      const newImageUrl = result.url;

      setImageUrl(newImageUrl);
      toast.success("Image uploaded successfully!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message);
    }
  };

  const toggleEdit = () => setIsEditing((current) => !current);

  return (
    <div className="mt-6 border rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Image
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing && <>Cancel</>}
          {!isEditing && !imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an image
            </>
          )}
          {!isEditing && imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!imageUrl ? (
          <div className="flex items-center justify-center h-60 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt="Upload"
              fill
              className="object-cover rounded-md"
              src={imageUrl}
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <UploadDropzone onUpload={(file) => setFile(file)} />
          <div className="text-xs text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  );
};
