import {series, src, dest} from "gulp";
import insert from "gulp-insert";
import rollupStream from "rollup-stream";
import rollupConfig from "./rollup.config.js";
import sourceMaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import filter from "gulp-filter-each";
import cleanCSS from "gulp-clean-css";
import babel from "gulp-babel";
import rename from "gulp-rename";
import del from "del";
import header from "gulp-header";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import fs from "fs";
import trim from "trim";
import gulpTypescript from "gulp-typescript";
import typescript from "typescript";

const umd = () => {
  const packageJson = JSON.parse(fs.readFileSync("./package.json"));
  const headerTxt = fs.readFileSync("./copyright-header.txt");

  return rollupStream({...rollupConfig, rollup: require('rollup')})
    .pipe(source('dist/umd/html-text-collab-ext.js'))
    .pipe(header(headerTxt, {package: packageJson}))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(dest("./"));
};

const minifyUmd = () =>
  src("dist/umd/html-text-collab-ext.js")
    .pipe(sourceMaps.init())
    .pipe(uglify({
      output: {
        comments: "some"
      }
    }))
    .pipe(rename({extname: ".min.js"}))
    .pipe(sourceMaps.write("."))
    .pipe(dest("dist/umd"));

const commonjs = () =>
  src("src/ts/*.ts")
    .pipe(babel())
    .pipe(dest("dist/lib"));

const css = () =>
  src("src/css/*.css")
    .pipe(dest("dist/css"));

const minifyCss = () => src(`dist/css/html-text-collab-ext.css`)
  .pipe(sourceMaps.init())
  .pipe(cleanCSS())
  .pipe(rename({extname: ".min.css"}))
  .pipe(sourceMaps.write("."))
  .pipe(dest("dist/css"));

const tsDeclarations = () => {
  const tsProject = gulpTypescript.createProject("tsconfig.json", {
    declaration: true,
    typescript: typescript
  });

  return src("src/ts/*.ts")
    .pipe(tsProject())
    .dts
    .pipe(dest("dist/typings"));
};

const es6 = () => {
  const tsProject = gulpTypescript.createProject("tsconfig.json", {
    declaration: true,
    target: "es6",
    typescript: typescript
  });

  return src("src/ts/*.ts")
    .pipe(tsProject())
    .js
    .pipe(filter(content => trim(content).length !== 0))
    .pipe(dest("dist/es6"));
};

const appendTsNamespace = () =>
  src("dist/typings/index.d.ts", {base: './'})
    .pipe(insert.append('\nexport as namespace TextCollabExt;\n'))
    .pipe(dest("./"));

const copyFiles = () =>
  src(["README.md", "LICENSE.txt", "package.json"])
    .pipe(dest("dist"));

const dist = series(
  umd,
  minifyUmd,
  commonjs,
  es6,
  css,
  minifyCss,
  tsDeclarations,
  appendTsNamespace,
  copyFiles);

const clean = () => del(["dist"]);

export {
  dist,
  clean
};
