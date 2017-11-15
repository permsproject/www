#!/bin/sh

set -e

yarn build

if [ "`echo $?`" -eq 0 ]; then
  cd build
  git init
  git remote add origin git@github.com:geta6/perms.git
  git checkout -b gh-pages
  echo 'www.permsproject.com' > CNAME
  git add .
  git commit -am 'Release'
  git push -f origin gh-pages
fi
