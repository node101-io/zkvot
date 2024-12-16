import { useState, useContext, useEffect } from "react";

import { types } from "zkvot-core";

import Button from "@/app/(partials)/button.jsx";

import { ToastContext } from "@/contexts/toast-context.jsx";

import { fetchAvailBlockHeightFromBackend, fetchCelestiaBlockInfoFromBackend } from "@/utils/backend.js";
import { CommunicationLayerDetails } from "@/utils/constants.jsx";

export default ({
  onPrevious,
  onNext,
  initialData,
}: {
  onPrevious: () => void;
  onNext: (data: types.ElectionStaticData) => void;
  initialData: types.ElectionStaticData;
}) => {
  const [selectedCommunicationLayerInfo, setSelectedCommunicationLayerInfo] = useState<types.CelestiaDaLayerInfo | types.AvailDaLayerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { showToast } = useContext(ToastContext);

  useEffect(() => setSelectedCommunicationLayerInfo(null), []);

  const handleCommunicationSelection = async (layer: types.DaLayerInfo["name"]) => {
    if (layer === selectedCommunicationLayerInfo?.name) return;

    setLoading(true);

    if (layer === "Avail") {
      setSelectedCommunicationLayerInfo({
        name: layer,
        start_block_height: 0,
        app_id: 101,
      });

      let startBlockHeight: number;
      try {
        startBlockHeight = await fetchAvailBlockHeightFromBackend();
        showToast("Fetched Avail block info", "success");
      } catch (_) {
        startBlockHeight = 0;
        showToast("Failed to fetch Avail block info", "error");
      };

      setSelectedCommunicationLayerInfo({
        name: layer,
        start_block_height: startBlockHeight,
        app_id: 101,
      });
    } else if (layer === "Celestia") {
      setSelectedCommunicationLayerInfo({
        name: layer,
        start_block_height: 0,
        start_block_hash: "",
        namespace: 'AAAAAAAAAAAAAAAAAAAAAAAAAGM1NjM4OWY5Yzk='
      });

      let startBlockHeight: number;
      let startBlockHash: string;

      try {
        const blockInfo = await fetchCelestiaBlockInfoFromBackend();
        startBlockHeight = blockInfo.blockHeight;
        startBlockHash = blockInfo.blockHash;
        showToast("Fetched Celestia block info", "success");
      } catch (_) {
        startBlockHeight = 0;
        startBlockHash = "";
        showToast("Failed to fetch Celestia block info", "error");
      };

      setSelectedCommunicationLayerInfo({
        name: layer,
        start_block_height: startBlockHeight,
        namespace: 'AAAAAAAAAAAAAAAAAAAAAAAAAGM1NjM4OWY5Yzk=',
        start_block_hash: startBlockHash,
      });
    };

    setLoading(false);
  };

  const handleNext = async () => {
    if (!selectedCommunicationLayerInfo) return;

    onNext({ ...initialData, communication_layers: [selectedCommunicationLayerInfo] });
  };

  return (
    <div className="flex flex-col justify-between items-center min-h-[calc(100vh-160px)] max-h-[calc(100vh-162px)] overflow-y-auto p-4">
      <div className="w-full space-y-6 p">
        <div className="mb-4">
          <h3 className="text-white text-xl">Select Communication Layer</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {(Object.keys(CommunicationLayerDetails) as types.DaLayerInfo["name"][])
            .map((layer: types.DaLayerInfo["name"], index) => (
              <div
                key={index}
                className={`p-6 bg-[#222222] rounded-2xl flex items-start transition duration-200 cursor-pointer ${
                  layer === selectedCommunicationLayerInfo?.name
                    ? "border-[1px] border-primary shadow-lg"
                    : "border-[1px] border-transparent hover:bg-[#333333]"
                }`}
                onClick={() => handleCommunicationSelection(layer as types.DaLayerInfo["name"])}
              >
                <div className="flex-shrink-0 mr-6 mt-1  overflow-hidden rounded-2xl flex items-center justify-center">
                  {CommunicationLayerDetails[layer].logo && CommunicationLayerDetails[layer].logo}
                </div>
                <div className="flex flex-col justify-between flex-grow">
                  <h3 className="text-white text-xl mb-3 font-semibold">
                    {layer}
                  </h3>
                  <p className="text-md mb-3">
                    {CommunicationLayerDetails[layer as keyof typeof CommunicationLayerDetails].description}
                  </p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="w-full flex justify-between pt-8 mb-auto">
        {!loading && selectedCommunicationLayerInfo && (
          <div className="w-full mb-auto">
            <div className="mb-4">
              <h3 className="text-white text-xl">Block Height:</h3>
            </div>
            <input
              type="number"
              value={selectedCommunicationLayerInfo.start_block_height}
              onInput={(event) =>
                setSelectedCommunicationLayerInfo({
                  ...selectedCommunicationLayerInfo,
                  start_block_height: Number((event.target as HTMLInputElement).value),
                })
              }
              className="w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4"
            />
            {selectedCommunicationLayerInfo.name === "Celestia" ? (
              <>
                <div className="my-2 mb-2">
                  <h3 className="text-white text-xl">Block Hash:</h3>
                </div>
                <input
                  type="text"
                  value={(selectedCommunicationLayerInfo as types.CelestiaDaLayerInfo).start_block_hash}
                  onInput={(event) =>
                    setSelectedCommunicationLayerInfo({
                      ...selectedCommunicationLayerInfo,
                      start_block_hash: (event.target as HTMLInputElement).value,
                    })
                  }
                  className="w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4"
                />
              </>
            ) : null}
          </div>
        )}
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button
          onClick={onPrevious}
          variant="back"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            selectedCommunicationLayerInfo === null ||
            selectedCommunicationLayerInfo.start_block_height <= 0 ||
            (
              selectedCommunicationLayerInfo.name === "Avail" &&
              selectedCommunicationLayerInfo.start_block_height < 0
            ) ||
            (
              selectedCommunicationLayerInfo.name === "Celestia" &&
              selectedCommunicationLayerInfo.start_block_height < 0 &&
              !(selectedCommunicationLayerInfo as types.CelestiaDaLayerInfo).start_block_hash?.trim().length
            )
          }
          className={
            selectedCommunicationLayerInfo === null ||
            selectedCommunicationLayerInfo.start_block_height <= 0 ||
            (
              selectedCommunicationLayerInfo.name === "Avail" &&
              selectedCommunicationLayerInfo.start_block_height < 0
            ) ||
            (
              selectedCommunicationLayerInfo.name === "Celestia" &&
              selectedCommunicationLayerInfo.start_block_height < 0 &&
              !(selectedCommunicationLayerInfo as types.CelestiaDaLayerInfo).start_block_hash?.trim().length
            )
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
          loading={loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
