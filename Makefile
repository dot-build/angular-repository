all: build build-handbag
	;

build:
	./node_modules/gulp/bin/gulp.js build

build-handbag:
	./node_modules/gulp/bin/gulp.js buildhbag

tdd:
	./node_modules/gulp/bin/gulp.js tdd

test-integration:
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

release: build
	./node_modules/gulp/bin/gulp.js build;\
	if [ $$? -gt 0 ]; then\
		exit 1;\
	fi;\
	git add -A;\
	git commit -m "chore: prepare for release";\

.PHONY: build tdd test watch integration apidoc release
