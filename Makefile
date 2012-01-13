# makefile to automatize simple operations

server:
	python -m SimpleHTTPServer

deploy: build
	# assume there is something to commit
	# use "git diff --exit-code HEAD" to know if there is something to commit
	# so two lines: one if no commit, one if something to commit 
	git commit -a -m "New deploy" && git push -f origin HEAD:gh-pages && git reset HEAD~


build:	buildOrigFileList buildTmplFileList 
clean:	cleanOrigFileList cleanTmplFileList

buildOrigFileList:
	echo "var origFileList = ["	> data/origFileList.js
	(cd data/boilerplate.orig/ && find . -type f | awk '{print "\t\""$$1"\","}' | tee -a ../../data/origFileList.js)
	echo "];"			>> data/origFileList.js

cleanOrigFileList:
	rm -f data/origFileList.js

buildTmplFileList:
	echo "var tmplFileList = ["	> data/tmplFileList.js
	(cd data/boilerplate.tmpl/ && find . -type f | awk '{print "\t\""$$1"\","}' | tee -a ../../data/tmplFileList.js)
	echo "];"			>> data/tmplFileList.js

cleanTmplFileList:
	rm -f data/tmplFileList.js