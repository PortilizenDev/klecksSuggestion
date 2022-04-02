// @ts-ignore
import {english, languages, loadLanguage, TTranslationCode} from '../../languages/languages';

export const LS_LANGUAGE_KEY = 'klecks-language';

export class LanguageStrings {
    private data: any;
    private listeners: (() => void)[] = [];
    private code: string;

    // --- public ----
    constructor () {
        // need to use setLanguage for a different language
        this.data = {...english};
        this.code = 'en';
    }

    async setLanguage (langCode: string): Promise<void> {
        if (langCode === 'en') {
            this.data = {...english};
        } else {
            this.data = {...english, ...(await loadLanguage(langCode))};
        }
        this.code = langCode;
        document.documentElement.setAttribute("lang", langCode);
        this.listeners.forEach(item => {
            item();
        });
    }

    get (code: TTranslationCode): string {
        if (!(code in this.data)) {
            throw new Error('translation code doesn\'t exist: ' + code);
        }
        return this.data[code];
    }

    getLanguage (): {code: string; name: string} {
        return languages.find(item => {
            return item.code === this.code;
        })
    }

    getCode (): string {
        return this.code;
    }

    // get notified on language change
    subscribe (subscriber: () => void) {
        if (this.listeners.includes(subscriber)) {
            return;
        }
        this.listeners.push(subscriber);
    }

    unsubscribe (subscriber: () => void) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (subscriber === this.listeners[i]) {
                this.listeners.splice(i, 1);
                return;
            }
        }
    }
}

let activeLanguageCode: string = 'en'; // active language code
{
    const langs: string[] = []; // from highest to lowest priority
    const navLangs = navigator.languages ? navigator.languages : [navigator.language];
    navLangs.forEach(item => {
        const split = item.split('-');
        langs.push(item);
        if (split.length === 2) {
            langs.push(split[0]);
        }
    });
    try {
        if (localStorage.getItem(LS_LANGUAGE_KEY)) {
            langs.unshift(localStorage.getItem(LS_LANGUAGE_KEY));
        }
    } catch (e) {
        // likely cookies disabled in Safari
    }
    for (let i = 0; i < langs.length; i++) {
        const lang = langs[i];
        if (languages.find(item => {
            return item.code.toLowerCase() === lang.toLowerCase();
        })) {
            activeLanguageCode = lang;
            break;
        }
    }
}

export const languageStrings = new LanguageStrings();

export const LANG = (code: TTranslationCode | null, replace?: {[key: string]: string}): string => {
    if (replace) {
        let result = languageStrings.get(code);
        const keyArr = Object.keys(replace);
        keyArr.forEach(key => {
            result = result.replace(`{${key}}`, replace[key]);
        });
        return result;
    } else {
        return languageStrings.get(code);
    }
};

export const initLANG = () => languageStrings.setLanguage(activeLanguageCode);