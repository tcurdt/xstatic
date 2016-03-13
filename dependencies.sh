#!/bin/sh

exit 0

PLUGINS=`ls plugins`

# clean
rm -rf node_modules
cd core && rm -rf node_modules && cd ..
for PLUGIN in $PLUGINS; do
  cd plugins/$PLUGIN
  rm -rf node_modules
  cd ../..
done
mkdir -p node_modules

# create links to plugins
cd node_modules && ln -s ../core xstatic-core && cd ..
for PLUGIN in $PLUGINS; do
  cd node_modules
  ln -s ../plugins/$PLUGIN xstatic-$PLUGIN
  cd ..
done

# install transitive deps
npm i \
  @tcurdt/filepath \
  @tcurdt/tinyutils \
  browser-sync \
  chokidar \
  mkdirp \
  babel-core \
  babel-plugin-transform-react-jsx \
  blue-tape \
  front-matter \
  handlebars \
  highlight.js \
  less \
  libxmljs \
  marked \
  minimatch \
  moment \
  node-sass \
  nunjucks \
  tape \
  xmlbuilder \

# install dev deps
npm i  \
  tape \
  blue-tape \
  istanbul \
  nyc \
  faucet \
  libxmljs \
  coveralls \
  codecov.io \
  codacy-coverage \
