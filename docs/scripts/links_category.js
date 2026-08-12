console.clear();

if ( ! knownLinks ) {
    console.error("Did not load known links");
} else {
    links = document.querySelectorAll(".mw-category a:not(.CategoryTreeToggle)");

    found = 0;

    links.forEach(l=>{
        if ( found !== 20 ) {
            href = l.getAttribute("href");
            if ( ! href && ! l.classList.contains("CategoryTreeToggle") ) {
                console.error(l);
            } else if ( ! href && l.classList.contains("CategoryTreeToggle") ) {
                // category toggler - ignore
            } else {
                if ( href.startsWith("https://en.wikipedia.org/wiki/") ) {
                    href = href.replace("https://en.wikipedia.org/wiki/","");

                    if ( href.endsWith("?action=edit&redlink=1") ) {
                        href = href.replace("?action=edit&redlink=1","");
                        if ( ! redLinks.includes(href) ) {
                            href = "\x1B[31;1073;1mredlink: \x1B[0m" + href;
                            console.log(href);
                            found++;
                        }
                    } else if ( href.startsWith("Template_talk:") || href.startsWith("Special:EditPage/Template") ) {
                        // template talk/edit page, ignore
                    } else {
                        if ( ! knownLinks.includes(href) ) {
                            console.log(href);
                            found++;
                        }
                    }
                } else if ( href.startsWith("#cite_note-") || href.startsWith("#cite_ref-") ) {
                    // citation link, ignore
                } else if ( href.startsWith("#/map/") || href.endsWith("Maps_Terms_of_Use") || href.indexOf("www.openstreetmap.org") !== -1 || href.indexOf("geohack.toolforge.org") !== -1 ) {
                    // map interaction, ignore
                } else if ( href.indexOf("commons.wikimedia.org") !== -1 ) {
                    // wiki commons, ignore
                } else {
                    if ( href.startsWith("/w/index.php?title=") && href.indexOf("&action=edit&section=") !== -1 ) {
                        // edit a section, ignore
                    } else if ( href === "/wiki/Help:Category" ) {
                        // ignore
                    } else {
                        if ( href.startsWith("/wiki/") ) {
                            href = href.replace("/wiki/","");
                            if ( ! knownLinks.includes(href) ) {
                                console.log(href);
                                found++;
                            }
                        } else {
                            console.warn(href);
                            found++;
                        }
                    }
                }
            }
        }
    });
}