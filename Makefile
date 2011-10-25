ifndef DESTDIR
	DESTDIR=/tmp/to.yz.gcgogo
endif

JSFILES:=$(shell ls app/assistants/*.js)
CSSFILES:=$(shell ls stylesheets/*.css)
JAVA:=/usr/bin/env java
PACKAGE:=/usr/bin/env palm-package
DATE:=$(shell date "+%Y.%m.%d")
ALPHADATE:=$(shell date "+%Y.%j.%H")

build: clean
	@echo "Building Geocaching for webOS"
	mkdir -p $(DESTDIR)/app/assistants
	for i in $(JSFILES); do \
		echo "Compressing $$i"; \
		$(JAVA) -jar tools/yuicompressor-2.4.2.jar -o $(DESTDIR)/$$i --charset UTF-8 --type js $$i || exit 1; \
	done

	cp -r app/views $(DESTDIR)/app/
	cp -r images $(DESTDIR)/
	cp -r plugins $(DESTDIR)/
#	cp -r resources $(DESTDIR)/

	mkdir -p $(DESTDIR)/stylesheets
	for i in $(CSSFILES); do \
		echo "Compressing $$i"; \
		$(JAVA) -jar tools/yuicompressor-2.4.2.jar -o $(DESTDIR)/$$i --charset UTF-8 --type css $$i || exit 1; \
	done

	cp -r appinfo.json $(DESTDIR)/
	cp -r sources.json $(DESTDIR)/
	cp -r index.html $(DESTDIR)/
	cp -r *.png $(DESTDIR)/
#	rm $(DESTDIR)/*-beta.png 
	
	find $(DESTDIR) -type f -name "*~" -delete

	$(PACKAGE) $(DESTDIR) -o ./

beta: clean
	@echo "Building Geocaching for webOS BETA"
	mkdir -p $(DESTDIR)/app/assistants
	for i in $(JSFILES); do \
		echo "Installing $$i"; \
		cp $$i $(DESTDIR)/$$i; \
	done

	cp -r app/views $(DESTDIR)/app/
	cp -r images $(DESTDIR)/
	cp -r plugins $(DESTDIR)/
	# cp -r resources $(DESTDIR)/ # Resources are disabled

	mkdir -p $(DESTDIR)/stylesheets
	for i in $(CSSFILES); do \
		echo "Installing $$i"; \
		cp $$i $(DESTDIR)/$$i; \
	done

	cp -r appinfo.json $(DESTDIR)/
	cp -r sources.json $(DESTDIR)/
	cp -r index.html $(DESTDIR)/
	cp -r framework_config.json $(DESTDIR)/
	cp -r *.png $(DESTDIR)/
	mv $(DESTDIR)/icon-beta.png $(DESTDIR)/icon.png 
	mv $(DESTDIR)/icon32x32-beta.png $(DESTDIR)/icon32x32.png 
	mv $(DESTDIR)/icon64x64-beta.png $(DESTDIR)/icon64x64.png 
	
#	for z in `find  $(DESTDIR)/app/views/ -type f`; do\
#		sed -i -e 's/<div id="corner"><\/div>/<div id="corner" class="beta"><\/div>/' $$z; \
#	done

	sed -i -e 's/"com\.georgo\.org\.precaching"/"com.georgo.org.precaching.beta"/' $(DESTDIR)/appinfo.json
	sed -i -e 's/"title": "\(.*\)"/"title": "\1 BETA"/' $(DESTDIR)/appinfo.json
	sed -i -e 's/>Geocaching for webOS</>Geocaching for webOS BETA</' $(DESTDIR)/app/views/main/main-scene.html
	sed -i -e 's/"version": "\(.*\)"/"version": "$(DATE)"/' $(DESTDIR)/appinfo.json

	find $(DESTDIR) -type f -name "*~" -delete

	$(PACKAGE) $(DESTDIR) -o ./

alpha: clean
	@echo "Building Geocaching for webOS ALPHA"
	mkdir -p $(DESTDIR)/app/assistants
	for i in $(JSFILES); do \
		echo "Installing $$i"; \
		cp $$i $(DESTDIR)/$$i; \
	done

	cp -r app/views $(DESTDIR)/app/
	cp -r images $(DESTDIR)/
	cp -r plugins $(DESTDIR)/
	# cp -r resources $(DESTDIR)/ # Resources are disabled

	mkdir -p $(DESTDIR)/stylesheets
	for i in $(CSSFILES); do \
		echo "Installing $$i"; \
		cp $$i $(DESTDIR)/$$i; \
	done

	cp -r appinfo.json $(DESTDIR)/
	cp -r sources.json $(DESTDIR)/
	cp -r index.html $(DESTDIR)/
	cp -r framework_config.json $(DESTDIR)/
	cp -r *.png $(DESTDIR)/
	mv $(DESTDIR)/icon-alpha.png $(DESTDIR)/icon.png 
	mv $(DESTDIR)/icon32x32-alpha.png $(DESTDIR)/icon32x32.png 
	mv $(DESTDIR)/icon64x64-alpha.png $(DESTDIR)/icon64x64.png 
	
	for z in `find  $(DESTDIR)/app/views/ -type f`; do\
		sed -i -e 's/<div id="corner"><\/div>/<div id="corner" class="alpha"><\/div>/' $$z; \
	done

	sed -i -e 's/"com\.georgo\.org\.precaching"/"com.georgo.org.precaching.alpha"/' $(DESTDIR)/appinfo.json
	sed -i -e 's/"title": "\(.*\)"/"title": "\1 ALPHA"/' $(DESTDIR)/appinfo.json
	sed -i -e 's/>Geocaching for webOS</>Geocaching for webOS ALPHA</' $(DESTDIR)/app/views/main/main-scene.html
	sed -i -e 's/"version": "\(.*\)"/"version": "$(ALPHADATE)"/' $(DESTDIR)/appinfo.json

	find $(DESTDIR) -type f -name "*~" -delete

	$(PACKAGE) $(DESTDIR) -o ./


clean:
	@echo "Cleaning build directory"
	rm -rv $(DESTDIR) || true

