import { Carousel } from "@/components/ui/carousel";
import { DraggableCarousel } from "@/components/ui/draggable-carousel";

export default function Home() {
  const slides = [
    {
      title: "Image One",
      src: "/images/ab8c21a9741290ba5f9bb21dd1980caa.webp"
    },
    {
      title: "Image Two",
      src: "/images/9d565b2dfe70719551ec688284f764eb.webp"
    },
    {
      title: "Image Three",
      src: "/images/df174e738d4cb43c39208a3faeabc68d.webp"
    },
    {
      title: "Image Four",
      src: "/images/9d03205f2bb020378b3bfb8c706f7047.webp"
    },
    {
      title: "Image Five",
      src: "/images/7854f74890466b02996a576760e27a12.webp"
    },
    {
      title: "Image Six",
      src: "/images/1ffa2858e9e9fb3ac5fb11fbf52489fe.webp"
    },
    {
      title: "Image Seven",
      src: "/images/ab8c21a9741290ba5f9bb21dd1980caa.webp"
    },
    {
      title: "Image Eight",
      src: "/images/9d565b2dfe70719551ec688284f764eb.webp"
    }
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 flex flex-col justify-evenly items-center py-8">
      <div className="w-full flex flex-col items-center">
        <h2 className="text-center text-xl font-semibold mb-4">Original Carousel</h2>
        <Carousel slides={slides} />
      </div>
      
      <div className="w-full flex flex-col items-center mt-8">
        <h2 className="text-center text-xl font-semibold mb-4">Draggable Carousel</h2>
        <DraggableCarousel slides={slides} />
      </div>
    </main>
  );
}
