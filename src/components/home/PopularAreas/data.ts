export type DestinationTile = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
};

// Region and tagline copy are placeholders, except Nairobi's existing tagline.
export const DESTINATIONS: readonly DestinationTile[] = [
  { slug: "nairobi", name: "Nairobi", region: "Nairobi County", tagline: "The Green City in the Sun", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Aerial_view_of_the_Nairobi_skyline_from_the_KICC_rooftop_at_golden_hour.jpg/1280px-Aerial_view_of_the_Nairobi_skyline_from_the_KICC_rooftop_at_golden_hour.jpg", imageAlt: "Nairobi skyline", objectPosition: "center 45%" },
  { slug: "mombasa", name: "Mombasa", region: "Coast", tagline: "Coastal moves, delivered with care", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Entering_the_old_town%2C_Mombasa.jpg/500px-Entering_the_old_town%2C_Mombasa.jpg", imageAlt: "Mombasa old town" },
  { slug: "kisumu", name: "Kisumu", region: "Lake Region", tagline: "Reliable support by the lake", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Aerial_view_of_Kisumu.jpg/500px-Aerial_view_of_Kisumu.jpg", imageAlt: "Kisumu lakeside" },
  { slug: "nakuru", name: "Nakuru", region: "Rift Valley", tagline: "Moving made easy in the valley", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Lake_Nakuru_flamingos.jpg/1280px-Lake_Nakuru_flamingos.jpg", imageAlt: "Nakuru landscape", objectPosition: "center 45%" },
  { slug: "eldoret", name: "Eldoret", region: "Western Highlands", tagline: "Careful moves across the highlands", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Eldoret_3.JPG/960px-Eldoret_3.JPG", imageAlt: "Eldoret town" },
  { slug: "thika", name: "Thika", region: "Central", tagline: "A smooth move, close to home", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Fourteen_falls_Thika%2CKenya.JPG/960px-Fourteen_falls_Thika%2CKenya.JPG", imageAlt: "Thika landscape" },
  { slug: "naivasha", name: "Naivasha", region: "Rift Valley", tagline: "Trusted help for your next move", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Lake_Naivasha.jpg/960px-Lake_Naivasha.jpg", imageAlt: "Lake Naivasha" },
  { slug: "machakos", name: "Machakos", region: "Eastern", tagline: "Moving support for every journey", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Machakos-Kenia_Rd.jpg/960px-Machakos-Kenia_Rd.jpg", imageAlt: "Machakos town" },
];
