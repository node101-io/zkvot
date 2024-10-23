export const encodeDataToBase64String = (
  data: object,
  callback: (error: string | null, base64String?: string) => any
) => {
  try {
    const dataString = JSON.stringify(data);
    const encodedData = Buffer.from(dataString).toString('base64');
    return callback(null, encodedData);
  } catch (err: any) {
    return callback(err.toString());
  };
};
