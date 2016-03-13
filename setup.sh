#!/bin/sh

package-merge \
  plugins/*/package_.json \
  templates/testing.json \
  core/package_.json \
  templates/info.json \
  package_.json \
  | grep -v xstatic- > package.json

package-merge \
  templates/testing.json \
  core/package_.json \
  templates/info.json \
  > core/package.json

for PLUGIN in plugins/*/; do
  PLUGIN=`basename $PLUGIN`
  package-merge \
    templates/info.json \
    templates/plugin.json \
    templates/testing.json \
    plugins/$PLUGIN/package_.json \
    > plugins/$PLUGIN/package.json
done
