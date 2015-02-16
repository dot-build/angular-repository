all:
	./node_modules/gulp/bin/gulp build

tdd:
	./node_modules/gulp/bin/gulp tdd

test:
	./node_modules/gulp/bin/gulp test

watch:
	./node_modules/gulp/bin/gulp default

.PHONY: all tdd test watch