console.clear();

if ( ! knownLinks ) {
    console.error("Did not load known links");
} else {
    links = document.querySelectorAll("#bodyContent a");

    found = 0;

    links.forEach(l=>{
        if ( found !== 20 ) {
            href = l.getAttribute("href");
            if ( href.startsWith("//en.wikipedia.org/wiki/") ) {
                href = href.replace("//en.wikipedia.org/wiki/","");

               if ( href.endsWith("?action=edit&redlink=1") ) {
                    href = href.replace("?action=edit&redlink=1","");
                    if ( ! redLinks.includes(href) ) {
                        href = "\x1B[31;1073;1mredlink: \x1B[0m" + href;
                        console.log(href);
                        found++;
                    }
                } else {
                    if ( ! knownLinks.includes(href) ) {
                        console.log(href);
                        found++;
                    }
                }
            } else if ( href.startsWith("#cite_note-") ) {
                // citation link, ignore
            } else {
                if ( href.startsWith("/w/index.php?title=") && href.indexOf("&action=edit&section=") !== -1 ) {
                    // edit a section, ignore
                } else {
                    console.warn(href);
                    found++;
                }
            }
        }
    });
}