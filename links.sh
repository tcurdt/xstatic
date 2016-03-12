#!/bin/sh

cd core && npm link && cd ..
cd plugins/atom && npm link && cd -
cd plugins/babel && npm link && cd -
cd plugins/css && npm link && cd -
cd plugins/epub && npm link && cd -
cd plugins/filter && npm link && cd -
cd plugins/frontmatter && npm link && cd -
cd plugins/handlebars && npm link && cd -
cd plugins/json && npm link && cd -
cd plugins/less && npm link && cd -
cd plugins/markdown && npm link && cd -
cd plugins/merge && npm link && cd -
cd plugins/nunjucks && npm link && cd -
cd plugins/sass && npm link && cd -
cd plugins/sitemap && npm link && cd -
cd plugins/sort && npm link && cd -

npm link xstatic-core
npm link xstatic-atom
npm link xstatic-babel
npm link xstatic-css
npm link xstatic-epub
npm link xstatic-filter
npm link xstatic-frontmatter
npm link xstatic-handlebars
npm link xstatic-json
npm link xstatic-less
npm link xstatic-markdown
npm link xstatic-merge
npm link xstatic-nunjucks
npm link xstatic-sass
npm link xstatic-sitemap
npm link xstatic-sort

PLUGINS=`ls plugins`

for PLUGIN in $PLUGINS; do
  cd plugins/$PLUGIN
  rm -rf node_modules
  cd ../..
done
