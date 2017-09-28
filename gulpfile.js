var destDir = "./build/",
	gulp = require("gulp"), // запуск галпа
	autoprefixer = require("gulp-autoprefixer"), // расставление префиксов
    concat = require("gulp-concat"), // сливает все файлы в один
    cssnano = require("gulp-cssnano"), // минификация файлов
    rename = require("gulp-rename"), // переименовывает файлы
    clean = require("gulp-clean"), // каждый раз очищает папку build
    plumber = require("gulp-plumber"), // для отлова ошибок
    notify = require("gulp-notify"), // ошибки в виде всплывающих окон
    sourcemaps = require("gulp-sourcemaps"), //История изменения стилей.
    uglify = require("gulp-uglify"), // Минификация скриптов
    useref = require("gulp-useref"), // доставка кусочков html в один
    browserSync = require("browser-sync").create(); // создание сервера


// таска, запускаемая по дефолту после запуска команды gulp
gulp.task("default", ["clean"], function() {
	gulp.run("dev");
});

gulp.task("production", ["clean"], function() {
	gulp.run("build");
});

// сборка в режиме разработки
gulp.task("dev", ["build", "watch", "browser-sync"]);

// выполянет сборку
gulp.task("build", ["html", "styles", "scripts", "assets"]);

// следит за изменениями во всех файлах проекта и, при их изменении, автоматически применяет эти изменения к конечным файлам
gulp.task("watch", function() {
	gulp.watch("src/styles/**/*.css", ["styles"]);
    gulp.watch("src/js/*.js", ["scripts"]);
    gulp.watch("index.html", ["html"]);
    gulp.watch("src/assets/**/*.*", ["assets"]);
    gulp.watch("src/**/*.*").on("change", browserSync.reload);
});

// чистка директири build
gulp.task("clean", function() {
	return gulp.src(destDir)
		.pipe(clean());
});

//выполянет сборку и доставку стилей
gulp.task("styles", function() {
	return gulp.src("src/styles/*.css")
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: "Styles",
					message: err.message
				}
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer({
			browsers: ["last 2 versions"]
		}))
		.pipe(concat("styles.css"))
		.pipe(cssnano())
		.pipe(sourcemaps.write())
		.pipe(rename("build.css"))
		.pipe(gulp.dest(destDir+"styles"));
});

// Перемещает asset  в конечную директорию
gulp.task("assets", function() {
	return gulp.src("./src/assets/**/*.*")
		.pipe(gulp.dest(destDir + "/assets"));
});

//доставляет файлы html в конечную папку
gulp.task("html", function() {
	gulp.src("./index.html")
		.pipe(gulp.dest(destDir))
		.pipe(sourcemaps.init())
});

gulp.task("scripts", function () {
    return gulp.src("src/js/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat("scripts.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(destDir + "/js"));
});


//Задача для запуска сервера.
gulp.task("browser-sync", function() {
	return browserSync.init({
		server: {
			baseDir: destDir
		}
	});
});
