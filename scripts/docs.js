import fg from 'fast-glob';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import docgen from 'react-docgen-typescript';

/**
 * Builds the doc types.
 */
function buildDocs() {
  const files = fg.sync('src/**/!(*.story).tsx');

  const result = [];
  let count = 0;
  let fail = 0;
  const options = {
    savePropValueAsString: true,
    // Skip generating docs for HTML attributes
    propFilter: prop => {
      if (prop.declarations !== undefined && prop.declarations.length > 0) {
        const hasPropAdditionalDescription = prop.declarations.find(
          declaration => {
            return !declaration.fileName.includes('node_modules');
          }
        );

        return Boolean(hasPropAdditionalDescription);
      }

      return true;
    }
  };

  const docgenWithTSConfig = docgen.withCustomConfig(
    './tsconfig.json',
    options
  );

  files.forEach(file => {
    console.log('Reading', file);

    try {
      const documentation = docgenWithTSConfig.parse(file, options);
      if (documentation) {
        result.push(...documentation);
        count++;
      }
    } catch (e) {
      fail++;
      console.error('Error reading', file, e);
    }
  });

  mkdirSync(resolve('dist', 'docs'), { recursive: true });
  const fileName = resolve('dist', 'docs', 'docgen.json');
  writeFileSync(fileName, JSON.stringify(result, null, 2));

  console.info('Docs created!', fileName);
  console.info('Failed:', fail);
  console.info('Total Doc:', count);
}

buildDocs();
