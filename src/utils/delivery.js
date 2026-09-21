export const GHANA_REGIONS = [
  { name: "Greater Accra", fee: 30 },
  { name: "Ashanti", fee: 45 },
  { name: "Central", fee: 40 },
  { name: "Eastern", fee: 40 },
  { name: "Western", fee: 50 },
  { name: "Western North", fee: 55 },
  { name: "Volta", fee: 50 },
  { name: "Oti", fee: 55 },
  { name: "Bono", fee: 50 },
  { name: "Bono East", fee: 55 },
  { name: "Ahafo", fee: 50 },
  { name: "Northern", fee: 70 },
  { name: "Savannah", fee: 70 },
  { name: "North East", fee: 75 },
  { name: "Upper East", fee: 80 },
  { name: "Upper West", fee: 80 },
];

export const deliveryFeeFor = (method, region) => {
  if (method === "Pickup") return 0;
  const match = GHANA_REGIONS.find((item) => item.name === region);
  return match ? match.fee : null;
};
