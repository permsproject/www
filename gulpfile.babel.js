import 'babel-polyfill';
import fs from 'fs';
import cp from 'child_process';
import path from 'path';
import hugo from 'hugo-bin';
import gulp from 'gulp';
import load from 'gulp-load-plugins';
import run from 'run-sequence';
import ncp from 'ncp';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import chokidar from 'chokidar';
import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const $ = Object.assign(load(), {
  run: (...tasks) => new Promise((resolve) => run(...tasks, resolve)),
  copy: (src, dst) =>
    new Promise((resolve, reject) => ncp(src, dst, (reason) => (reason ? reject(reason) : resolve()))),
  read: (src) =>
    new Promise((resolve, reject) =>
      fs.readFile(src, 'utf-8', (reason, data) => (reason ? reject(reason) : resolve(data))),
    ),
  write: (dst, data) =>
    new Promise((resolve, reject) => fs.writeFile(dst, data, (reason) => (reason ? reject(reason) : resolve()))),
  rmdir: (dst) => new Promise((resolve, reject) => rimraf(dst, (err) => (err ? reject(err) : resolve()))),
  mkdir: (dst) => new Promise((resolve, reject) => mkdirp(dst, (reason) => (reason ? reject(reason) : resolve()))),
  hugo: (options = []) =>
    new Promise((resolve, reject) =>
      cp
        .spawn(hugo, options.concat(['-s', 'share']), { stdio: 'inherit' })
        .on('close', (code) => (code === 0 ? resolve() : reject())),
    ),
});

gulp.task('clean', async () => {
  await $.rmdir('build');
  await $.mkdir('build');
  await $.rmdir('share/static');
});

gulp.task('copy', async () => {
  await Promise.all([$.copy('src/public', 'share/static')]);
});

gulp.task('copy:watch', async () => {
  await $.run('copy');
  const change = async (file) => {
    const src = path.relative('./', file);
    const dst = path.join(__dirname, 'share', 'static', path.relative('src', src));
    await $.mkdir(path.dirname(dst));
    await $.copy(src, dst);
    $.util.log(`Update file ${$.util.colors.green(src)}`);
  };
  const unlink = async (file) => {
    const src = path.relative('./', file);
    const dst = path.join(__dirname, 'share', 'static', path.relative('src', src));
    await $.rmdir(dst);
    $.util.log(`Remove file ${$.util.colors.magenta(src)}`);
  };
  chokidar
    .watch(['src/public/**'], { ignoreInitial: true })
    .on('add', change)
    .on('change', change)
    .on('unlink', unlink)
    .on('unlinkDir', unlink);
});

gulp.task('bundle', async () => {
  $.util.log(`Building source for ${$.util.colors.green(process.env.NODE_ENV)}`);
  const config = webpackConfig();
  await new Promise((resolve, reject) => {
    const bundler = webpack(config);
    if (process.env.NODE_ENV !== 'production') {
      bundler.apply(new webpack.ProgressPlugin());
    }
    bundler.run((err, stats) => {
      if (err) return reject(err);
      $.util.log(stats.toString(config.stats));
      return setTimeout(resolve, 1000);
    });
  });
});

gulp.task('hugo', async () => {
  await $.hugo();
});

gulp.task('build', async () => {
  await $.run('clean', 'copy', 'bundle');
  await $.hugo();
});

gulp.task('start', async () => {
  await $.run('clean', 'copy:watch', 'bundle');
  await new Promise((resolve) => {
    const config = webpackConfig();
    const bundler = webpack(config);
    bundler.apply(new webpack.ProgressPlugin());
    bundler.watch({ ignored: /node_modules/ }, (err, stats) => {
      $.util.log(stats.toString(config.stats));
      resolve();
    });
  });
  await $.hugo(['server', '--watch']);
});
