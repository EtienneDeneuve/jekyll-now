import { defineCollection, z } from "astro:content";

export const collections = {
  blog: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      img: z.string().optional(),
      img_alt: z.string().optional(),
    }),
  }),
};
