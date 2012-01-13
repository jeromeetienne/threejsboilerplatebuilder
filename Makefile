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
	echo "var origFileList = ["	> origFileList.js
	(cd data/boilerplate.orig/ && find . -type f | awk '{print "\t\""$$1"\","}' | tee -a ../../origFileList.js)
	echo "];"			>> origFileList.js

cleanOrigFileList:
	rm origFileList.js

buildTmplFileList:
	echo "var tmplFileList = ["	> tmplFileList.js
	(cd data/boilerplate.tmpl/ && find . -type f | awk '{print "\t\""$$1"\","}' | tee -a ../../tmplFileList.js)
	echo "];"			>> tmplFileList.js

cleanTmplFileList:
	rm tmplFileList.js