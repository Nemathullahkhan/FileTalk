// actions/upload.ts
"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadImage(formData: FormData) {
  const imageFile = formData.get("image") as File;

  if (!imageFile) {
    throw new Error("No image file provided");
  }

  const blob = await put(imageFile.name, imageFile, {
    access: "public",
    addRandomSuffix: true,
  });

  revalidatePath("/");
  return blob;
}
