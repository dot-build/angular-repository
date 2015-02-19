all:
	./node_modules/gulp/bin/gulp.js build

tdd:
	./node_modules/gulp/bin/gulp.js tdd

integration:
	./node_modules/gulp/bin/gulp.js integration

test:
	./node_modules/gulp/bin/gulp.js test

watch:
	./node_modules/gulp/bin/gulp.js default

apidoc:
	find ./test/unit -type f -name "*.spec.js" | xargs cat | grep describe | tee a.tmp;
	cat a.tmp | sed s/\',\ function\(\)\ \{// | sed -r s/describe[\(]+[\']+[\#\:]+// | sed -r s/^describe[\(]+[\']+/\\n\\n\#\#\ / | tee API.md
	rm a.tmp;

.PHONY: all tdd test watch apidoc
