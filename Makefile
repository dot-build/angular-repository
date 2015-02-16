all:
	./node_modules/gulp/bin/gulp.js build

tdd:
	./node_modules/gulp/bin/gulp.js tdd

test:
	./node_modules/gulp/bin/gulp.js test

watch:
	./node_modules/gulp/bin/gulp.js default

.PHONY: all tdd test watch