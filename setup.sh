#!/bin/sh
#npm install -g package-utils
set -e

VERSION=1.4.6
CORE=1.4.x

mv package.json package_old.json
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
  | package-resolve package_old.json \
  > package.json
rm package_old.json

package-merge \
  templates/testing.json \
  core/package_.json \
  templates/info.json \
  | sed \
    -e "s/VERSION/$VERSION/g" \
    -e "s/CORE/$CORE/g" \
  | package-resolve package.json \
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
    | package-resolve package.json \
    > plugins/$PLUGIN/package.json
done
