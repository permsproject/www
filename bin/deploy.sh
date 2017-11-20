#!/bin/sh

set -e

yarn build

if [ "`echo $?`" -eq 0 ]; then
  cd build
  if [ -d ".git" ]; then
    rm -rf .git
  fi
  git init
  git remote add origin git@github.com:permsproject/www.git
  echo 'www.permsproject.com' > CNAME
  git add .
  git commit -am 'Release'
  git push -fu origin master
fi
