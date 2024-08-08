module.exports = _ => `
  open /Applications/Docker.app &> /dev/null
  echo $?
`;