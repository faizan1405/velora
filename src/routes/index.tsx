import { createFileRoute } from "@tanstack/react-router";
import { Story } from "@/components/home/Story";
import { Collection } from "@/components/home/Collection";
import { Preloader } from "@/components/velora/Preloader";
import { Footer } from "@/components/velora/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VELORA — Radiance Serum | Skincare, distilled" },
      {
        name: "description",
        content:
          "Scroll through the VELORA Radiance Serum: 2% hyaluronic complex, 10% vitamin C, 5% niacinamide and peptides in one weightless drop. ₹2,499.",
      },
      { property: "og:title", content: "VELORA — Radiance Serum" },
      { property: "og:description", content: "A cinematic look inside the VELORA Radiance Serum. Skincare, distilled to its essence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <Preloader />
      <Story />
      <Collection />
      <Footer />
    </main>
  );
}
