const simpleGit = require('simple-git');

async function getChangedFiles(dir) {
  const git = simpleGit(dir);
  const status = await git.status();
  return status.modified;
}

module.exports = { getChangedFiles };