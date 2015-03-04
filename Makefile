all:
	./node_modules/gulp/bin/gulp.js build

tdd:
	./node_modules/gulp/bin/gulp.js tdd

integration:
	./node_modules/gulp/bin/gulp.js integration

integration-tdd:
	./node_modules/gulp/bin/gulp.js integration-tdd

unit:
	./node_modules/gulp/bin/gulp.js unit

test:
	./node_modules/gulp/bin/gulp.js test

watch:
	./node_modules/gulp/bin/gulp.js default

apidoc:
	find ./test/unit -type f -name "*.spec.js" | xargs cat | grep describe | tee api.tmp;\
	node apidoc.js;\
	rm api.tmp;

.PHONY: all tdd test watch integration apidoc
