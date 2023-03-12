#!/bin/bash

for i in $(find pages -type f); do
  sed -i 's/process.env.REPO_DIR!/"data\/diffusers"/g' $i
done

vercel "$@"

git co .
