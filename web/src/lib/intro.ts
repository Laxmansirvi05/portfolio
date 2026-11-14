/** sessionStorage flag: the opening sequence has already played this session. */
export const SEEN_KEY = "ls-intro-seen";

/**
 * Runs in <head> before first paint: play the intro only on the home page, on the first visit of the session.
 * Sets <html data-intro="playing" | "done">, which the intro, hero reveal and particles read.
 */
export const INTRO_BOOT_SCRIPT = `try{document.documentElement.dataset.intro=location.pathname!=="/"||sessionStorage.getItem("${SEEN_KEY}")==="1"?"done":"playing"}catch(e){document.documentElement.dataset.intro=location.pathname!=="/"?"done":"playing"}`;
