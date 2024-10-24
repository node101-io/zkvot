import mockElections from "./mockElectionsData";

export const fetchElections = async (skip = 0) => {
  try {
    const url = `/api/election/filter?skip=${encodeURIComponent(skip)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch elections");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch elections");
    }

    return {
      data: result.elections || [],
      hasMore:
        result.hasMore !== undefined
          ? result.hasMore
          : result.elections.length === 100,
    };
  } catch (error) {
    console.error(
      "Error fetching elections from API. Falling back to mock data:",
      error
    );
    return {
      data: mockElections,
      hasMore: false,
    };
  }
};
