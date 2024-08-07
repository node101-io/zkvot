module.exports = _ => `
  brew install --cask docker &> /dev/null
  echo $?
`;