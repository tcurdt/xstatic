#!/bin/sh

VERSION=1.4.0
CORE=1.4.x

package-merge \
  plugins/*/package_.json \
  templates/testing.json \
  core/package_.json \
  templates/info.json \
  package_.json \
  | grep -v xstatic- \
  | sed \
    -e "s/VERSION/$VERSION/g" \
    -e "s/CORE/$CORE/g" \
  > package.json

package-merge \
  templates/testing.json \
  core/package_.json \
  templates/info.json \
  | sed \
    -e "s/VERSION/$VERSION/g" \
    -e "s/CORE/$CORE/g" \
  > core/package.json

for PLUGIN in plugins/*/; do
  PLUGIN=`basename $PLUGIN`
  package-merge \
    templates/info.json \
    templates/plugin.json \
    templates/testing.json \
    plugins/$PLUGIN/package_.json \
    | sed \
      -e "s/VERSION/$VERSION/g" \
      -e "s/CORE/$CORE/g" \
    > plugins/$PLUGIN/package.json
done
