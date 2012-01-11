# makefile to automatize simple operations

server:
	python -m SimpleHTTPServer

deploy: build
	# assume there is something to commit
	# use "git diff --exit-code HEAD" to know if there is something to commit
	# so two lines: one if no commit, one if something to commit 
	git commit -a -m "New deploy" && git push -f origin HEAD:gh-pages && git reset HEAD~


build:	buildFilelist
clean:	cleanFilelist

buildFilelist:
	echo "var templateFilelist = ["	> templateFilelist.js
	(cd template/threejsboilerplate/ && find . -type f | awk '{print "\t\""$$1"\","}' | tee -a ../../templateFilelist.js)
	echo "];"			>> templateFilelist.js

cleanFilelist:
	rm templateFilelist.js