export default (
  image_raw: string,
  callback: (error: string | null, url?: string) => any
) => {
  return callback(null, 'https://node101.io/favicon.ico');
};