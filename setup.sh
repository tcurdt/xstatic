#!/bin/sh

package-compose \
  templates/info.json \
  templates/testing.json \
  package_.json \
  > package.json

package-compose \
  templates/info.json \
  templates/testing.json \
  core/package_.json \
  > core/package.json

for PLUGIN in plugins/*/; do
  PLUGIN=`basename $PLUGIN`
  package-compose \
    templates/info.json \
    templates/plugin.json \
    templates/testing.json \
    plugins/$PLUGIN/package_.json \
    > plugins/$PLUGIN/package.json
done
