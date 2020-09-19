/* eslint-disable @typescript-eslint/no-var-requires */
const semanticRelease = require('semantic-release');
const fs = require('fs');

const getNextVersion = () => {
  let result;

  try {
    result = semanticRelease({
      branches: [
        'stable',
        {name: 'rc', prerelease: true}
      ],
      plugins: [
        '@semantic-release/commit-analyzer'
      ],
      dryRun: true
    });
  } catch (err) {
    console.error('Version analysis failed with %O', err);

    process.exit(1);
  }

  return result;
};

const writeBinaryName = (appName, version) => {
  if ((typeof appName === 'string' && appName !== '') &&
    (typeof version === 'string' && version !== '')
  ) {
    fs.writeFile('./.release', `${appName}-${version}`, (err) => {
      if (err) throw err;
    });
  } else {
    throw new Error('Invalid app path and/or version.');
  }
};

const writeVersion = (filePath, version) => {
  if ((typeof filePath === 'string' && filePath !== '') &&
    (typeof version === 'string' && version !== '')
  ) {
    fs.readFile(filePath, (err, data) => {
      if (err) throw err;

      let packageJsonObj = JSON.parse(data);
      const appName = packageJsonObj.productName;
      packageJsonObj.version = version;
      packageJsonObj = JSON.stringify(packageJsonObj, null, '  ');

      fs.writeFile(filePath, packageJsonObj, (err) => {
        if (err) throw err;

        writeBinaryName(appName, version);
      });
    });
  } else {
    throw new Error('Invalid file path and/or version.');
  }
};

const bumpVersion = () => {
  getNextVersion().then((result) => {
    if (result) {
      const version = result.nextRelease.version;

      console.info(`Next version: ${version}`);

      console.info('Write version to package.json');
      writeVersion('./package.json', version);
    } else {
      console.error('No changes for version bump.');

      process.exit(1);
    }
  }).catch((err) => {
    console.error('Version bump failed with %O', err);

    process.exit(1);
  });
};

bumpVersion();
