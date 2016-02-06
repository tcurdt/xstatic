#!/bin/sh

package-compose package_.json core/package_.json > core/package.json
for PLUGIN in plugins/*/; do
  PLUGIN=`basename $PLUGIN`
  package-compose package_.json plugins/package_.json plugins/$PLUGIN/package_.json > plugins/$PLUGIN/package.json
done
