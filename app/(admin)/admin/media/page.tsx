import { MediaUploader } from "@/components/admin/media-uploader";

export const metadata = { title: "Media — Admin" };

export default function Page() {
  return (
    <div className="p-10">
      <h1 className="text-display text-4xl mb-2">Media</h1>
      <p className="text-stone text-sm mb-8 max-w-2xl">
        Upload images here and copy the URL into any image field in the admin.
      </p>
      <MediaUploader />
    </div>
  );
}
