export type KenyaMapLocation = {
  name: string;
  longitude: number;
  latitude: number;
  labelX: number;
  labelY: number;
};

export const KENYA_OUTLINE =
  "M25.3 9.4 L29.1 11 L40.1 11.7 L52.3 18.7 L68 20.6 L71.9 16.3 L82.2 12.5 L86.7 15.6 L94.8 15.3 L84.5 26 L84.6 59.8 L90.9 67.4 L88.1 69.9 L83.3 69.9 L84.3 73 L83.3 72.3 L80.9 75.2 L76.2 76.3 L75 81.8 L71.2 84.6 L72.1 85.8 L70.2 89 L68.7 88.9 L69.9 89.6 L66.8 94.3 L64.5 94.8 L46.6 84.1 L47.1 79.8 L5 61 L4.9 50.8 L11.6 41.9 L15.1 40.5 L17.4 34.2 L16 28 L11 22.6 L11.1 18.2 L7.8 17.2 L5.9 13.1 L10.4 9.4 L22 5.6 Z";

export const KENYA_SERVICE_LOCATIONS: readonly KenyaMapLocation[] = [
  { name: "Nairobi", longitude: 36.82, latitude: -1.29, labelX: 33, labelY: 69 },
  { name: "Mombasa", longitude: 39.67, latitude: -4.04, labelX: 64, labelY: 92 },
  { name: "Kisumu", longitude: 34.77, latitude: -0.09, labelX: 7, labelY: 49 },
  { name: "Nakuru", longitude: 36.07, latitude: -0.3, labelX: 34, labelY: 38 },
  { name: "Eldoret", longitude: 35.27, latitude: 0.51, labelX: 21, labelY: 27 },
  { name: "Thika", longitude: 37.07, latitude: -1.03, labelX: 51, labelY: 62 },
  { name: "Naivasha", longitude: 36.43, latitude: -0.72, labelX: 34, labelY: 49 },
  { name: "Machakos", longitude: 37.26, latitude: -1.52, labelX: 57, labelY: 72 },
];

export function projectKenyaCoordinates(longitude: number, latitude: number) {
  return {
    x: 5 + ((longitude - 33.9) / 8) * 90,
    y: 5 + ((5.1 - latitude) / 9.8) * 90,
  };
}
