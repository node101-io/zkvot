import { Field } from "o1js"

export default (
  data: {
    storageLayerPlatform: 'A' | 'F' | 'P',
    storageLayerID: string
  },
  callback: (
    error: string | null,
    fields?: [Field, Field]
  ) => any
) => {
  const { storageLayerPlatform, storageLayerID } = data
  const platform = storageLayerPlatform[0]
  const id = storageLayerPlatform[1] + storageLayerID

  return callback(null, [
    Field(BigInt(id)),
    Field(BigInt(platform.charCodeAt(0)))
  ])
}