#!/bin/sh

(cd core && npm publish)

for PLUGIN in plugins/*/; do
  (cd $PLUGIN && npm publish)
done
