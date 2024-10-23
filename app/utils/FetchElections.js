import mockElections from "./mockElectionsData";
import { v4 as uuidv4 } from "uuid";

export const fetchElections = async (limit = 20, skip = 0) => {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const repeatTimes = Math.ceil((skip + limit) / mockElections.length);
    let extendedMockElections = [];

    for (let i = 0; i < repeatTimes; i++) {
      const replicatedElections = mockElections.map((election) => ({
        ...election,
        electionId: uuidv4(),
        name: `${election.name} (${i + 1})`,
      }));
      extendedMockElections = extendedMockElections.concat(replicatedElections);
    }

    const paginatedData = extendedMockElections.slice(skip, skip + limit);
    const hasMore = skip + limit < extendedMockElections.length;

    return { data: paginatedData, hasMore };
  } else {
    // Replace with actual API call when backend is ready
    // const response = await fetch(`/api/elections?limit=${limit}&skip=${skip}`);
    // if (!response.ok) {
    //   throw new Error("Failed to fetch elections");
    // }
    // const data = await response.json();
    // return data;
    return { data: [], hasMore: false };
  }
};
