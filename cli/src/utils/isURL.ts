const urlRegex = /^(https?:\/\/)?((([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})|((\d{1,3}\.){3}\d{1,3}))(:[0-9]{1,5})?(\/.*)?$/;

export default (url: string): boolean => urlRegex.test(url);