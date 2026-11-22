export const SERVE_ALL = false;

export const SERVED = [
  { town: "Nairobi", county: "Nairobi" },
  { town: "Mombasa", county: "Mombasa" },
  { town: "Kisumu", county: "Kisumu" },
  { town: "Nakuru", county: "Nakuru" },
  { town: "Naivasha", county: "Nakuru" },
  { town: "Eldoret", county: "Uasin Gishu" },
  { town: "Thika", county: "Kiambu" },
  { town: "Machakos", county: "Machakos" },
] as const;

export const COUNTY_REVEAL_ORDER = [
  "Nairobi",
  "Kiambu",
  "Machakos",
  "Nakuru",
  "Kisumu",
  "Uasin Gishu",
  "Mombasa",
] as const;
