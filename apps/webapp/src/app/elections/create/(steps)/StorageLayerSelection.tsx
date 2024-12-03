import { useState } from "react";

import { types } from "zkvot-core";

import Button from "@/app/(partials)/Button";

import { StorageLayerDetails } from "@/utils/constants";

export default ({
  onPrevious,
  onNext,
  initialData,
}: {
  onPrevious: () => void;
  onNext: (data: {
    election: types.ElectionStaticData;
    storage_layer_platform: types.StorageLayerPlatformCodes;
  }) => void;
  initialData: types.ElectionStaticData;
}) => {
  const [selectedStorageLayer, setSelectedStorageLayer] =
    useState<types.StorageLayerPlatformCodes | null>(null);

  const handleNext = () => {
    if (!selectedStorageLayer) return;

    onNext({
      election: initialData,
      storage_layer_platform: selectedStorageLayer,
    });
  };

  return (
    <div className="flex flex-col items-start space-y-6">
      <h2 className="text-white text-2xl">Choose a Storage Layer</h2>
      <div className="w-full">
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full`}>
          {Object.keys(StorageLayerDetails).map((layer, index) => (
            <div
              key={index}
              className={`p-4 bg-[#222222] rounded-2xl cursor-pointer flex items-center transition duration-200 ${
                layer === selectedStorageLayer
                  ? "border-[1px] border-primary shadow-lg"
                  : "hover:bg-[#333333]"
              }`}
              onClick={() =>
                setSelectedStorageLayer(
                  layer as types.StorageLayerPlatformCodes
                )
              }
            >
              <div className="w-[160px] h-[160px] flex-shrink-0 rounded-[12px] mr-4 flex items-center justify-center">
                {StorageLayerDetails[layer as keyof typeof StorageLayerDetails]
                  .logo || (
                  <div className="w-full h-full bg-gray-500 rounded-[12px]" />
                )}
              </div>
              <div className="flex flex-col h-full justify-between">
                <h3 className="text-white text-[24px] mb-2">
                  {layer.charAt(0).toUpperCase() + layer.slice(1)}
                </h3>
                <p className="text-[16px] mb-2">
                  {
                    StorageLayerDetails[
                      layer as keyof typeof StorageLayerDetails
                    ].description
                  }
                </p>
                {/* <div className='flex items-center justify-between'>
                  <span className='text-[16px]'>
                    Fee: {storageLayer.fee} {storageLayer.currency}
                  </span>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button onClick={() => onPrevious}>Previous</Button>
        <Button
          onClick={() => handleNext}
          disabled={!selectedStorageLayer}
          className={
            !selectedStorageLayer ? "opacity-50 cursor-not-allowed" : ""
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};
