#!/bin/sh

files=$(git diff --cached --name-only --diff-filter=ACM)
jsons=$(echo "$files" | grep -e ".json$")
images=$(echo "$files" | grep -e ".png$" -e ".gif$" -e ".jpg$" -e ".svg$")
javascripts=$(echo "$files" | grep -e ".jsx\?$")
stylesheets=$(echo "$files" | grep -e ".styl$")

WARN=false
FAIL=false

if [ "$jsons" != "" -o "$images" != "" -o "$javascripts" != "" -o "$stylesheets" != "" ]; then
  echo ""
  echo "optimize / validate files"
  echo ""

  if [ "$jsons" != "" ]; then
    for json in ${jsons}; do
      result=$(./node_modules/.bin/jsonlint -q ${json} 2>&1)
      if [ "$(echo $result | grep Error)" = "" ]; then
        echo "\t\033[32m✓ jsonlint:\t${json}\033[0m"
      else
        FAIL=true
        echo "\t\033[31m✗ jsonlint:\t${json}\033[0m"
        echo "$result"
      fi
    done
  fi

  if [ "$images" != "" ]; then
    for img in ${images}; do
      tmp=`mktemp`
      cat ${img} | ./node_modules/.bin/imagemin > ${tmp}
      if [ -f $tmp -a $(du -sb ${tmp} | awk '{print $1}') != 0 ]; then
        mv -f ${tmp} ${img}
        git add ${img}
        echo "\t\033[32m✓ image:\t${img}\033[0m"
      else
        FAIL=true
        echo "\t\033[31m✗ image:\t${img}\033[0m"
      fi
    done
  fi

  if [ "$stylesheets" != "" ]; then
    for stylesheet in ${stylesheets}; do
      result=$(./node_modules/.bin/stylint ${stylesheet})
      if [ "$(echo $result | grep ' error ')" = "" ]; then
        if [ "$(echo $result | grep ' warning ')" = "" ]; then
          echo "\t\033[32m✓ stylint:\t${stylesheet}\033[0m"
        else
          WARN=true
          echo "\t\033[33m⚠︎ stylint:\t${stylesheet}\033[0m"
          echo "$result" | grep "${stylesheet} " | cut -d' ' -f2-
        fi
      else
        FAIL=true
        echo "\t\033[31m✗ stylint:\t${stylesheet}\033[0m"
        echo "$result" | grep "${stylesheet} " | cut -d' ' -f2-
      fi
    done
  fi

  if [ "$javascripts" != "" ]; then
    for javascript in ${javascripts}; do
      result=$(./node_modules/.bin/eslint --parser babel-eslint ${javascript} -f compact | sed -e "s/^.*: //g")
      if [ "$(echo $result | grep Error)" = "" ]; then
        if [ "$(echo $result | grep Warning)" = "" -o "$(echo $result | grep 'File ignored because of a matching ignore pattern')" != "" ]; then
          echo "\t\033[32m✓ eslint:\t${javascript}\033[0m"
        else
          WARN=true
          echo "\t\033[33m⚠︎︎ eslint:\t${javascript}\033[0m"
          echo "$result"
        fi
      else
        FAIL=true
        echo "\t\033[31m✗ eslint:\t${javascript}\033[0m"
        echo "$result"
      fi
    done
  fi
fi

if $FAIL; then
  echo "\033[31m"
  echo "✗ commit failure"
  echo "\033[0m"
  exit 1
elif $WARN; then
  echo "\033[33m"
  echo "⚠︎ commit success"
  echo "\033[0m"
  exit 0
else
  echo "\033[32m"
  echo "✓ commit success"
  echo "\033[0m"
  exit 0
fi
