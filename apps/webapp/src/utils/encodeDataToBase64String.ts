export default (
  data: object | string,
  callback: (error: string | null, base64String?: string) => any
) => {
  try {
    const dataString = JSON.stringify(data);
    const encodedData = Buffer.from(dataString).toString('base64');
    return callback(null, encodedData);
  } catch (err: any) {
    console.log(err);
    return callback('bad_request');
  };
};