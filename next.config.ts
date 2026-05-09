import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  }
};

/**
 *  <Image
      src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=100"
      fill
      priority
      alt="Hero"
      className="object-cover rounded-md"
    />
 */


export default nextConfig;
