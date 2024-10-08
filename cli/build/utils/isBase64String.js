const BASE64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
export default data => {
    if (!data || typeof data != 'string' || !data.trim().length)
        return false;
    return BASE64_REGEX.test(data);
};
//# sourceMappingURL=isBase64String.js.map