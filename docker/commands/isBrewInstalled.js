module.exports = _ => `
  brew --version &> /dev/null
  echo $?
`;