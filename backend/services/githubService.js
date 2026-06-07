const https = require('https');

const ghGet = (path) => new Promise((resolve, reject) => {
  https.get({
    hostname: 'api.github.com',
    path,
    headers: { 'User-Agent': 'DevConnect-App/1.0', 'Accept': 'application/vnd.github.v3+json' },
  }, (res) => {
    let data = '';
    res.on('data', (c) => { data += c; });
    res.on('end', () => {
      try {
        const p = JSON.parse(data);
        if (p.message) reject(new Error(p.message));
        else resolve(p);
      } catch(e) { reject(e); }
    });
  }).on('error', reject);
});

const fetchGitHubProfile = (username) => ghGet(`/users/${username}`);
const fetchGitHubRepos = (username) => ghGet(`/users/${username}/repos?sort=stars&per_page=6`);

module.exports = { fetchGitHubProfile, fetchGitHubRepos };
