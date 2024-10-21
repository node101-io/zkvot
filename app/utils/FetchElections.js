import mockElections from "./mockElectionsData";

export const fetchElections = async () => {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockElections;
  } else {
    // const response = await fetch("/api/elections");
    // if (!response.ok) {
    //   throw new Error("Failed to fetch elections");
    // }
    // const data = await response.json();
    return data;
  }
};
