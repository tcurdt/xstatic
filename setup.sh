#!/bin/sh

package-merge \
  templates/info.json \
  package_.json \
  > package.json

package-merge \
  templates/info.json \
  templates/testing.json \
  core/package_.json \
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
