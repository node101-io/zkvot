import { useState, useContext, useEffect } from "react";

import { types } from "zkvot-core";

import Button from "@/app/(partials)/button.jsx";

import { ToastContext } from "@/contexts/toast-context.jsx";

import {
  fetchAvailBlockHeightFromBackend,
  fetchCelestiaBlockInfoFromBackend,
} from "@/utils/backend.js";
import { CommunicationLayerDetails } from "@/utils/constants.jsx";
import generateRandomCelestiaNamespace from "@/utils/generateRandomCelestiaNamespace.js";

export default ({
  onPrevious,
  onNext,
  initialData,
}: {
  onPrevious: () => void;
  onNext: (data: types.ElectionStaticData) => void;
  initialData: types.ElectionStaticData;
}) => {
  const [selectedCommunicationLayer, setSelectedCommunicationLayer] = useState<
    types.DaLayerInfo["name"] | null
  >(null);

  const { showToast } = useContext(ToastContext);

  useEffect(() => setSelectedCommunicationLayer(null), []);

  const handleCommunicationSelection = (layer: types.DaLayerInfo["name"]) =>
    setSelectedCommunicationLayer(layer);

  const handleNext = async () => {
    if (selectedCommunicationLayer == null) return;

    showToast("Fetching communication layer data...", "success");

    if (selectedCommunicationLayer == "Avail") {
      let communicationLayer: types.AvailDaLayerInfo = {
        name: selectedCommunicationLayer,
        start_block_height: 0,
        app_id: 101,
      };

      try {
        communicationLayer.start_block_height =
          await fetchAvailBlockHeightFromBackend();
        onNext({
          ...initialData,
          communication_layers: [communicationLayer],
        });
      } catch (_) {
        onNext({
          ...initialData,
          communication_layers: [communicationLayer],
        });
      }
    } else if (selectedCommunicationLayer == "Celestia") {
      const communicationLayer: types.CelestiaDaLayerInfo = {
        name: selectedCommunicationLayer,
        start_block_height: 0,
        namespace: generateRandomCelestiaNamespace(),
        start_block_hash: "",
      };

      try {
        const blockInfo = await fetchCelestiaBlockInfoFromBackend();
        communicationLayer.start_block_height = blockInfo.blockHeight;
        communicationLayer.start_block_hash = blockInfo.blockHash;

        onNext({
          ...initialData,
          communication_layers: [communicationLayer],
        });
      } catch (_) {
        onNext({
          ...initialData,
          communication_layers: [communicationLayer],
        });
      }
    }
  };

  return (
    <div className="flex flex-col justify-between items-center min-h-[calc(100vh-160px)] max-h-[calc(100vh-162px)] overflow-y-auto p-4">
      <div className="w-full space-y-6 p">
        <div className="mb-4">
          <h3 className="text-white text-xl">Select Communication Layer</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {(
            Object.keys(
              CommunicationLayerDetails
            ) as types.DaLayerInfo["name"][]
          ).map((layer: types.DaLayerInfo["name"], index) => (
            <div
              key={index}
              className={`p-6 bg-[#222222] rounded-2xl flex items-start transition duration-200 cursor-pointer ${
                layer === selectedCommunicationLayer
                  ? "border-[1px] border-primary shadow-lg"
                  : "border-[1px] border-transparent hover:bg-[#333333]"
              }`}
              onClick={() =>
                handleCommunicationSelection(layer as types.DaLayerInfo["name"])
              }
            >
              <div className="flex-shrink-0 mr-6 mt-1  overflow-hidden rounded-2xl flex items-center justify-center">
                {CommunicationLayerDetails[layer].logo &&
                  CommunicationLayerDetails[layer].logo}
              </div>

              <div className="flex flex-col justify-between flex-grow">
                <h3 className="text-white text-xl mb-3 font-semibold">
                  {layer}
                </h3>
                <p className="text-md mb-3">
                  {
                    CommunicationLayerDetails[
                      layer as keyof typeof CommunicationLayerDetails
                    ].description
                  }
                </p>
                {/* Optional Fee Section (Uncomment if Needed)
        <div className='flex items-center justify-between'>
          <span className='text-md'>
            Fee: {CreationData.CommunicationChoicesFee[index]}{' '}
            {CreationData.CommunicationChoicesCurrency[index]}
          </span>
        </div>
        */}
              </div>
            </div>
          ))}
        </div>
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
          disabled={selectedCommunicationLayer === null}
          className={
            selectedCommunicationLayer === null
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
          // loading={loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
