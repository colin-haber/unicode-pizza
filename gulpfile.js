"use strict";
var del = require("del");
var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var typescript = require("gulp-typescript");
gulp.task("build", [
	"build:sass",
	"build:typescript"
]);
gulp.task("build:sass", function () {
	return gulp.src("styles/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: "compressed"
		}).on("error", sass.logError))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest("styles/"));
});
gulp.task("build:typescript", function () {
	return gulp.src("scripts/*.ts")
		.pipe(sourcemaps.init())
		.pipe(typescript({
			removeComments: true,
			target: "ES2017"
		}))
		.pipe(sourcemaps.write("./", {
			includeContent: false
		}))
		.pipe(gulp.dest("scripts/"));
});
gulp.task("clean", function () {
	return del([
		"scripts/*.js",
		"scripts/*.js.map",
		"styles/*.css",
		"styles/*.css.map"
	]);
});
gulp.task("watch", [
	"watch:sass",
	"watch:typescript"
]);
gulp.task("watch:sass", function () {
	return gulp.watch("styles/*.scss", [
		"build:sass"
	]);
});
gulp.task("watch:typescript", function () {
	return gulp.watch("scripts/*.ts", [
		"build:typescript"
	]);
});
