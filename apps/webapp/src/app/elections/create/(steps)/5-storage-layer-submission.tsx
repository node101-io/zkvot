import { useContext, useState } from "react";
import Image, { StaticImageData } from "next/image.js";
import Link from "next/link.js";

import { types, utils } from "zkvot-core";

import Button from "@/app/(partials)/button.jsx";

import { ToastContext } from "@/contexts/toast-context.jsx";

import ArweaveStep1Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-1.png";
import ArweaveStep2Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-2.png";
import ArweaveStep3Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-3.png";
import ArweaveStep4Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-4.png";
import ArweaveStep5Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-5.png";
import ArweaveStep6Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-6.png";
import ArweaveStep7Image from "@/public/elections/storage-layer-upload-instructions/arweave/step-7.png";

import FilecoinStep1Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-1.png";
import FilecoinStep2Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-2.png";
import FilecoinStep3Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-3.png";
import FilecoinStep4Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-4.png";
import FilecoinStep5Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-5.png";
import FilecoinStep6Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-6.png";
import FilecoinStep7Image from "@/public/elections/storage-layer-upload-instructions/filecoin/step-7.png";

interface Step {
  text: React.ReactNode;
  image: StaticImageData;
}

interface StepProps {
  number: number;
  text: React.ReactNode;
  image: StaticImageData;
}

interface StepData {
  text: React.ReactNode;
  image: StaticImageData;
}

interface UploadInstructionsProps {
  stepsData: StepData[];
}

const Step: React.FC<StepProps> = ({ number, text, image }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start mb-12">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-12 h-12 bg-[#222] text-white rounded-full font-bold">
          {number}
        </div>
      </div>

      <div className="mt-4 lg:mt-0 lg:ml-6 flex-1">
        <div className="bg-[#1B1B1B] p-6 rounded-lg shadow-md">
          <div className="text-gray-300 mb-4">{text}</div>
          <div className="w-full">
            <Image
              src={image}
              alt={`Step ${number} Image`}
              className="rounded-md"
              width={600}
              height={400}
              layout="responsive"
              objectFit="contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadInstructions: React.FC<UploadInstructionsProps> = ({
  stepsData,
}) => {
  return (
    <div className="w-full text-white py-8">
      {stepsData.map((step, index) => (
        <Step
          key={index}
          number={index + 1}
          text={step.text}
          image={step.image}
        />
      ))}
    </div>
  );
};

export default ({
  onPrevious,
  onNext,
  initialData,
}: {
  onPrevious: () => void;
  onNext: (data: {
    election: types.ElectionStaticData;
    storage_layer_platform: types.StorageLayerPlatformCodes;
    storage_layer_id: string;
  }) => void;
  initialData: {
    election: types.ElectionStaticData;
    storage_layer_platform: types.StorageLayerPlatformCodes;
  };
}) => {
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [CID, setCID] = useState<string>("");

  const handleSubmit = () => {
    if (loading) return;

    setLoading(true);

    if (!CID.trim().length) {
      showToast("Please enter a valid CID", "error");
      setLoading(false);
      return;
    }

    utils.fetchDataFromStorageLayer(
      {
        platform: initialData.storage_layer_platform,
        id: CID,
      },
      (error, data) => {
        if (error || !data) {
          showToast(
            "Failed to fetch data from the storage layer, please check the CID",
            "error"
          );
          setLoading(false);
          return;
        }

        const electionDataCommitment = utils.createElectionDataCommitment(
          initialData.election
        );

        if (!utils.verifyElectionDataCommitment(data, electionDataCommitment)) {
          showToast(
            "The CID you provided does not match the election created, please check the CID and the uploaded file",
            "error"
          );
          setLoading(false);
          return;
        }

        onNext({
          election: initialData.election,
          storage_layer_platform: initialData.storage_layer_platform,
          storage_layer_id: CID,
        });
      }
    );
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(initialData.election, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "zkvot-election-data.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stepsData = getUploadInstructions(
    initialData.storage_layer_platform,
    downloadJSON
  );

  return (
    <div className="flex flex-col space-y-2 overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-white text-xl"> Storage Layer Upload Guide</h2>
        <h3 className="text-white mt-4">
          Use the guide below to upload your election data to the storage layer
          and paste the transaction CID here.
        </h3>
      </div>
      <Button
        download={true}
        onClick={(e) => {
          e.preventDefault();
          downloadJSON();
        }}
        className="ml-auto"
      >
        Download the Election Data
      </Button>
      <div className="w-full">
        <label className="block text-white mb-2">CID</label>
        <input
          type="text"
          value={CID}
          onChange={(event) => setCID(event.target.value)}
          className="w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border"
          placeholder="Enter the CID here"
        />
      </div>

      <div className="w-full text-white">
        <UploadInstructions stepsData={stepsData} />
      </div>
      <div className="w-full flex justify-between pb-14">
        <Button
          onClick={onPrevious}
          variant="back"
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!CID.trim().length}
          loading={loading}
          className={!CID.trim().length ? "opacity-50 cursor-not-allowed" : ""}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export function getUploadInstructions(
  storageLayer: types.StorageLayerPlatformCodes,
  onDownload: () => void
): Step[] {
  switch (storageLayer) {
    case "A":
      return [
        {
          text: (
            <>
              Go to{" "}
              <Link
                className="text-blue-400 underline"
                href="https://v2.akord.com/signup"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://v2.akord.com/signup
              </Link>{" "}
              and create an account.
            </>
          ),
          image: ArweaveStep1Image,
        },
        {
          text: "After you sign up, sign in. You will see the following page, choose “NFT assets / public archives” and click “Setup vault”.",
          image: ArweaveStep2Image,
        },
        {
          text: "Give it a title and click “Create vault”.",
          image: ArweaveStep3Image,
        },
        {
          text: "Click “Upload a file”.",
          image: ArweaveStep4Image,
        },
        {
          text: (
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDownload();
                }}
                className="text-blue-400 hover:text-blue-600 underline"
              >
                Download
              </button>{" "}
              the file here and upload it to the website.
            </div>
          ),
          image: ArweaveStep5Image,
        },
        {
          text: "Click on the file you uploaded to see its content.",
          image: ArweaveStep6Image,
        },
        {
          text: "Click on the “info” button on the right to see the file info. Copy the URL starting with “https://arweave.net” and paste it into the input above.",
          image: ArweaveStep7Image,
        },
      ];
    case "F":
      return [
        {
          text: (
            <>
              Go to{" "}
              <Link
                className="text-blue-400 underline"
                href="https://console.storacha.network/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://console.storacha.network/
              </Link>{" "}
              and create an account.
            </>
          ),
          image: FilecoinStep1Image,
        },
        {
          text: "Subscribe to the free plan and create a space.",
          image: FilecoinStep2Image,
        },
        {
          text: "You’ll see the following page. Click on the space you created then “Upload a file”.",
          image: FilecoinStep3Image,
        },
        {
          text: (
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDownload();
                }}
                className="text-blue-400 hover:text-blue-600 underline"
              >
                Download
              </button>{" "}
              the file here and upload it to the website.
            </div>
          ),
          image: FilecoinStep4Image,
        },
        {
          text: "Uncheck the “Wrap in directory” checkbox. Then click “Start Upload”.",
          image: FilecoinStep5Image,
        },
        {
          text: "Wait for some time for it to be uploaded. Then, click the logo on top left and select the space you created.",
          image: FilecoinStep6Image,
        },
        {
          text: "Copy the Root CID of your data and paste it in the above input.",
          image: FilecoinStep7Image,
        },
      ];
    default:
      return [];
  }
}
