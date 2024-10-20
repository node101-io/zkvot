"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import Image from "next/image";
import Link from "next/link";
import SignUpImage from "@/assets/StepFiveTutroial/AkordSignUp.svg";
import SetUpVaultImage from "@/assets/StepFiveTutroial/AkordSetUpVault.svg";
import CreateVaultImage from "@/assets/StepFiveTutroial/AkordCreateVault.svg";
import UploadFileImage from "@/assets/StepFiveTutroial/AkordUploadFile.svg";
import DownloadFileImage from "@/assets/StepFiveTutroial/AkordDownloadUploadFile.svg";
import FileContentImage from "@/assets/StepFiveTutroial/AkordFileContent.svg";
import CopyFromFileImage from "@/assets/StepFiveTutroial/AkordCopyFromFile.svg";

const StepSix = ({ electionData, onPrevious, onSubmit, onDownload }) => {
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(false);

  const stepsData = getStepsData(electionData.storageLayer, onDownload);

  const handleInputChange = (e) => {
    setTransactionId(e.target.value);
    setIsSubmitEnabled(e.target.value.trim() !== "");
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      setIsFetchingData(true);

      Promise.resolve(onSubmit(transactionId.trim(), setErrorMessage))
        .then(() => {
          console.log("Submission successful.");
        })
        .catch((error) => {
          console.error("Submission error:", error);
          const errorMessageToDisplay =
            error.message || "An error occurred during submission.";
          setErrorMessage(errorMessageToDisplay);
          console.log("Displaying error message:", errorMessageToDisplay); // Log the error message directly
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    }
  };

  return (
    <div className="flex flex-col items-start space-y-6">
      <h2 className="text-white text-2xl">{electionData.storageLayer} Guide</h2>
      <div className="w-full text-white">
        {stepsData.map((step, index) => (
          <div key={index}>
            <div className="mb-4">{step.text}</div>
            <Image
              src={step.image}
              className="mb-6"
              alt=""
              width={1000}
              height={530}
            />
          </div>
        ))}
      </div>
      <div className="w-full">
        <label className="block text-white mb-2">Transaction ID</label>
        <input
          type="text"
          value={transactionId}
          onChange={handleInputChange}
          className="w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border"
          placeholder="Enter your transaction ID here"
        />
      </div>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

      {isFetchingData && (
        <p className="text-white mt-2">Submitting data, please wait...</p>
      )}

      <div className="w-full flex justify-between pt-4">
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled || isFetchingData}
          className={
            !isSubmitEnabled || isFetchingData
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StepSix;

function getStepsData(storageLayer, onDownload) {
  switch (storageLayer) {
    case "Arweave":
      return [
        {
          text: (
            <>
              1. Go to
              <Link
                className="text-blue-400"
                href={"https://v2.akord.com/signup"}
              >
                {" "}
                https://v2.akord.com/signup{" "}
              </Link>
              and create an account.
            </>
          ),
          image: SignUpImage,
        },
        {
          text: (
            <>
              2. After you sign up, sign in. You will see the following page,
              choose “NFT assets / public archives” and click “Setup vault”.
            </>
          ),
          image: SetUpVaultImage,
        },
        {
          text: "3. Give it a title and click “Create vault”.",
          image: CreateVaultImage,
        },
        {
          text: "4. Click “Upload a file”.",
          image: UploadFileImage,
        },
        {
          text: (
            <>
              <div>
                5.{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDownload();
                  }}
                  className="hover:text-white/70 underline"
                >
                  Download
                </button>{" "}
                the file here and upload it to the website.
              </div>
            </>
          ),
          image: DownloadFileImage,
        },
        {
          text: "6. Click on the file you uploaded to see its content.",
          image: FileContentImage,
        },
        {
          text: (
            <>
              7. Click on “info” button on the right to see the file info. Copy
              the URL starting with “https://arweave.net” and paste it into the
              field below.
            </>
          ),
          image: CopyFromFileImage,
        },
      ];
    case "IPFS":
      return [];
    case "Filecoin":
      return [];
    default:
      return [];
  }
}
