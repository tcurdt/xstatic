#!/bin/sh

PLUGINS=`ls plugins`

# clean
mkdir -p node_modules
rm -f node_modules/xstatic-*
rm -f core/node_modules
rm -f plugins/*/node_modules

# create links to plugins
cd node_modules
ln -s ../core xstatic-core
for PLUGIN in $PLUGINS; do
  ln -s ../plugins/$PLUGIN xstatic-$PLUGIN
done
cd ..

# install transitive deps
# package-deps -d core/package.json plugins/*/package.json | grep -v xstatic- | xargs npm i

# npm i \
#   @tcurdt/filepath \
#   @tcurdt/tinyutils \
#   browser-sync \
#   chokidar \
#   mkdirp \
#   babel-core \
#   babel-plugin-transform-react-jsx \
#   blue-tape \
#   front-matter \
#   handlebars \
#   highlight.js \
#   less \
#   libxmljs \
#   marked \
#   minimatch \
#   moment \
#   node-sass \
#   nunjucks \
#   tape \
#   xmlbuilder \

# npm i  \
#   tape \
#   blue-tape \
#   istanbul \
#   nyc \
#   faucet \
#   libxmljs \
#   coveralls \
#   codecov.io \
#   codacy-coverage \
