(function () {
  const SLUGS = {
    '/blog/blockchain/web5.html': 'web5',
    '/blog/blockchain/understanding-cryptographic-hash-functions.html': 'crypto-hash-functions',
    '/blog/blockchain/understanding-merkle-trees.html': 'merkle-trees',
    '/blog/security/new-gold-protocol-hack-analysis.html': 'gold-protocol',
    '/blog/security/swissborg-lost-41m-in-api-breach.html': 'swissborg-breach',
    '/blog/security/two-exploits-13-5m-in-a-week-part2.html': 'two-exploits-part2',
    '/blog/security/two-exploits-13-5m-in-a-week.html': 'two-exploits-part1',
    '/blog/tools/subgraphs-and-substreams-powered-subgraphs.html': 'subgraphs-substreams',
    '/blog/blockchain/running-a-validator-node-comprehensive-tutorial.html': 'validator-node',
    '/blog/tools/version-control.html': 'version-control',
    '/blog/blockchain/unlock-the-power-of-inline-assembly.html': 'inline-assembly',
    '/blog/tools/how-to-manage-multiple-sshkeys.html': 'multiple-ssh-keys',
    '/blog/blockchain/optimization-of-gas-and-bytecode-limitation.html': 'gas-bytecode-optimization',
    '/blog/blockchain/shanghai-upgrade.html': 'shanghai-upgrade',
    '/blog/blockchain/eip712.html': 'eip-712',
    '/blog/blockchain/public-private-keys-generation-and-signature-verification.html': 'ecdsa-keys',
    '/blog/tools/step-by-step-tutorial-on-how-to-install-gitbash-manage-sshkeys.html': 'gitbash-installation'
  };

  window.POST_SLUGS = Object.assign({}, window.POST_SLUGS || {}, SLUGS);
})();
