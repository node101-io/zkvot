import React, { useEffect, useState } from "react";
import ElectionCard from "./ElectionCard";

const AssignedElections = () => {
  const [electionDataArray, setElectionDataArray] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cachedData, setCachedData] = useState(null);

  useEffect(() => {
    if (!cachedData) {
      const fetchData = async () => {
        const dummyDataArray = [
          {
            zkvoteBy: "Cosmos12sf123412y346781234781234asdasflj",
            assignedVoters: 800,
            votedNow: 300,
            electionId: 234123412341234,
            name: "Trump mı kazanır Harris mi?",
            description: "Contrary to popular belief, Lorem Ipsum is not.",
            date: "1 Jan 2024",
            images: [
              "https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg",
            ],
            listOfVoters: [
              "B62qn71Re1CnnJxbmUmDVE7mgVY2Y82mdCwGLg5DKkJeyHfC7qGKiG2",
              "123123",
              "1433123",
              "123123",
            ],
          },
          {
            zkvoteBy: "UserXYZ",
            assignedVoters: 500,
            electionId: 234123412341234,

            votedNow: 200,
            name: "Which is better: React or Angular?",
            description: "An age-old debate between two popular frameworks.",
            date: "15 Feb 2024",
            images: [
              "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
            ],
          },
          {
            zkvoteBy: "Alice",
            assignedVoters: 1000,
            electionId: 234123412341234,

            votedNow: 750,
            name: "Best programming language in 2023?",
            description: "Help us decide the best programming language.",
            date: "10 Mar 2024",
            images: [
              "https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg",
            ],
          },
          {
            zkvoteBy: "Bob",
            assignedVoters: 300,
            electionId: 234123412341234,

            votedNow: 150,
            name: "Remote work vs Office work?",
            description: "Which work environment do you prefer?",
            date: "20 Apr 2024",
            images: [
              "https://via.placeholder.com/150/0000FF/FFFFFF?text=Remote+Work",
            ],
          },
          {
            zkvoteBy: "Carol",
            assignedVoters: 400,
            electionId: 234123412341234,

            votedNow: 100,
            name: "Android vs iOS?",
            description: "Choose your favorite mobile operating system.",
            date: "5 May 2024",
            images: [
              "https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg",
            ],
          },
          {
            zkvoteBy: "Dave",
            assignedVoters: 600,
            electionId: 234123412341234,

            votedNow: 350,
            name: "Coffee or Tea?",
            description: "Which beverage do you prefer?",
            date: "25 Jun 2024",
            images: [
              "https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG",
            ],
          },
        ];

        setTimeout(() => {
          setElectionDataArray(dummyDataArray);
          setCachedData(dummyDataArray);
          setLoading(false);
        });
      };

      fetchData();
    } else {
      setElectionDataArray(cachedData);
      setLoading(false);
    }
  }, [cachedData]);

  const skeletonCards = Array(6).fill(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
      {loading
        ? skeletonCards.map((_, index) => (
            <ElectionCard
              key={index}
              loading={true}
            />
          ))
        : electionDataArray.map((electionData, index) => (
            <ElectionCard
              key={index}
              electionData={electionData}
              loading={false}
            />
          ))}
    </div>
  );
};

export default AssignedElections;
